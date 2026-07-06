import { Webhook }        from 'svix';
import { NextResponse }   from 'next/server';
import { sendWelcome }    from '@/lib/email/send';

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!;
const BASE_URL       = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.nexcms.io';

export async function POST(req: Request) {
  const body      = await req.text();
  const svixId    = req.headers.get('svix-id')        ?? '';
  const svixTs    = req.headers.get('svix-timestamp') ?? '';
  const svixSig   = req.headers.get('svix-signature') ?? '';

  let event: { type: string; data: Record<string, any> };
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    event = wh.verify(body, { 'svix-id': svixId, 'svix-timestamp': svixTs, 'svix-signature': svixSig }) as typeof event;
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'user.created') {
    const user       = event.data;
    const email      = user.email_addresses?.[0]?.email_address as string | undefined;
    const firstName  = (user.first_name as string | null) ?? '';
    const lastName   = (user.last_name  as string | null) ?? '';
    const name       = [firstName, lastName].filter(Boolean).join(' ') || 'there';

    if (email) {
      await sendWelcome(email, name, `${BASE_URL}/dashboard`).catch(console.error);
    }
  }

  return NextResponse.json({ received: true });
}
