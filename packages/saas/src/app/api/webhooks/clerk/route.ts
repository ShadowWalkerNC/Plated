/**
 * Clerk webhook handler
 *
 * Events handled:
 *   user.created  — sends welcome email
 *   user.deleted  — hard-deletes all user data (GDPR)
 *
 * Signature verification uses svix (Clerk’s webhook library).
 */
import { Webhook }        from 'svix';
import { NextResponse }   from 'next/server';
import { sendWelcome }    from '@/lib/email/send';
import { deleteUserData } from '@/lib/db/queries';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
const BASE_URL       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.plated.io';

type ClerkEvent = {
  type: string;
  data: Record<string, unknown>;
};

export async function POST(req: Request) {
  const body    = await req.text();
  const svixId  = req.headers.get('svix-id')        ?? '';
  const svixTs  = req.headers.get('svix-timestamp') ?? '';
  const svixSig = req.headers.get('svix-signature') ?? '';

  let event: ClerkEvent;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTs,
      'svix-signature': svixSig,
    }) as ClerkEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'user.created': {
        const user      = event.data;
        const emails    = user.email_addresses as Array<{ email_address: string }> | undefined;
        const email     = emails?.[0]?.email_address;
        const firstName = (user.first_name as string | null) ?? '';
        const lastName  = (user.last_name  as string | null) ?? '';
        const name      = [firstName, lastName].filter(Boolean).join(' ') || 'there';
        if (email) {
          await sendWelcome(email, name, `${BASE_URL}/dashboard`).catch(console.error);
        }
        break;
      }

      case 'user.deleted': {
        const userId = event.data.id as string | undefined;
        if (!userId) break;
        await deleteUserData(userId);
        break;
      }
    }
  } catch (err) {
    console.error('[clerk-webhook]', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
