import { pgTable, foreignKey, text, timestamp, boolean, serial, date, integer, jsonb, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



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

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	name: text().notNull(),
	points: integer('points').default(10).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

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
	status: varchar('status').default('collected').notNull(), 
	createdAt: varchar('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const petAppointments = pgTable("pet_appointments", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	petName: text("pet_name").notNull(),
	petType: text("pet_type").notNull(),
	appointmentDate: timestamp("appointment_date", { mode: 'string' }).notNull(),
	appointmentTime: text("appointment_time").notNull(),
	reason: text().notNull(),
	status: text().default('scheduled'),
	emailSent: boolean("email_sent").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "pet_appointments_user_id_users_id_fk"
	}),
]);

export const petProfiles = pgTable("pet_profiles", {
	id: serial().primaryKey().notNull(),
	petName: text("pet_name").notNull(),
	species: text().notNull(),
	breed: text(),
	gender: text(),
	dateOfBirth: date("date_of_birth"),
	age: integer(),
	colorMarkings: text("color_markings"),
	weight: text(),
	allergies: text(),
	chronicConditions: text("chronic_conditions"),
	currentMedications: text("current_medications"),
	vaccinationRecords: text("vaccination_records"),
	lastVetVisitDate: date("last_vet_visit_date"),
	dietType: text("diet_type"),
	exerciseLevel: text("exercise_level"),
	favoriteActivities: text("favorite_activities"),
	behaviorNotes: text("behavior_notes"),
	ownerName: text("owner_name").notNull(),
	ownerContact: text("owner_contact"),
	ownerEmail: text("owner_email"),
	address: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	petImageUrl: text("pet_image_url"),
});

export const appointments = pgTable("appointments", {
	id: serial().primaryKey().notNull(),
	petName: text("pet_name").notNull(),
	petProblem: text("pet_problem").notNull(),
	ownerName: text("owner_name").notNull(),
	ownerEmail: text("owner_email").notNull(),
	doctorName: text("doctor_name").notNull(),
	doctorEmail: text("doctor_email").notNull(),
	appointmentDate: text("appointment_date").notNull(),
	appointmentTime: text("appointment_time").notNull(),
	timeSlot: text("time_slot").notNull(),
	petProfileDetails: text("pet_profile_details"),
	status: text().default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	statusUpdated: boolean("status_updated").default(false),
	statusUpdateMessage: text("status_update_message"),
	medicines: jsonb().default([]),
	pointsDeducted: boolean("points_deducted").default(false),
});

export const doctors = pgTable("doctors", {
	id: serial().primaryKey().notNull(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	password: text("password").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

