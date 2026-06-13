import { currentUser } from "@clerk/nextjs/server";
import { db } from '@/app/configs/db';
import { petProfiles } from '@/app/configs/schema';
import { desc, eq } from 'drizzle-orm';
import ProfileClient from "./_components/ProfileClient";

export const dynamic = 'force-dynamic';


export default async function ProfilePage() {
  const user = await currentUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress;
  const userName = user?.fullName;


  let initialProfiles = [];
  if (userEmail) {
    try {
      initialProfiles = await db.select().from(petProfiles)
        .where(eq(petProfiles.ownerEmail, userEmail))
        .orderBy(desc(petProfiles.createdAt));
    } catch (error) {
      console.error('Error pre-fetching pet profiles:', error);
    }
  }

  return (
    <ProfileClient 
      initialProfiles={initialProfiles} 
      userEmail={userEmail} 
      userName={userName} 
    />
  );
}
