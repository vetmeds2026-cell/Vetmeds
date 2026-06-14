import { NextResponse } from 'next/server';
import { db } from '@/app/configs/db';
import { emergencySos, users, penalties } from '@/app/configs/schema';
import { desc, eq } from 'drizzle-orm';
import { sendEmail, getEmergencyNotificationTemplate } from '@/app/lib/send-email';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    let query = db.select().from(emergencySos);
    
    
    
    if (userEmail) {
      query = query.where(eq(emergencySos.userEmail, userEmail));
    }
    
    const sosHistory = await query.orderBy(desc(emergencySos.createdAt));
    
    
    const enrichedHistory = await Promise.all(sosHistory.map(async (sos) => {
      const userDetails = await db.select().from(users).where(eq(users.email, sos.userEmail));
      const userPenalties = await db.select().from(penalties).where(eq(penalties.userEmail, sos.userEmail));
      
      const user = userDetails[0] || {};
      
      
      let isStillBlocked = user.isBlocked;
      if (user.isBlocked && user.blockedUntil) {
        if (new Date() > new Date(user.blockedUntil)) {
          isStillBlocked = false;
          
          await db.update(users).set({ isBlocked: false, blockedUntil: null }).where(eq(users.email, sos.userEmail));
        }
      }

      
      
      const userSosList = sosHistory.filter(s => s.userEmail === sos.userEmail);
      const appliedPenalties = userPenalties.filter(penalty => {
        const penaltyDate = new Date(penalty.createdAt);
        const possibleSos = userSosList.filter(s => new Date(s.createdAt) <= penaltyDate);
        if (possibleSos.length > 0) {
          
          return possibleSos[0].id === sos.id;
        }
        if (userSosList.length > 0) {
           return userSosList[userSosList.length - 1].id === sos.id;
        }
        return false;
      });

      return {
        ...sos,
        userStatus: {
          isBlocked: isStillBlocked,
          blockedUntil: user.blockedUntil,
          blockReason: user.blockReason,
          points: user.points || 0
        },
        penalties: appliedPenalties
      };
    }));
    
    return NextResponse.json({ success: true, data: enrichedHistory });
  } catch (error) {
    console.error('❌ Error fetching SOS history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch SOS history' },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const formData = await request.formData();
    const userEmail = formData.get('email');
    const userName = formData.get('name');
    const description = formData.get('message');
    const imageFile = formData.get('file');
    const latitude = formData.get('latitude');
    const longitude = formData.get('longitude');
    const address = formData.get('address');

    if (!userEmail || !userName || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    
    const userRecords = await db.select().from(users).where(eq(users.email, userEmail));
    if (userRecords.length > 0) {
      const user = userRecords[0];
      if (user.isBlocked) {
        if (user.blockedUntil && new Date() > new Date(user.blockedUntil)) {
          
          await db.update(users).set({ isBlocked: false, blockedUntil: null }).where(eq(users.email, userEmail));
        } else {
          const blockMsg = user.blockedUntil === '9999-12-31T23:59:59.999Z' 
            ? 'Account permanently restricted due to false emergency reports.'
            : `Account restricted until ${new Date(user.blockedUntil).toLocaleDateString()}. Reason: ${user.blockReason || 'Policy violation'}`;
          
          return NextResponse.json({ success: false, error: blockMsg }, { status: 403 });
        }
      }
    }

    let imageUrl = null;
    let attachments = [];

    
    if (imageFile && typeof imageFile === 'object' && imageFile.name) {
      try {
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = `data:${imageFile.type || 'image/jpeg'};base64,${buffer.toString('base64')}`;

        
        attachments.push({
          filename: imageFile.name || 'emergency_image.jpg',
          content: buffer
        });

        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = "emergency_sos";
        
        const cldFormData = new FormData();
        cldFormData.append("file", base64Image);
        cldFormData.append("upload_preset", uploadPreset);
        cldFormData.append("folder", "emergency_sos");

        const cldResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cldFormData,
        });

        const cldData = await cldResponse.json();
        if (cldData.secure_url) {
          imageUrl = cldData.secure_url;

        }
      } catch (uploadError) {
        console.error('⚠️ Cloudinary upload failed:', uploadError);
      }
    }

    
    const newSos = await db.insert(emergencySos).values({
      userEmail,
      userName,
      description,
      imageUrl,
      latitude,
      longitude,
      address,
      status: 'pending'
    }).returning();



    
    try {
      const emailHtml = getEmergencyNotificationTemplate({
        userName,
        userEmail,
        description,
        imageUrl,
        latitude,
        longitude,
        address
      });

      
      const doctorEmails = [
        process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC1,
        process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC2,
        process.env.NEXT_PUBLIC_SERVICE_EMAIL_DOC3
      ].filter(Boolean).join(', ');

      await sendEmail({
        to: doctorEmails,
        subject: `🚨 EMERGENCY: ${userName} - ${userEmail}`,
        html: emailHtml,
        doctorEmail: 'shrileela@vetmeds.com', 
        attachments
      });

    } catch (emailError) {
      console.error('⚠️ Failed to send emergency email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      data: newSos[0],
      message: 'Emergency sent successfully!' 
    });

  } catch (error) {
    console.error('❌ Error handling SOS:', error);
    return NextResponse.json(
      { success: false, error: `Failed to process SOS: ${error.message}` },
      { status: 500 }
    );
  }
}


export async function PATCH(request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing SOS ID or status' },
        { status: 400 }
      );
    }

    const updatedSos = await db.update(emergencySos)
      .set({ status })
      .where(eq(emergencySos.id, id))
      .returning();

    if (updatedSos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'SOS record not found' },
        { status: 404 }
      );
    }

    
    if (status === 'completed' || status === 'resolved') {
      try {
        const email = updatedSos[0].userEmail;
        let existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length === 0) {
          await db.insert(users).values({ id: email, email, name: updatedSos[0].userName, points: 60 });
        } else {
          await db.update(users).set({ points: existingUser[0].points + 50 }).where(eq(users.email, email));
        }
      } catch (pointsErr) {
        console.warn('⚠️ Failed to add points for emergency:', pointsErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedSos[0],
      message: `Emergency SOS marked as ${status}!`
    });
  } catch (error) {
    console.error('❌ Error updating SOS status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update SOS status' },
      { status: 500 }
    );
  }
}
