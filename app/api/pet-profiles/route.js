import { NextResponse } from 'next/server';
import { db } from '@/app/configs/db';
import { petProfiles, users } from '@/app/configs/schema';
import { desc, eq } from 'drizzle-orm';


// GET - Fetch pet profiles (optionally filtered by user email)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('userEmail');
    
    let profiles;
    if (userEmail) {
      // Filter profiles by user email
      profiles = await db.select().from(petProfiles)
        .where(eq(petProfiles.ownerEmail, userEmail))
        .orderBy(desc(petProfiles.createdAt));
    } else {
      // Fetch all profiles (fallback for admin or when no email provided)
      profiles = await db.select().from(petProfiles).orderBy(desc(petProfiles.createdAt));
    }
    
    return NextResponse.json({ success: true, data: profiles });
  } catch (error) {
    console.error('Error fetching pet profiles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch pet profiles' },
      { status: 500 }
    );
  }
}

// POST - Create a new pet profile
export async function POST(request) {
  try {
    const body = await request.json();
    

    
    // Validate required fields
    if (!body.petName || !body.species || !body.ownerName) {
      const missingFields = [];
      if (!body.petName) missingFields.push('petName');
      if (!body.species) missingFields.push('species');
      if (!body.ownerName) missingFields.push('ownerName');
      
      console.error('❌ Missing required fields:', missingFields);
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }



    const newProfile = await db.insert(petProfiles).values({
      petName: body.petName,
      species: body.species,
      breed: body.breed || null,
      gender: body.gender || null,
      dateOfBirth: body.dateOfBirth || null,
      age: body.age ? parseInt(body.age) : null,
      colorMarkings: body.colorMarkings || null,
      petImageUrl: body.petImageUrl || null,
      weight: body.weight || null,
      allergies: body.allergies || null,
      chronicConditions: body.chronicConditions || null,
      currentMedications: body.currentMedications || null,
      vaccinationRecords: body.vaccinationRecords || null,
      lastVetVisitDate: body.lastVetVisitDate || null,
      dietType: body.dietType || null,
      exerciseLevel: body.exerciseLevel || null,
      favoriteActivities: body.favoriteActivities || null,
      behaviorNotes: body.behaviorNotes || null,
      ownerName: body.ownerName,
      ownerContact: body.ownerContact || null,
      ownerEmail: body.ownerEmail || null,
      address: body.address || null,
    }).returning();



    // Grant 20 points to the user for creating a profile
    try {
      if (body.ownerEmail) {
        let existingUser = await db.select().from(users).where(eq(users.email, body.ownerEmail));
        if (existingUser.length === 0) {
          await db.insert(users).values({ id: body.ownerEmail, email: body.ownerEmail, name: body.ownerName, points: 30 }); // 10 def + 20
        } else {
          await db.update(users).set({ points: existingUser[0].points + 20 }).where(eq(users.email, body.ownerEmail));
        }
      }
    } catch (pointsErr) {
      console.warn('⚠️ Failed to add points:', pointsErr);
    }

    return NextResponse.json({ 
      success: true, 
      data: newProfile[0],
      message: 'Pet profile created successfully!' 
    });
  } catch (error) {
    console.error('❌ Error creating pet profile:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { success: false, error: `Failed to create pet profile: ${error.message}` },
      { status: 500 }
    );
  }
}

// PUT - Update an existing pet profile
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required for updates' },
        { status: 400 }
      );
    }



    // Prepare data for update (handling parsing where necessary)
    const valuesToUpdate = {
      petName: updateData.petName,
      species: updateData.species,
      breed: updateData.breed || null,
      gender: updateData.gender || null,
      dateOfBirth: updateData.dateOfBirth || null,
      age: updateData.age ? parseInt(updateData.age) : null,
      colorMarkings: updateData.colorMarkings || null,
      petImageUrl: updateData.petImageUrl || null,
      weight: updateData.weight || null,
      allergies: updateData.allergies || null,
      chronicConditions: updateData.chronicConditions || null,
      currentMedications: updateData.currentMedications || null,
      vaccinationRecords: updateData.vaccinationRecords || null,
      lastVetVisitDate: updateData.lastVetVisitDate || null,
      dietType: updateData.dietType || null,
      exerciseLevel: updateData.exerciseLevel || null,
      favoriteActivities: updateData.favoriteActivities || null,
      behaviorNotes: updateData.behaviorNotes || null,
      ownerName: updateData.ownerName,
      ownerContact: updateData.ownerContact || null,
      ownerEmail: updateData.ownerEmail || null,
      address: updateData.address || null,
    };

    const updatedProfile = await db.update(petProfiles)
      .set(valuesToUpdate)
      .where(eq(petProfiles.id, parseInt(id)))
      .returning();

    if (updatedProfile.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }



    return NextResponse.json({ 
      success: true, 
      data: updatedProfile[0],
      message: 'Pet profile updated successfully!' 
    });
  } catch (error) {
    console.error('❌ Error updating pet profile:', error);
    return NextResponse.json(
      { success: false, error: `Failed to update pet profile: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Delete a pet profile
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Profile ID is required' },
        { status: 400 }
      );
    }

    await db.delete(petProfiles).where(eq(petProfiles.id, parseInt(id)));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Pet profile deleted successfully!' 
    });
  } catch (error) {
    console.error('Error deleting pet profile:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete pet profile' },
      { status: 500 }
    );
  }
}
