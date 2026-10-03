import { z } from "zod";

const MAX_FILE_SIZE = 5000000; // 5MB

export const UPLOAD_RULES = {
  image: {
    types: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    extensions: ".jpg,.jpeg,.png,.webp",
    formatKey: "form.validation.imageFormat",
  },
  document: {
    types: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    extensions: ".pdf,.doc,.docx",
    formatKey: "form.validation.documentFormat",
  },
};

export const DOCUMENT_FIELDS = [
  { name: "company_logo", kind: "image", label: "companyLogo" },
  { name: "registration_certificate", kind: "document", label: "registrationCertificate" },
  { name: "gst_certificate", kind: "document", label: "gstCertificate" },
  { name: "address_proof", kind: "document", label: "addressProof" },
];

// The picker and the schema both call this, so a file can't pass one and fail the other.
export const uploadErrorKey = (file, kind) => {
  if (!(file instanceof File)) return "form.validation.fileRequired";
  if (file.size > MAX_FILE_SIZE) return "form.validation.fileMaxSize";
  if (!UPLOAD_RULES[kind].types.includes(file.type)) return UPLOAD_RULES[kind].formatKey;
  return null;
};

const fileSchema = (kind, t) =>
  z.any().superRefine((file, ctx) => {
    const key = uploadErrorKey(file, kind);
    if (key) ctx.addIssue({ code: "custom", message: t(key) });
  });

// Subdomains are in play: www.linkedin.com and the country hosts like in.linkedin.com.
const isLinkedInUrl = (value) => {
  try {
    return /(^|\.)linkedin\.com$/i.test(new URL(value).hostname);
  } catch {
    return false;
  }
};

const imageSchema = (t) => fileSchema("image", t);
const documentSchema = (t) => fileSchema("document", t);

/** `t` is the `onboarding` namespace translator. */
export const makeEmployerOnboardingSchema = (t) =>
  z.object({
    company_name: z.string().min(2, t("form.validation.companyNameMin")).max(100),
    company_website: z.string().url(t("form.validation.companyWebsiteUrl")),
    linkedin_url: z
      .string()
      .trim()
      .min(1, t("form.validation.linkedinUrlRequired"))
      .url(t("form.validation.linkedinUrlInvalid"))
      .refine(isLinkedInUrl, t("form.validation.linkedinUrlDomain")),
    company_description: z.string().min(10, t("form.validation.companyDescriptionMin")).max(500),
    company_industry: z.string().min(1, t("form.validation.companyIndustryRequired")),
    company_registration_number: z.string().min(5, t("form.validation.registrationNumberRequired")).max(50),
    gst_number: z.string().min(15, t("form.validation.gstNumberRequired")).max(15, t("form.validation.gstNumberRequired")),
    pan_number: z.string().min(10, t("form.validation.panNumberRequired")).max(10, t("form.validation.panNumberRequired")),
    company_address: z.string().min(5, t("form.validation.companyAddressRequired")),
    official_email: z.string().email(t("form.validation.officialEmailInvalid")),

    // Files
    company_logo: imageSchema(t),
    registration_certificate: documentSchema(t),
    gst_certificate: documentSchema(t),
    address_proof: documentSchema(t),
  });

export const defaultValues = {
  company_name: "",
  company_website: "",
  linkedin_url: "",
  company_description: "",
  company_industry: "",
  company_registration_number: "",
  gst_number: "",
  pan_number: "",
  company_address: "",
  official_email: "",
};
