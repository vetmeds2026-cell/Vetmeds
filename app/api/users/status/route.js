import { NextResponse } from 'next/server';
import { db } from '@/app/configs/db';
import { users } from '@/app/configs/schema';
import { eq } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const userDetails = await db.select().from(users).where(eq(users.email, email));
    
    if (!userDetails.length) {
      return NextResponse.json({ success: true, data: { isBlocked: false } });
    }

    const user = userDetails[0];
    
    
    let isStillBlocked = user.isBlocked;
    if (user.isBlocked && user.blockedUntil) {
      if (new Date() > new Date(user.blockedUntil)) {
        isStillBlocked = false;
        
        await db.update(users).set({ isBlocked: false, blockedUntil: null }).where(eq(users.email, email));
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        isBlocked: isStillBlocked,
        blockedUntil: user.blockedUntil,
        blockReason: user.blockReason
      } 
    });
  } catch (error) {
    console.error('Error fetching user status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
