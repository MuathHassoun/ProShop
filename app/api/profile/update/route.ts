// app/api/profile/update/route.ts
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: Request) {
  try {
    const { userId, firstName, lastName, email, birthday } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const numericUserId = Number(userId);
    if (Number.isNaN(numericUserId)) {
      return NextResponse.json(
        { error: 'Invalid User ID format' },
        { status: 400 }
      );
    }

    const fullName = `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim();
    const formattedBirthday = birthday && birthday.trim() !== '' ? birthday : null;

    const rows = await query(
      `UPDATE users 
       SET full_name = $1, email = $2, birthday = $3 
       WHERE user_id = $4
       RETURNING user_id, full_name, email, birthday`,
      [fullName, email, formattedBirthday, numericUserId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: rows[0] });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
    console.error('Profile update error details:', error);
    
    return NextResponse.json(
      { error: 'Failed to update profile', details: errorMessage },
      { status: 500 }
    );
  }
}