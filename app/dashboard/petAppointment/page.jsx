import { currentUser } from "@clerk/nextjs/server";
import { db } from '@/app/configs/db';
import { appointments, collectedPoints } from '@/app/configs/schema';
import { desc, eq } from 'drizzle-orm';
import AppointmentClient from "./_components/AppointmentClient";

export const dynamic = 'force-dynamic';

export default async function AppointmentPage() {
  let userEmail = null;
  let initialAppointments = [];

  try {
    const user = await currentUser();
    userEmail = user?.emailAddresses?.[0]?.emailAddress;

    if (userEmail) {
      // Fetch appointments
      const data = await db.select().from(appointments)
        .where(eq(appointments.ownerEmail, userEmail))
        .orderBy(desc(appointments.createdAt));

      // Fetch collected points for this user to link with appointments
      const pointsData = await db.select().from(collectedPoints)
        .where(eq(collectedPoints.userEmail, userEmail));
        
      // Safely serialize data and link points
      initialAppointments = data.map(apt => {
        // Find if there's a matching point record (match by petName and issue)
        const match = pointsData.find(p => 
          p.petName === apt.petName && 
          (p.petIssue === apt.petProblem || apt.petProblem.includes(p.petIssue))
        );

        return {
          ...apt,
          pointsCollected: match ? match.points : null,
          createdAt: apt.createdAt?.toString(),
          updatedAt: apt.updatedAt?.toString(),
        };
      });
    }
  } catch (error) {
    console.error('Error in AppointmentPage:', error);
  }

  return (
    <AppointmentClient 
      initialAppointments={initialAppointments}
      userEmail={userEmail}
    />
  );
}
