"use server";

import { headers } from "next/headers";
import { hasPrivateReviewSession } from "@/lib/private_review_auth";
import { Resend } from "resend";

const CONTACT_EMAIL = "hello@rva3d.com";
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;

const inquiryTypes = {
  visualization: "3D visualization",
  animation: "Product or technical animation",
  motion: "Motion design or VFX",
  support: "Production support",
  other: "Something else",
} as const;

type InquiryType = keyof typeof inquiryTypes;
type ContactField = "name" | "email" | "company" | "inquiryType" | "message";

export type ContactFormState = {
  status: "idle" | "success" | "error";
  message: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  submissionId?: string;
};

type RateLimitEntry = {
  attempts: number;
  resetAt: number;
};

// This per-instance limit is intentionally lightweight. The honeypot handles
// obvious automated submissions while this slows repeated sends from one IP.
const contactRateLimits = new Map<string, RateLimitEntry>();

function getText(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.trim() : "";
}

function getClientIp(forwardedFor: string | null, realIp: string | null) {
  return forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";
}

function isRateLimited(clientIp: string) {
  const now = Date.now();

  if (contactRateLimits.size > 500) {
    for (const [ip, entry] of contactRateLimits) {
      if (entry.resetAt <= now) {
        contactRateLimits.delete(ip);
      }
    }
  }

  const existing = contactRateLimits.get(clientIp);
  if (!existing || existing.resetAt <= now) {
    contactRateLimits.set(clientIp, {
      attempts: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  existing.attempts += 1;
  return existing.attempts > RATE_LIMIT_MAX_ATTEMPTS;
}

function validateContactForm(formData: FormData) {
  const name = getText(formData, "name");
  const email = getText(formData, "email").toLowerCase();
  const company = getText(formData, "company");
  const inquiryType = getText(formData, "inquiryType") as InquiryType;
  const message = getText(formData, "message");
  const website = getText(formData, "website");
  const fieldErrors: Partial<Record<ContactField, string>> = {};

  if (!name) {
    fieldErrors.name = "Please enter your name.";
  } else if (name.length > 100) {
    fieldErrors.name = "Please keep your name under 100 characters.";
  }

  if (!email) {
    fieldErrors.email = "Please enter your email address.";
  } else if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    fieldErrors.email = "Please enter a valid email address.";
  }

  if (company.length > 150) {
    fieldErrors.company = "Please keep the company name under 150 characters.";
  }

  if (!Object.hasOwn(inquiryTypes, inquiryType)) {
    fieldErrors.inquiryType = "Please choose how RVA3D can help.";
  }

  if (!message) {
    fieldErrors.message = "Please include a short message.";
  } else if (message.length < 10) {
    fieldErrors.message = "Please add a little more detail (at least 10 characters).";
  } else if (message.length > 5000) {
    fieldErrors.message = "Please keep your message under 5,000 characters.";
  }

  return {
    values: { name, email, company, inquiryType, message, website },
    fieldErrors,
  };
}

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { values, fieldErrors } = validateContactForm(formData);

  // Give honeypot submissions a normal-looking response without sending mail.
  if (values.website) {
    return {
      status: "success",
      message: "Thanks. Your message has been sent.",
      submissionId: crypto.randomUUID(),
    };
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please review the highlighted fields and try again.",
      fieldErrors,
    };
  }

  const requestHeaders = await headers();
  const clientIp = getClientIp(
    requestHeaders.get("x-forwarded-for"),
    requestHeaders.get("x-real-ip"),
  );

  if (isRateLimited(clientIp)) {
    return {
      status: "error",
      message:
        "There have been several recent submissions. Please wait a few minutes, or email hello@rva3d.com directly.",
    };
  }

  // Ordinary candidate browsing cannot send. Explicit test mode retains the owned recipient.
  const controlledTest = formData.get("controlledTest") === "1" && process.env.RVA3D_CONTACT_TEST_ENABLED === "1" && await hasPrivateReviewSession();
  const publicSending = process.env.RVA3D_PUBLIC_LAUNCH_ENABLED === "1";
  if (!controlledTest && !publicSending) return { status: "error", message: "Your inquiry passed validation. Nothing was sent or stored in this protected preview. Email hello@rva3d.com to start a conversation." };
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.EMAIL_FROM;
  const toAddress = process.env.CONTACT_EMAIL_TO || CONTACT_EMAIL;

  if (!apiKey || !fromAddress) {
    console.error(
      "Contact form delivery is unavailable because RESEND_API_KEY or EMAIL_FROM is missing.",
    );
    return {
      status: "error",
      message:
        "The form is temporarily unavailable. Please email hello@rva3d.com or call (804) 392-8183.",
    };
  }

  try {
    const resend = new Resend(apiKey);
    const inquiryLabel = inquiryTypes[values.inquiryType];
    const { error } = await resend.emails.send({
      from: fromAddress,
      to: toAddress,
      replyTo: values.email,
      subject: `${controlledTest ? "[RVA3D CONTROLLED DELIVERY TEST] " : ""}RVA3D website inquiry: ${inquiryLabel}`,
      text: [
        `Name: ${values.name}`,
        `Email: ${values.email}`,
        `Company: ${values.company || "Not provided"}`,
        `What can we help with?: ${inquiryLabel}`,
        "",
        "Message:",
        values.message,
      ].join("\n"),
    });

    if (error) {
      console.error("Resend rejected a contact form delivery.", {
        name: error.name,
        message: error.message,
      });
      return {
        status: "error",
        message:
          "We couldn’t send your message. Please email hello@rva3d.com or call (804) 392-8183.",
      };
    }

    return {
      status: "success",
      message: "Thanks. Your message was accepted by our email provider. RVA3D will be in touch soon.",
      submissionId: crypto.randomUUID(),
    };
  } catch (error) {
    console.error("Contact form delivery failed.", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    return {
      status: "error",
      message:
        "We couldn’t send your message. Please email hello@rva3d.com or call (804) 392-8183.",
    };
  }
}
