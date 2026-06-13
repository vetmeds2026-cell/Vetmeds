import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

// Create database connection
const connectionString = process.env.NEXT_PUBLIC_DB_CONNECTION_STRING;

let db;

if (!connectionString) {
  console.warn('No database connection string found. Using in-memory fallback.');
  // Create a simple in-memory store for development
  const memoryStore = {
    petProfiles: []
  };
  
  db = {
    select: () => ({
      from: () => ({
        orderBy: () => memoryStore.petProfiles
      })
    }),
    insert: (table) => ({
      values: (data) => ({
        returning: () => {
          const newProfile = { id: Date.now(), ...data, createdAt: new Date(), updatedAt: new Date() };
          memoryStore.petProfiles.push(newProfile);
          return [newProfile];
        }
      })
    }),
    delete: (table) => ({
      where: (condition) => {
        const index = memoryStore.petProfiles.findIndex(p => p.id === condition.id);
        if (index > -1) {
          memoryStore.petProfiles.splice(index, 1);
        }
        return true;
      }
    })
  };
} else {
  const sql = neon(connectionString);
  db = drizzle(sql);
}

export { db };
