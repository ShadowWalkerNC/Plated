import { db }                from '../db/client.js';
import { customDomains }    from '../db/schema.js';
import { eq, and }          from 'drizzle-orm';
import { promises as dns }  from 'node:dns';

/**
 * Verify a domain's TXT record contains the Plated verification token.
 * Resolves { verified: boolean; reason?: string }.
 */
export async function verifyDomainOwnership(
  domain: string,
  token: string,
): Promise<{ verified: boolean; reason?: string }> {
  try {
    const records = await dns.resolveTxt(`_plated.${domain}`);
    const flat    = records.flat();
    const found   = flat.some((r) => r === `plated-verify=${token}`);
    if (found) return { verified: true };
    return { verified: false, reason: `TXT record _plated.${domain} not found or token mismatch.` };
  } catch (err) {
    return { verified: false, reason: `DNS lookup failed: ${err instanceof Error ? err.message : String(err)}` };
  }
}

/**
 * Run verification and, if successful, mark the domain verified in the DB.
 */
export async function checkAndMarkVerified(
  domainId: string,
  userId: string,
): Promise<{ verified: boolean; reason?: string }> {
  const rows = await db
    .select()
    .from(customDomains)
    .where(and(eq(customDomains.id, domainId), eq(customDomains.userId, userId)))
    .limit(1);

  const row = rows[0];
  if (!row) return { verified: false, reason: 'Domain record not found.' };
  if (row.verified) return { verified: true };

  const result = await verifyDomainOwnership(row.domain, row.verificationToken);
  if (!result.verified) return result;

  await db.update(customDomains)
    .set({ verified: true, verifiedAt: new Date(), updatedAt: new Date() })
    .where(eq(customDomains.id, domainId));

  return { verified: true };
}
