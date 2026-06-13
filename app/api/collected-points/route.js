import { NextResponse } from 'next/server';
import { db } from '@/app/configs/db';
import { collectedPoints } from '@/app/configs/schema';
import { desc, eq, and } from 'drizzle-orm';

// GET - Fetch collected points for a specific doctor
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorEmail = searchParams.get('doctorEmail');
    
    let query = db.select().from(collectedPoints);
    
    if (doctorEmail) {
      if (doctorEmail === 'omkar@vetmeds.com') {
        const { or } = require('drizzle-orm');
        query = query.where(
          or(
            eq(collectedPoints.doctorEmail, doctorEmail),
            eq(collectedPoints.status, 'transferred')
          )
        );
      } else {
        query = query.where(eq(collectedPoints.doctorEmail, doctorEmail));
      }
    }
    
    const data = await query.orderBy(desc(collectedPoints.createdAt));
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching collected points:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

// POST - Add a new record of collected points
export async function POST(request) {
  try {
    const body = await request.json();
    
    if (!body.userEmail || !body.userName || !body.petName || !body.doctorEmail || !body.doctorName || !body.points || !body.petIssue) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newRecord = await db.insert(collectedPoints).values({
      userEmail: body.userEmail,
      userName: body.userName,
      petName: body.petName,
      doctorEmail: body.doctorEmail,
      doctorName: body.doctorName,
      points: body.points,
      petIssue: body.petIssue,
      status: 'collected'
    }).returning();

    return NextResponse.json({ success: true, data: newRecord[0] });
  } catch (error) {
    console.error('Error adding collected point record:', error);
    return NextResponse.json({ success: false, error: 'Failed to insert' }, { status: 500 });
  }
}

// PATCH - Transfer points to main doctor (mark as transferred)
export async function PATCH(request) {
  try {
    const { doctorEmail } = await request.json();
    
    if (!doctorEmail) {
      return NextResponse.json({ success: false, error: 'Missing doctorEmail' }, { status: 400 });
    }

    const updated = await db.update(collectedPoints)
      .set({ status: 'transferred' })
      .where(
        and(
          eq(collectedPoints.doctorEmail, doctorEmail),
          eq(collectedPoints.status, 'collected')
        )
      ).returning();

    // Credit the main doctor (Boss) in the users table
    if (updated.length > 0) {
      const totalPoints = updated.reduce((sum, item) => sum + item.points, 0);
      const bossEmail = 'omkar@vetmeds.com';
      
      try {
        let bossUser = await db.select().from(users).where(eq(users.email, bossEmail));
        if (bossUser.length > 0) {
          await db.update(users)
            .set({ points: (bossUser[0].points || 0) + totalPoints })
            .where(eq(users.email, bossEmail));

        }
      } catch (userErr) {
        console.warn('⚠️ Failed to credit boss user points:', userErr);
      }
    }

    return NextResponse.json({ success: true, data: updated, count: updated.length });
  } catch (error) {
    console.error('Error transferring points:', error);
    return NextResponse.json({ success: false, error: 'Failed to transfer' }, { status: 500 });
  }
}
