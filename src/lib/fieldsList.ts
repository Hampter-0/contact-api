import { contactFields, type ContactSubmission } from "../config/fields.config";

export interface SubmittedField {
  label: string;
  value: string;
}

// returns the submitted fields as plain {label, value} pairs, in the
// order they're declared in fields.config.ts, skipping any field that
// was left empty. no formatting applied here, that's entirely up to
// the template that renders this data.
export function getSubmittedFields(submission: ContactSubmission): SubmittedField[] {
  const result: SubmittedField[] = [];

  for (const field of contactFields) {
    const value = submission[field.key];

    if (value) {
      result.push({ label: field.label, value });
    }
  }

  return result;
}

// finds the value of whichever configured field has type "email".
// used as the reply-to address for the notification email, so hitting
// reply in your inbox goes straight to the visitor.
export function findSubmitterEmail(submission: ContactSubmission): string | undefined {
  const emailField = contactFields.find((field) => field.type === "email");

  if (!emailField) {
    return undefined;
  }

  const value = submission[emailField.key];

  if (!value) {
    return undefined;
  }

  return value;
}