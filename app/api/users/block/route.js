import { NextResponse } from 'next/server';
import { db } from '@/app/configs/db';
import { users, penalties, collectedPoints } from '@/app/configs/schema';
import { eq } from 'drizzle-orm';

// POST: Block user
export async function POST(request) {
  try {
    const { email, duration, reason } = await request.json();
    
    if (!email || !duration) {
      return NextResponse.json({ success: false, error: 'Email and duration are required' }, { status: 400 });
    }

    let blockedUntil = null;
    if (duration === '7') {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      blockedUntil = date.toISOString();
    } else if (duration === '30') {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      blockedUntil = date.toISOString();
    } else if (duration === 'perm') {
      blockedUntil = '9999-12-31T23:59:59.999Z';
    }

    await db.update(users)
      .set({ 
        isBlocked: true, 
        blockedUntil, 
        blockReason: reason || 'Suspicious activity or false emergency reports', 
        updatedAt: new Date().toISOString() 
      })
      .where(eq(users.email, email));

    return NextResponse.json({ 
      success: true, 
      message: `User blocked successfully for ${duration === 'perm' ? 'permanently' : duration + ' days'}` 
    });
  } catch (error) {
    console.error('Error blocking user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH: Unblock user with penalty
export async function PATCH(request) {
  try {
    const { email, doctorEmail, doctorName } = await request.json();
    
    if (!email || !doctorEmail || !doctorName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch current user data
    const existingUsers = await db.select().from(users).where(eq(users.email, email));
    if (!existingUsers.length) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const currentUser = existingUsers[0];
    const currentPoints = currentUser.points || 0;
    
    // Calculate penalty: user points kept at 10, rest taken as fine
    const penaltyAmount = Math.max(0, currentPoints - 10);

    // 1. Update user: reset points to 10 and lift block
    await db.update(users)
      .set({ 
        points: 10, 
        isBlocked: false, 
        blockedUntil: null, 
        blockReason: null, 
        updatedAt: new Date().toISOString() 
      })
      .where(eq(users.email, email));

    // 2. Log penalty in penalties table
    await db.insert(penalties).values({
      userEmail: email,
      userName: currentUser.name,
      doctorEmail: doctorEmail,
      doctorName: doctorName,
      amount: penaltyAmount,
      reason: 'Account unblocked; remaining points collected as fine.',
    });

    // 3. Log penalty in collected_points table
    await db.insert(collectedPoints).values({
      userEmail: email,
      userName: currentUser.name,
      petName: 'System Penalty',
      doctorEmail: doctorEmail,
      doctorName: doctorName,
      points: penaltyAmount,
      petIssue: 'False Emergency / Account Misuse Penalty',
      status: 'penalty'
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User unblocked successfully',
      penaltyCollected: penaltyAmount 
    });
  } catch (error) {
    console.error('Error unblocking user:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
