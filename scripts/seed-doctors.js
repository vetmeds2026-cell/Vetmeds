const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { pgTable, serial, text, timestamp } = require('drizzle-orm/pg-core');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const doctorsTable = pgTable('doctors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

const doctors = [
  {
    email: 'shrileela@vetmeds.com',
    password: 'shrileela@vetmeds.com',
    name: 'Dr. Shrileela'
  },
  {
    email: 'omkar@vetmeds.com',
    password: 'omkar@vetmeds.com',
    name: 'Dr. Omkar Veershaiv Wangi'
  },
  {
    email: 'sanchit@vetmeds.com',
    password: 'sanchit@vetmeds.com',
    name: 'Dr. Sanchit Mohite'
  }
];

async function seed() {
  const connectionString = process.env.NEXT_PUBLIC_DB_CONNECTION_STRING;
  if (!connectionString) {
    console.error('NEXT_PUBLIC_DB_CONNECTION_STRING is not defined');
    process.exit(1);
  }

  const sql = neon(connectionString);
  const db = drizzle(sql);

  console.log('Verifying table existence and seeding doctors...');

  try {
    // Try a simple select to check if table exists
    try {
        await sql`SELECT 1 FROM doctors LIMIT 1`;
        console.log('Table "doctors" exists.');
    } catch (e) {
        console.error('Table "doctors" does not exist or error querying it. Attempting to create it if possible (though push should have done it).');
        // If push failed, we might need the user to run it or I can try a raw SQL create if it's simple
        // But the best is to get push to work.
        throw e;
    }

    for (const doctor of doctors) {
      await db.insert(doctorsTable).values(doctor).onConflictDoNothing();
      console.log(`Seeded: ${doctor.name}`);
    }
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding process:', error);
  }
}

seed();
