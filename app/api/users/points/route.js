import { NextResponse } from 'next/server';
import { db } from '@/app/configs/db';
import { users } from '@/app/configs/schema';
import { eq, sql } from 'drizzle-orm';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const name = searchParams.get('name') || 'Pet Parent';
    
    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }
    
    
    let existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length === 0) {
      
      const newUser = await db.insert(users).values({
        id: email, 
        email: email,
        name: name,
        points: 10
      }).returning();
      
      return NextResponse.json({ success: true, data: { points: newUser[0].points } });
    }
    
    return NextResponse.json({ success: true, data: { points: existingUser[0].points } });
  } catch (error) {
    console.error('Error fetching user points:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch points' },
      { status: 500 }
    );
  }
}


export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name = 'Pet Parent', pointsToAdd } = body;
    
    if (!email || pointsToAdd === undefined) {
      return NextResponse.json(
        { success: false, error: 'Email and pointsToAdd are required' },
        { status: 400 }
      );
    }

    
    let existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length === 0) {
      
      const newUser = await db.insert(users).values({
        id: email,
        email: email,
        name: name,
        points: Math.max(0, 10 + pointsToAdd)
      }).returning();
      
      return NextResponse.json({ 
        success: true, 
        message: 'User created and points added',
        data: { points: newUser[0].points } 
      });
    } else {
      
      const newPoints = Math.max(0, existingUser[0].points + pointsToAdd);
      
      const updatedUser = await db.update(users)
        .set({ points: newPoints, updatedAt: new Date() })
        .where(eq(users.email, email))
        .returning();
        
      return NextResponse.json({ 
        success: true, 
        message: 'Points updated successfully',
        data: { points: updatedUser[0].points } 
      });
    }
  } catch (error) {
    console.error('Error updating user points:', error);
    return NextResponse.json(
      { success: false, error: `Failed to update points: ${error.message}` },
      { status: 500 }
    );
  }
}
