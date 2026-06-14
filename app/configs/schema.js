import { pgTable, serial, text, integer, date, timestamp, boolean, jsonb, foreignKey, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const petProfiles = pgTable('pet_profiles', {
  id: serial('id').primaryKey(),
  
  
  petName: text('pet_name').notNull(),
  species: text('species').notNull(),
  breed: text('breed'),
  gender: text('gender'),
  dateOfBirth: date('date_of_birth'),
  age: integer('age'),
  colorMarkings: text('color_markings'),
  petImageUrl: text('pet_image_url'), 
  
  
  weight: text('weight'),
  allergies: text('allergies'),
  chronicConditions: text('chronic_conditions'),
  currentMedications: text('current_medications'),
  vaccinationRecords: text('vaccination_records'),
  lastVetVisitDate: date('last_vet_visit_date'),
  
  
  dietType: text('diet_type'),
  exerciseLevel: text('exercise_level'),
  favoriteActivities: text('favorite_activities'),
  behaviorNotes: text('behavior_notes'),
  
  
  ownerName: text('owner_name').notNull(),
  ownerContact: text('owner_contact'),
  ownerEmail: text('owner_email'),
  address: text('address'),
  
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  
  
  petName: text('pet_name').notNull(),
  petProblem: text('pet_problem').notNull(),
  ownerName: text('owner_name').notNull(),
  ownerEmail: text('owner_email').notNull(),
  
  
  doctorName: text('doctor_name').notNull(),
  doctorEmail: text('doctor_email').notNull(),
  
  
  appointmentDate: text('appointment_date').notNull(),
  appointmentTime: text('appointment_time').notNull(),
  timeSlot: text('time_slot').notNull(), 
  
  
  petProfileDetails: text('pet_profile_details'),
  
  
  medicines: text('medicines').default('[]'), 
  
  
  status: text('status').default('pending'), 
  
  
  statusUpdated: boolean('status_updated').default(false),
  statusUpdateMessage: text('status_update_message'),
  
  
  pointsDeducted: boolean('points_deducted').default(false),
  
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


export const chats = pgTable('chats', {
  id: serial('id').primaryKey(),
  userEmail: text('user_email').notNull(),
  chatName: text('chat_name').notNull(),
  chatHistory: text('chat_history').default('[]'), 
  uploadedImage: text('uploaded_image'), 
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});



export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	points: integer('points').default(10).notNull(),
  isBlocked: boolean('is_blocked').default(false),
  blockedUntil: timestamp('blocked_until', { mode: 'string' }),
  blockReason: text('block_reason'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const penalties = pgTable('penalties', {
  id: serial('id').primaryKey(),
  userEmail: varchar('user_email').notNull(),
  userName: varchar('user_name').notNull(),
  doctorEmail: varchar('doctor_email').notNull(),
  doctorName: varchar('doctor_name').notNull(),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  createdAt: varchar('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const chatSessions = pgTable("chat_sessions", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	title: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "chat_sessions_user_id_users_id_fk"
		}),
]);

export const chatMessages = pgTable("chat_messages", {
	id: text().primaryKey().notNull(),
	sessionId: text("session_id").notNull(),
	role: text().notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.sessionId],
			foreignColumns: [chatSessions.id],
			name: "chat_messages_session_id_chat_sessions_id_fk"
		}),
]);

export const emailLogs = pgTable("email_logs", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	emailType: text("email_type").notNull(),
	recipientEmail: text("recipient_email").notNull(),
	subject: text().notNull(),
	content: text().notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }).defaultNow(),
	status: text().default('sent'),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "email_logs_user_id_users_id_fk"
		}),
]);


export const emergencySos = pgTable('emergency_sos', {
  id: serial('id').primaryKey(),
  userEmail: varchar('user_email').notNull(),
  userName: varchar('user_name').notNull(),
  description: text('description').notNull(),
  imageUrl: varchar('image_url'),
  status: varchar('status').default('pending').notNull(), 
  latitude: varchar('latitude'),
  longitude: varchar('longitude'),
  address: text('address'),
  createdAt: varchar('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const collectedPoints = pgTable('collected_points', {
  id: serial('id').primaryKey(),
  userEmail: varchar('user_email').notNull(),
  userName: varchar('user_name').notNull(),
  petName: varchar('pet_name').notNull(),
  doctorEmail: varchar('doctor_email').notNull(),
  doctorName: varchar('doctor_name').notNull(),
  points: integer('points').notNull(),
  petIssue: text('pet_issue').notNull(),
  appointmentId: integer('appointment_id'),
  status: varchar('status').default('collected').notNull(), 
  createdAt: varchar('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const doctors = pgTable('doctors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

