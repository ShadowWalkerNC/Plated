export const PLANS = {
  free: {
    id:           'free',
    name:         'Free',
    priceId:      null,
    price:        0,
    interval:     null,
    projectLimit: 1,
    deployLimit:  5,
    themes:       ['hearth'],
    customDomain: false,
    analytics:    false,
    priority:     false,
  },
  pro: {
    id:           'pro',
    name:         'Pro',
    priceId:      process.env.STRIPE_PRO_PRICE_ID ?? '',
    price:        2900,
    interval:     'month' as const,
    projectLimit: 10,
    deployLimit:  100,
    themes:       ['hearth', 'spark', 'steel', 'bloom', 'obsidian', 'ghost'],
    customDomain: true,
    analytics:    true,
    priority:     true,
  },
  agency: {
    id:           'agency',
    name:         'Agency',
    priceId:      process.env.STRIPE_AGENCY_PRICE_ID ?? '',
    price:        9900,
    interval:     'month' as const,
    projectLimit: 100,
    deployLimit:  1000,
    themes:       ['hearth', 'spark', 'steel', 'bloom', 'obsidian', 'ghost'],
    customDomain: true,
    analytics:    true,
    priority:     true,
  },
} as const;

export type PlanId = keyof typeof PLANS;
export type Plan   = typeof PLANS[PlanId];

export function getPlan(id: string | null | undefined): Plan {
  if (id && id in PLANS) return PLANS[id as PlanId];
  return PLANS.free;
}
