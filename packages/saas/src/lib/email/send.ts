import { resend, FROM } from './client.js';
import {
  welcomeTemplate,
  deploySuccessTemplate,
  deployFailureTemplate,
  upgradeTemplate,
  paymentFailedTemplate,
} from './templates.js';

type SendResult = { ok: boolean; id?: string; error?: string };

async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function sendWelcome(to: string, name: string, dashboardUrl: string) {
  const { subject, html } = welcomeTemplate({ name, dashboardUrl });
  return sendEmail(to, subject, html);
}

export async function sendDeploySuccess(
  to: string,
  data: { projectName: string; provider: string; deployUrl: string; filesWritten: number; dashboardUrl: string },
) {
  const { subject, html } = deploySuccessTemplate(data);
  return sendEmail(to, subject, html);
}

export async function sendDeployFailure(
  to: string,
  data: { projectName: string; provider: string; errorMessage: string; dashboardUrl: string },
) {
  const { subject, html } = deployFailureTemplate(data);
  return sendEmail(to, subject, html);
}

export async function sendUpgradeConfirmed(
  to: string,
  data: { name: string; planName: string; periodEnd: string; billingUrl: string },
) {
  const { subject, html } = upgradeTemplate(data);
  return sendEmail(to, subject, html);
}

export async function sendPaymentFailed(to: string, name: string, billingUrl: string) {
  const { subject, html } = paymentFailedTemplate({ name, billingUrl });
  return sendEmail(to, subject, html);
}
