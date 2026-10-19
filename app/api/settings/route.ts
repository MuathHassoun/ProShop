// app/api/settings/route.ts
import { NextResponse } from 'next/server';
import { query, sql } from '@/lib/db';
import type { SavedPaymentMethod, SavedShippingAddress } from '@/types';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

const CARD_BRANDS = ['Visa', 'Mastercard', 'American Express', 'Other'];
const PAYMENT_PROVIDER = 'saved_card';

function parseId(value: unknown): number | null {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

const clean = (value: unknown, max: number) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export async function GET(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const userId = parseId(new URL(request.url).searchParams.get('userId'));
  if (!userId) return fail('Valid userId is required', 400);

  try {
    const [addresses, payments] = await Promise.all([
      query<SavedShippingAddress>(
        `SELECT recipient_name, phone, country, city, zip_code, street_address, address_details
         FROM shipping_addresses
         WHERE user_id = $1 AND is_default = TRUE`,
        [userId]
      ),
      query<SavedPaymentMethod>(
        `SELECT card_brand, last_four, exp_month, exp_year
         FROM payment_methods
         WHERE user_id = $1 AND provider = $2
         LIMIT 1`,
        [userId, PAYMENT_PROVIDER]
      ),
    ]);

    return NextResponse.json({ address: addresses[0] ?? null, payment: payments[0] ?? null });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return fail('Could not load your settings', 500);
  }
}

export async function PUT(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const body = await request.json().catch(() => null);
  const userId = parseId(body?.userId);
  if (!userId) return fail('Valid userId is required', 400);

  const data = body?.data ?? {};

  try {
    if (body?.section === 'address') {
      const address = {
        recipient_name: clean(data.recipient_name, 150),
        phone: clean(data.phone, 30),
        country: clean(data.country, 100),
        city: clean(data.city, 100),
        zip_code: clean(data.zip_code, 20),
        street_address: clean(data.street_address, 255),
        address_details: clean(data.address_details, 1000),
      };

      if (!address.recipient_name || !address.country || !address.city || !address.street_address) {
        return fail('Name, country, city and street address are required', 400);
      }

      const rows = await query<SavedShippingAddress>(
        `INSERT INTO shipping_addresses
           (user_id, recipient_name, phone, country, city, zip_code, street_address, address_details, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
         ON CONFLICT (user_id) WHERE is_default = TRUE
         DO UPDATE SET
           recipient_name = EXCLUDED.recipient_name,
           phone = EXCLUDED.phone,
           country = EXCLUDED.country,
           city = EXCLUDED.city,
           zip_code = EXCLUDED.zip_code,
           street_address = EXCLUDED.street_address,
           address_details = EXCLUDED.address_details
         RETURNING recipient_name, phone, country, city, zip_code, street_address, address_details`,
        [
          userId,
          address.recipient_name,
          address.phone || null,
          address.country,
          address.city,
          address.zip_code || null,
          address.street_address,
          address.address_details || null,
        ]
      );

      return NextResponse.json({ success: true, address: rows[0] });
    }

    if (body?.section === 'payment') {
      const cardBrand = clean(data.card_brand, 30);
      const lastFour = clean(data.last_four, 4);
      const expMonth = Number(data.exp_month);
      const expYear = Number(data.exp_year);

      if (!CARD_BRANDS.includes(cardBrand)) return fail('Choose a card type', 400);
      if (!/^\d{4}$/.test(lastFour)) return fail('Enter the last 4 digits of the card', 400);
      if (!Number.isInteger(expMonth) || expMonth < 1 || expMonth > 12) {
        return fail('Choose a valid expiry month', 400);
      }

      const now = new Date();
      if (
        !Number.isInteger(expYear) ||
        expYear < now.getFullYear() ||
        (expYear === now.getFullYear() && expMonth < now.getMonth() + 1)
      ) {
        return fail('This card has expired', 400);
      }

      const rows = await query<SavedPaymentMethod>(
        `INSERT INTO payment_methods
           (user_id, provider, provider_payment_method_id, card_brand, last_four, exp_month, exp_year)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (provider, provider_payment_method_id)
         DO UPDATE SET
           card_brand = EXCLUDED.card_brand,
           last_four = EXCLUDED.last_four,
           exp_month = EXCLUDED.exp_month,
           exp_year = EXCLUDED.exp_year
         RETURNING card_brand, last_four, exp_month, exp_year`,
        [userId, PAYMENT_PROVIDER, `settings-${userId}`, cardBrand, lastFour, expMonth, expYear]
      );

      return NextResponse.json({ success: true, payment: rows[0] });
    }

    return fail('Unknown settings section', 400);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === '23503') return fail('User not found', 404);
    console.error('Settings save error:', error);
    return fail('Could not save your settings', 500);
  }
}

export async function DELETE(request: Request) {
  if (!sql) return fail('Database is not configured', 500);

  const params = new URL(request.url).searchParams;
  const userId = parseId(params.get('userId'));
  const section = params.get('section');
  if (!userId) return fail('Valid userId is required', 400);

  try {
    if (section === 'address') {
      await query('DELETE FROM shipping_addresses WHERE user_id = $1 AND is_default = TRUE', [userId]);
    } else if (section === 'payment') {
      await query('DELETE FROM payment_methods WHERE user_id = $1 AND provider = $2', [
        userId,
        PAYMENT_PROVIDER,
      ]);
    } else {
      return fail('Unknown settings section', 400);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings delete error:', error);
    return fail('Could not remove this item', 500);
  }
}
