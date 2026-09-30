export type CollaboratorField = "name" | "email" | "organization" | "message" | "link" | "location";
export const collaboratorSuccess = "Thanks for reaching out. We'll read your idea and get in touch if there's a good fit.";
export const collaboratorSubject = "RVA3D collaborator introduction";

export function validateCollaboratorForm(data: FormData) {
  const text = (key: string) => typeof data.get(key) === "string" ? (data.get(key) as string).trim() : "";
  const values = { name: text("name"), email: text("email").toLowerCase(), organization: text("organization"), message: text("message"), link: text("link"), location: text("location"), website: text("website") };
  const fieldErrors: Partial<Record<CollaboratorField, string>> = {};
  if (!values.name || values.name.length > 100) fieldErrors.name = "Please enter your name (up to 100 characters).";
  if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) fieldErrors.email = "Please enter a valid email address.";
  if (values.organization.length > 200) fieldErrors.organization = "Please keep your organization or role under 200 characters.";
  if (!values.message || values.message.length > 2000) fieldErrors.message = "Please tell us what you have in mind (up to 2,000 characters).";
  if (values.link) {
    try {
      const url = new URL(values.link);
      if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password || values.link.length > 2048) throw new Error("Invalid link");
    } catch { fieldErrors.link = "Please enter a complete http:// or https:// link, or leave it blank."; }
  }
  if (values.location.length > 150) fieldErrors.location = "Please keep your location under 150 characters.";
  return { values, fieldErrors };
}
export function collaboratorMessage(values: ReturnType<typeof validateCollaboratorForm>["values"]) {
  return ["Category: Collaboration conversation", `Name: ${values.name}`, `Email: ${values.email}`,
    `Organization / role: ${values.organization || "Not provided"}`, `Link: ${values.link || "Not provided"}`,
    `Location: ${values.location || "Not provided"}`, "", "What do you have in mind?", values.message].join("\n");
}

/* Previous freelancer-only validation/format retained for restoration.
﻿export type CollaboratorField = "name" | "email" | "skill" | "portfolio" | "location" | "note";
export const collaboratorSuccess = "Thanks for reaching out. We'll take a look at your work and keep you in mind when the right project comes along.";
export const collaboratorSubject = "RVA3D collaborator introduction";

export function validateCollaboratorForm(data: FormData) {
  const text = (key: string) => typeof data.get(key) === "string" ? (data.get(key) as string).trim() : "";
  const values = {
    name: text("name"), email: text("email").toLowerCase(), skill: text("skill"),
    portfolio: text("portfolio"), location: text("location"), note: text("note"), website: text("website"),
  };
  const fieldErrors: Partial<Record<CollaboratorField, string>> = {};
  if (!values.name || values.name.length > 100) fieldErrors.name = "Please enter your name (up to 100 characters).";
  if (values.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) fieldErrors.email = "Please enter a valid email address.";
  if (!values.skill || values.skill.length > 200) fieldErrors.skill = "Please tell us what you do (up to 200 characters).";
  try {
    const url = new URL(values.portfolio);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname || url.username || url.password || values.portfolio.length > 2048) throw new Error("Invalid portfolio URL");
  } catch { fieldErrors.portfolio = "Please enter a complete http:// or https:// portfolio URL."; }
  if (values.location.length > 150) fieldErrors.location = "Please keep your location under 150 characters.";
  if (values.note.length > 2000) fieldErrors.note = "Please keep your note under 2,000 characters.";
  return { values, fieldErrors };
}

export function collaboratorMessage(values: ReturnType<typeof validateCollaboratorForm>["values"]) {
  return ["Category: Collaborator introduction", `Name: ${values.name}`, `Email: ${values.email}`,
    `What do you do?: ${values.skill}`, `Portfolio: ${values.portfolio}`,
    `Location: ${values.location || "Not provided"}`, "", "Anything we should know?", values.note || "Not provided"].join("\n");
}

*/
