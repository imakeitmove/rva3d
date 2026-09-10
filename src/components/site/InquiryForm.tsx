"use client";
import { useRef, useState, type FormEvent } from "react";
import { submitContactForm, type ContactFormState } from "@/app/(three)/contact-action";
const initial = { name: "", email: "", company: "", inquiryType: "", message: "", website: "" };
export function InquiryForm({ testMode = false, sendingEnabled = false }: { testMode?: boolean; sendingEnabled?: boolean }) {
  const [values, setValues] = useState(initial);
  const [result, setResult] = useState<ContactFormState>({ status: "idle", message: "" });
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true; setPending(true);
    const data = new FormData(event.currentTarget);
    try { const response = await submitContactForm(result, data); setResult(response); if (response.status === "success") setValues(initial); }
    catch { setResult({ status: "error", message: "The connection was interrupted. Your message is still here; try again or email hello@rva3d.com." }); }
    finally { sending.current = false; setPending(false); }
  }
  const field = (name: keyof typeof initial) => ({ name, value: values[name], onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setValues(v => ({ ...v, [name]: event.target.value })), "aria-invalid": !!result.fieldErrors?.[name as keyof NonNullable<ContactFormState["fieldErrors"]>] });
  return <div className="v-contact-form"><h2>Ready to say hello?</h2><form id="inquiry" onSubmit={submit} aria-describedby="form-notice">
    <p id="form-notice" className="form-notice">{testMode ? "Controlled delivery test — sends only to the configured RVA3D destination." : sendingEnabled ? "Tell us what you are making and where RVA3D can help." : "Protected preview — submissions are checked, but no message is sent."}</p>
    <div className="form-row"><label>Name<input {...field("name")} autoComplete="name" required maxLength={100} /></label><label>Email<input {...field("email")} type="email" autoComplete="email" required maxLength={254} /></label></div>
    <div className="form-row"><label>Company <span>(optional)</span><input {...field("company")} autoComplete="organization" maxLength={150} /></label><label>What can we help with?<select {...field("inquiryType")} required><option value="">Select one</option><option value="visualization">3D visualization</option><option value="animation">Product or technical animation</option><option value="motion">Motion design or VFX</option><option value="support">Production support</option><option value="other">Something else</option></select></label></div>
    <label>Message<textarea {...field("message")} rows={3} minLength={10} maxLength={5000} required /></label>
    <div className="inquiry-trap" aria-hidden="true"><label>Website<input {...field("website")} tabIndex={-1} autoComplete="off" /></label></div>
    {testMode && <input type="hidden" name="controlledTest" value="1" />}
    <button className="button" type="submit" disabled={pending}>{pending ? "Checking…" : testMode ? "Send labeled test ↗" : "Send message"}</button>
    <p className="form-result" role={result.status === "error" ? "alert" : "status"}>{result.message}</p>
    {result.fieldErrors && <ul className="field-errors">{Object.entries(result.fieldErrors).map(([key, text]) => <li key={key}>{text}</li>)}</ul>}

  </form></div>;
}
