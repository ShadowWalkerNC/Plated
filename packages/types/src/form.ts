export type FormType = 'contact' | 'catering' | 'reservation' | 'general';

/**
 * FormSubmission — Supabase `form_submissions` table row shape.
 */
export interface FormSubmission {
  id: string;
  siteId: string;
  formType: FormType;
  /** Flexible JSONB — keys depend on form_type */
  data: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}
