export function emailShell(body: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Plated</title>
  <style>
    body  { margin:0; padding:0; background:#f5f0ea; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color:#1e1612; }
    .wrap { max-width:560px; margin:40px auto; background:#ffffff; border-radius:16px; overflow:hidden; box-shadow:0 4px 32px rgba(0,0,0,0.06); }
    .hdr  { background:#1a1208; padding:28px 36px; }
    .logo { font-family: Georgia, serif; font-size:1.5rem; font-weight:800; color:#f4ede4; letter-spacing:-0.02em; }
    .body { padding:36px; line-height:1.65; }
    h1   { font-size:1.35rem; margin:0 0 12px; color:#1e1612; }
    p    { margin:0 0 14px; font-size:0.95rem; color:#4a3728; }
    .btn { display:inline-block; margin:8px 0 16px; padding:12px 24px; background:#8a4b2f; color:#fff8f2; text-decoration:none; border-radius:999px; font-weight:700; font-size:0.9rem; }
    .muted { font-size:0.82rem; color:#9e8878; }
    .ftr   { background:#f5f0ea; padding:20px 36px; font-size:0.8rem; color:#9e8878; text-align:center; }
    .ftr a { color:#8a4b2f; text-decoration:none; }
    .divider { border:none; border-top:1px solid #ede7df; margin:20px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="hdr"><div class="logo">Plated</div></div>
    <div class="body">${body}</div>
    <div class="ftr">
      &copy; ${new Date().getFullYear()} Plated &mdash;
      <a href="https://plated.io/unsubscribe">Unsubscribe</a> &middot;
      <a href="https://plated.io">plated.io</a>
    </div>
  </div>
</body>
</html>`;
}

interface WelcomeData { name: string; dashboardUrl: string; }
export function welcomeTemplate({ name, dashboardUrl }: WelcomeData) {
  return {
    subject: 'Welcome to Plated 🍽️',
    html: emailShell(`
      <h1>Welcome, ${name}!</h1>
      <p>Your Plated account is ready. Start by creating your first restaurant site — it takes less than two minutes.</p>
      <a class="btn" href="${dashboardUrl}">Open Dashboard</a>
      <hr class="divider" />
      <p class="muted">If you didn’t sign up for Plated, you can safely ignore this email.</p>
    `),
  };
}

interface DeploySuccessData { projectName: string; provider: string; deployUrl: string; filesWritten: number; dashboardUrl: string; }
export function deploySuccessTemplate({ projectName, provider, deployUrl, filesWritten, dashboardUrl }: DeploySuccessData) {
  return {
    subject: `✓ ${projectName} is live`,
    html: emailShell(`
      <h1>Your site is live ✓</h1>
      <p><strong>${projectName}</strong> was deployed to <strong>${capitalize(provider)}</strong> with ${filesWritten} files.</p>
      <a class="btn" href="${deployUrl}" target="_blank">View Live Site</a>
      <hr class="divider" />
      <p class="muted">Deployed from your <a href="${dashboardUrl}">Plated dashboard</a>.</p>
    `),
  };
}

interface DeployFailureData { projectName: string; provider: string; errorMessage: string; dashboardUrl: string; }
export function deployFailureTemplate({ projectName, provider, errorMessage, dashboardUrl }: DeployFailureData) {
  return {
    subject: `⚠️ Deploy failed: ${projectName}`,
    html: emailShell(`
      <h1>Deploy failed ⚠️</h1>
      <p>Your deploy of <strong>${projectName}</strong> to <strong>${capitalize(provider)}</strong> didn’t complete.</p>
      <p><strong>Error:</strong> ${errorMessage}</p>
      <a class="btn" href="${dashboardUrl}">View in Dashboard</a>
      <hr class="divider" />
      <p class="muted">If this keeps happening, contact <a href="mailto:support@plated.io">support@plated.io</a>.</p>
    `),
  };
}

interface UpgradeData { name: string; planName: string; periodEnd: string; billingUrl: string; }
export function upgradeTemplate({ name, planName, periodEnd, billingUrl }: UpgradeData) {
  return {
    subject: `You’re on the ${planName} plan ✨`,
    html: emailShell(`
      <h1>You’re on ${planName}!</h1>
      <p>Hi ${name}, your upgrade to <strong>${planName}</strong> is confirmed. Your next billing date is <strong>${periodEnd}</strong>.</p>
      <a class="btn" href="${billingUrl}">Manage Billing</a>
      <hr class="divider" />
      <p class="muted">You can cancel or switch plans anytime from your billing page.</p>
    `),
  };
}

interface PaymentFailedData { name: string; billingUrl: string; }
export function paymentFailedTemplate({ name, billingUrl }: PaymentFailedData) {
  return {
    subject: 'Action required: payment failed',
    html: emailShell(`
      <h1>Payment failed</h1>
      <p>Hi ${name}, we couldn’t process your last payment. Please update your payment method to keep your Pro features.</p>
      <a class="btn" href="${billingUrl}">Update Payment Method</a>
      <hr class="divider" />
      <p class="muted">Need help? Email <a href="mailto:support@plated.io">support@plated.io</a>.</p>
    `),
  };
}

function capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
