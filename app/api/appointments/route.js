import { NextResponse } from 'next/server';
import { db } from '@/app/configs/db';
import { appointments, users, collectedPoints } from '@/app/configs/schema';
import { desc, eq, or } from 'drizzle-orm';
import { sendEmail, getDoctorNotificationTemplate, getUserNotificationTemplate } from '@/app/lib/send-email';

// GET - Fetch appointments (optionally filtered by user email, doctor email, or appointment date)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ownerEmail = searchParams.get('ownerEmail');
    const doctorEmail = searchParams.get('doctorEmail');
    const appointmentDate = searchParams.get('appointmentDate');
    
    let query = db.select().from(appointments);
    
    // Apply filters if provided
    let filters = [];
    if (ownerEmail) filters.push(eq(appointments.ownerEmail, ownerEmail));
    if (doctorEmail) filters.push(eq(appointments.doctorEmail, doctorEmail));
    if (appointmentDate) filters.push(eq(appointments.appointmentDate, appointmentDate));
    
    if (filters.length > 0) {
      query = query.where(filters.length === 1 ? filters[0] : or(...filters));
    }
    
    // Order by creation date
    query = query.orderBy(desc(appointments.createdAt));
    
    const appointmentsList = await query;

    // Fetch collected points to link
    const allPoints = await db.select().from(collectedPoints);
    
    const enrichedData = appointmentsList.map(apt => {
      const match = allPoints.find(p => 
        p.userEmail === apt.ownerEmail && 
        p.petName === apt.petName && 
        (p.petIssue === apt.petProblem || apt.petProblem.includes(p.petIssue))
      );
      return {
        ...apt,
        pointsCollected: match ? match.points : null
      };
    });
    
    return NextResponse.json({ success: true, data: enrichedData });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch appointments' },
      { status: 500 }
    );
  }
}

// POST - Create a new appointment
export async function POST(request) {
  try {
    const body = await request.json();
    

    
    // Validate required fields
    if (!body.petName || !body.petProblem || !body.ownerName || !body.ownerEmail || 
        !body.doctorName || !body.doctorEmail || !body.appointmentDate || 
        !body.appointmentTime || !body.timeSlot) {
      const missingFields = [];
      if (!body.petName) missingFields.push('petName');
      if (!body.petProblem) missingFields.push('petProblem');
      if (!body.ownerName) missingFields.push('ownerName');
      if (!body.ownerEmail) missingFields.push('ownerEmail');
      if (!body.doctorName) missingFields.push('doctorName');
      if (!body.doctorEmail) missingFields.push('doctorEmail');
      if (!body.appointmentDate) missingFields.push('appointmentDate');
      if (!body.appointmentTime) missingFields.push('appointmentTime');
      if (!body.timeSlot) missingFields.push('timeSlot');
      
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }



    const newAppointment = await db.insert(appointments).values({
      petName: body.petName,
      petProblem: body.petProblem,
      ownerName: body.ownerName,
      ownerEmail: body.ownerEmail,
      doctorName: body.doctorName,
      doctorEmail: body.doctorEmail,
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      timeSlot: body.timeSlot,
      petProfileDetails: body.petProfileDetails || null,
      status: body.status || 'pending',
    }).returning();



    // Send Email Notification to Doctor
    if (newAppointment[0] && newAppointment[0].doctorEmail && newAppointment[0].doctorEmail !== 'undefined') {
      try {
        const emailHtml = getDoctorNotificationTemplate(newAppointment[0]);
        await sendEmail({
          to: newAppointment[0].doctorEmail,
          subject: `New Appointment: ${newAppointment[0].petName || 'New Pet'} - ${new Date(newAppointment[0].appointmentDate).toLocaleDateString()}`,
          html: emailHtml,
          doctorEmail: newAppointment[0].doctorEmail
        });

      } catch (emailError) {
        console.error('⚠️ Failed to send doctor notification email:', emailError);
      }
    } else {
      console.warn('⚠️ Skipping doctor email: invalid doctorEmail or appointment data', newAppointment[0]);
    }

    return NextResponse.json({ 
      success: true, 
      data: newAppointment[0],
      message: 'Appointment created successfully!' 
    });
  } catch (error) {
    console.error('❌ Error creating appointment:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { success: false, error: `Failed to create appointment: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete an appointment
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID is required' },
        { status: 400 }
      );
    }

    await db.delete(appointments).where(eq(appointments.id, parseInt(id)));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Appointment deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}

// PATCH - Update appointment status and medicines
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { id, status, medicines, pointsDeducted } = body;
    
    if (!id || (!status && !medicines && pointsDeducted === undefined)) {
      return NextResponse.json(
        { success: false, error: 'ID and either status, medicines or pointsDeducted are required' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status value' },
          { status: 400 }
        );
      }
    }



    // Prepare update data
    const updateData = {
      updatedAt: new Date()
    };

    // Add status update if provided
    if (status) {
      updateData.status = status;
      updateData.statusUpdated = true;
      updateData.statusUpdateMessage = `Your appointment status has been updated to ${status.toUpperCase()}`;
    }

    // Add medicines if provided
    if (medicines) {
      updateData.medicines = JSON.stringify(medicines);
    }

    // Add pointsDeducted flag if provided
    if (pointsDeducted !== undefined) {
      updateData.pointsDeducted = pointsDeducted;
    }

    // Update appointment
    const updatedAppointment = await db
      .update(appointments)
      .set(updateData)
      .where(eq(appointments.id, parseInt(id)))
      .returning();



    // Send Email Notification to Pet Owner if status changed
    if (status && (status === 'confirmed' || status === 'cancelled' || status === 'completed')) {
      try {
        const emailHtml = getUserNotificationTemplate(updatedAppointment[0]);
        await sendEmail({
          to: updatedAppointment[0].ownerEmail,
          subject: `Appointment Update: ${updatedAppointment[0].petName} is ${status.toUpperCase()}`,
          html: emailHtml,
          doctorEmail: updatedAppointment[0].doctorEmail
        });

      } catch (emailError) {
        console.error('⚠️ Failed to send user notification email:', emailError);
      }
    }

    // Grant 10 points when appointment is confirmed
    if (status === 'confirmed') {
      try {
        const email = updatedAppointment[0].ownerEmail;
        let existingUser = await db.select().from(users).where(eq(users.email, email));
        if (existingUser.length === 0) {
          await db.insert(users).values({ id: email, email, name: updatedAppointment[0].ownerName, points: 20 }); // 10 default + 10 granted = 20
        } else {
          await db.update(users).set({ points: existingUser[0].points + 10 }).where(eq(users.email, email));
        }
      } catch (pointsErr) {
        console.warn('⚠️ Failed to add points for confirmed appointment:', pointsErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedAppointment[0],
      message: status ? `Appointment status updated to ${status}` : 'Medicines updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating appointment:', error);
    return NextResponse.json(
      { success: false, error: `Failed to update appointment: ${error.message}` },
      { status: 500 }
    );
  }
}
