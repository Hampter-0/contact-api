// the shape of a validated contact form submission, after parsing
export interface ContactSubmission {
  name: string;
  email: string;
  message: string;
  turnstileToken?: string;
}