import { relations } from "drizzle-orm/relations";
import { users, chatSessions, chatMessages, emailLogs, petAppointments } from "./schema";

export const chatSessionsRelations = relations(chatSessions, ({one, many}) => ({
	user: one(users, {
		fields: [chatSessions.userId],
		references: [users.id]
	}),
	chatMessages: many(chatMessages),
}));

export const usersRelations = relations(users, ({many}) => ({
	chatSessions: many(chatSessions),
	emailLogs: many(emailLogs),
	petAppointments: many(petAppointments),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatSession: one(chatSessions, {
		fields: [chatMessages.sessionId],
		references: [chatSessions.id]
	}),
}));

export const emailLogsRelations = relations(emailLogs, ({one}) => ({
	user: one(users, {
		fields: [emailLogs.userId],
		references: [users.id]
	}),
}));

export const petAppointmentsRelations = relations(petAppointments, ({one}) => ({
	user: one(users, {
		fields: [petAppointments.userId],
		references: [users.id]
	}),
}));