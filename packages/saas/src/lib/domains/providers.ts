/**
 * Add a custom domain to a Vercel project.
 * Requires VERCEL_TOKEN and the Vercel project name/id.
 */
export async function addDomainToVercel(
  domain: string,
  vercelProjectId: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const token  = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token) return { ok: false, error: 'VERCEL_TOKEN not configured.' };

  const qs  = teamId ? `?teamId=${teamId}` : '';
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${vercelProjectId}/domains${qs}`,
    {
      method:  'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: domain }),
    },
  );

  if (!res.ok) {
    const e = await res.json() as { error?: { message?: string } };
    return { ok: false, error: e?.error?.message ?? 'Vercel domain add failed.' };
  }
  const data = await res.json() as { name: string; apexName?: string };
  return { ok: true, id: data.name };
}

/**
 * Add a custom domain to a Netlify site.
 */
export async function addDomainToNetlify(
  domain: string,
  netlifyProjectId: string,
): Promise<{ ok: boolean; id?: string; error?: string }> {
  const token = process.env.NETLIFY_TOKEN;
  if (!token) return { ok: false, error: 'NETLIFY_TOKEN not configured.' };

  const res = await fetch(
    `https://api.netlify.com/api/v1/sites/${netlifyProjectId}`,
    {
      method:  'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ custom_domain: domain }),
    },
  );

  if (!res.ok) {
    const e = await res.json() as { message?: string };
    return { ok: false, error: e?.message ?? 'Netlify domain add failed.' };
  }
  const data = await res.json() as { id: string };
  return { ok: true, id: data.id };
}

/**
 * Remove a custom domain from a Vercel project.
 */
export async function removeDomainFromVercel(
  domain: string,
  vercelProjectId: string,
): Promise<{ ok: boolean; error?: string }> {
  const token  = process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token) return { ok: false, error: 'VERCEL_TOKEN not configured.' };

  const qs  = teamId ? `?teamId=${teamId}` : '';
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${vercelProjectId}/domains/${domain}${qs}`,
    { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  );

  return res.ok || res.status === 404
    ? { ok: true }
    : { ok: false, error: `Vercel domain remove failed (${res.status})` };
}
