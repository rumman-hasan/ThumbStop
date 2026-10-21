import { z } from "zod";

/** Removes control characters and trims. React escapes output, this keeps stored data tidy. */
export function clean(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim();
}

const text = (min: number, max: number, label = "This field") =>
  z
    .string()
    .transform(clean)
    .pipe(z.string().min(min, `${label} is required.`).max(max, `${label} is too long.`));

const optText = (max: number) =>
  z
    .string()
    .transform(clean)
    .pipe(z.string().max(max, "Text is too long."))
    .transform((v) => (v === "" ? null : v));

const optEmail = z
  .string()
  .transform(clean)
  .pipe(z.union([z.literal(""), z.string().email("Enter a valid email.").max(200)]))
  .transform((v) => (v === "" ? null : v));

const optDate = z
  .string()
  .transform(clean)
  .pipe(z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")]))
  .transform((v) => (v === "" ? null : v));

const phone = z
  .string()
  .transform(clean)
  .pipe(z.string().regex(/^\+?[0-9\s-]{8,20}$/, "Enter a valid phone number."));

const uuid = z.string().uuid("Invalid selection.");
const optUuid = z
  .string()
  .transform(clean)
  .pipe(z.union([z.literal(""), z.string().uuid("Invalid selection.")]))
  .transform((v) => (v === "" ? null : v));

export const enquirySchema = z.object({
  name: text(2, 100, "Name"),
  email: z.string().transform(clean).pipe(z.string().email("Enter a valid email.").max(200)),
  phone,
  service: optText(120).transform((v) => v ?? ""),
  budget: optText(60).transform((v) => v ?? ""),
  details: text(10, 2000, "Project details"),
});

export const clientSchema = z.object({
  name: text(2, 120, "Name"),
  company: optText(120),
  email: optEmail,
  phone: optText(30),
  address: optText(300),
  notes: optText(2000),
});

export const projectSchema = z.object({
  client_id: uuid,
  service_id: optUuid,
  title: text(2, 160, "Title"),
  description: optText(3000),
  status: z.enum(["planning", "in_progress", "review", "completed", "on_hold", "cancelled"]),
  start_date: optDate,
  deadline: optDate,
});

export const projectUpdateSchema = z.object({
  id: uuid,
  title: text(2, 160, "Title"),
  status: z.enum(["planning", "in_progress", "review", "completed", "on_hold", "cancelled"]),
  progress: z.coerce.number().int("Progress must be a whole number.").min(0).max(100),
  deadline: optDate,
});

export const milestoneSchema = z.object({
  project_id: uuid,
  title: text(2, 160, "Milestone title"),
  due_date: optDate,
});

export const linkDeliverableSchema = z.object({
  project_id: uuid,
  title: text(2, 160, "Title"),
  url: z
    .string()
    .transform(clean)
    .pipe(z.string().url("Enter a valid link.").max(1000))
    .refine((u) => /^https?:\/\//i.test(u), "Link must start with http:// or https://"),
});

export const invoiceHeaderSchema = z.object({
  client_id: uuid,
  project_id: optUuid,
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid issue date."),
  due_date: optDate,
  notes: optText(1000),
});

export const invoiceItemSchema = z.object({
  description: text(2, 200, "Item description"),
  quantity: z.coerce.number().positive("Quantity must be above 0.").max(100000),
  unit_price: z.coerce.number().min(0, "Price cannot be negative.").max(100000000),
});

export const manualPaymentSchema = z.object({
  invoice_id: uuid,
  amount: z.coerce.number().positive("Amount must be above 0.").max(100000000),
  method: z.enum(["cash", "bank", "bkash_manual", "nagad_manual"]),
});

export const serviceSchema = z.object({
  id: optUuid,
  title: text(2, 120, "Title"),
  slug: z
    .string()
    .transform((v) => clean(v).toLowerCase())
    .pipe(z.union([z.literal(""), z.string().regex(/^[a-z0-9-]+$/, "Slug: lowercase letters, numbers and dashes only.")])),
  summary: text(5, 400, "Summary"),
  sort_order: z.coerce.number().int().min(0).max(1000),
});

export const packageSchema = z.object({
  id: optUuid,
  name: text(2, 120, "Name"),
  description: optText(500),
  price_bdt: z
    .string()
    .transform(clean)
    .pipe(z.union([z.literal(""), z.coerce.number().min(0, "Price cannot be negative.").max(100000000)]))
    .transform((v) => (v === "" ? null : Number(v))),
  service_id: optUuid,
  sort_order: z.coerce.number().int().min(0).max(1000),
});

export const portfolioSchema = z.object({
  id: optUuid,
  title: text(2, 160, "Title"),
  client_name: optText(120),
  summary: optText(600),
  link: optText(500).refine((v) => v === null || /^https?:\/\//i.test(v), "Link must start with http:// or https://"),
});

export const testimonialSchema = z.object({
  id: optUuid,
  author_name: text(2, 120, "Author name"),
  author_role: optText(120),
  quote: text(10, 800, "Quote"),
});

export const roleSchema = z.object({
  target: uuid,
  role: z.enum(["admin", "staff", "client"]),
});

export const profileSchema = z.object({
  full_name: text(2, 120, "Name"),
  phone: z
    .string()
    .transform(clean)
    .pipe(z.union([z.literal(""), z.string().regex(/^\+?[0-9\s-]{8,20}$/, "Enter a valid phone number.")]))
    .transform((v) => (v === "" ? null : v)),
});

export const settingsKeys = [
  "phone_display",
  "phone_tel",
  "whatsapp_number",
  "email",
  "address",
  "facebook",
  "instagram",
  "youtube",
  "linkedin",
] as const;

export const settingsSchema = z.object({
  phone_display: text(5, 40, "Phone (display)"),
  phone_tel: z.string().transform(clean).pipe(z.string().regex(/^\+?[0-9]{8,16}$/, "Phone (tel) must be digits, optional leading +.")),
  whatsapp_number: z.string().transform(clean).pipe(z.string().regex(/^[0-9]{8,16}$/, "WhatsApp number: digits only, with country code, no +.")),
  email: z.string().transform(clean).pipe(z.string().email("Enter a valid email.").max(200)),
  address: text(5, 300, "Address"),
  facebook: optText(300),
  instagram: optText(300),
  youtube: optText(300),
  linkedin: optText(300),
});
