
import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
    if (!sql) {
        return NextResponse.json(
            {
                status: 'error',
                message: 'DATABASE_URL is not configured',
            },
            { status: 500 }
        );
    }

    try {
        const result = await sql`
      SELECT
        1 AS connected,
        current_database() AS database,
        NOW() AS server_time
    `;

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            data: result[0],
        });
    } catch (error) {
        console.error('Database connection test failed:', error);

        return NextResponse.json(
            {
                status: 'error',
                message: 'Could not connect to database',
            },
            { status: 500 }
        );
    }
}
