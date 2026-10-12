// lib/db.ts
import { neon } from '@neondatabase/serverless';
const databaseUrl = process.env.DATABASE_URL;

// Neon Serverless SQL Client
export const sql = databaseUrl ? neon(databaseUrl) : null;

/**
 * Helper function to run parameterized SQL queries using Neon's query method
 */
export async function query<T = Record<string, unknown>>(
  queryString: string,
  params: (string | number | boolean | null)[] = []
): Promise<T[]> {
  if (!databaseUrl || !sql) {
    console.warn(
      'DATABASE_URL is not set in environment variables. Please check your .env.local file.'
    );
    return [];
  }

  try {
    const result = await sql.query(queryString, params);
    return result as unknown as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}
