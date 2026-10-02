// defines which fields the contact form accepts, their validation rules,
// and how they should be labeled when shown in discord/email.
//
// add, remove, or edit fields here. the schema, link filter, and discord
// message all build themselves from this list automatically, no other
// code needs to change when you add a field.
//
// if you add or remove fields here, remember to update your frontend
// form to match (same field "key" in the JSON body you send to /contact).

export type ContactFieldType = "text" | "email" | "textarea" | "select";

export interface ContactFieldOption {
  // internal key, used in the request body and as the object key everywhere
  key: string;

  // label shown in discord messages and email notifications
  label: string;

  type: ContactFieldType;

  required: boolean;

  // max characters allowed
  maxLength?: number;

  // allowed values (only used when type is "select")
  options?: string[];

  // skip the link-filter check for this field.
  // useful for a field where links are expected, like a "website" field
  linkFilterExempt?: boolean;
}

export const contactFields: ContactFieldOption[] = [
  {
    key: "name",
    label: "Name",
    type: "text",
    required: true,
    maxLength: 100,
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    required: true,
    maxLength: 100,
  },
  {
    key: "message",
    label: "Message",
    type: "textarea",
    required: true,
    maxLength: 1000,
  },
];

// a validated contact submission is a bag of string fields, whatever
// keys are declared above, plus whatever's declared here. kept loose
// (not tied to specific field keys) since fields.config.ts is meant
// to be edited freely.
export interface ContactSubmission {
  [key: string]: string | undefined;
}