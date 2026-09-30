"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { submitCollaboratorForm, type ContactFormState } from "@/app/(three)/contact-action";
import { Brand } from "./Brand";
import styles from "./CollaboratorContact.module.css";

// Previous required skill/portfolio fields are retained below for restoration.
const fields = [
  { name: "name", label: "Name", type: "text", autoComplete: "name", maxLength: 100, required: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", maxLength: 254, required: true },
  { name: "organization", label: "Organization / role", type: "text", placeholder: "School, organization, or what you do", maxLength: 200, required: false },
  { name: "message", label: "What do you have in mind?", type: "text", placeholder: "Tell us about your idea or how we might work together", maxLength: 2000, required: true },
  { name: "link", label: "Link, if helpful", type: "url", placeholder: "https://...", maxLength: 2048, required: false },
  { name: "location", label: "Location", type: "text", placeholder: "City, state / remote", maxLength: 150, required: false },
] as const;
/* const fields = [
  { name: "name", label: "Name", type: "text", autoComplete: "name", maxLength: 100, required: true },
  { name: "email", label: "Email", type: "email", autoComplete: "email", maxLength: 254, required: true },
  { name: "skill", label: "What do you do?", type: "text", placeholder: "3D animator, designer, compositor, editor...", maxLength: 200, required: true },
  { name: "portfolio", label: "Portfolio", type: "url", placeholder: "https://...", maxLength: 2048, required: true },
  { name: "location", label: "Location", type: "text", placeholder: "City, state / remote", maxLength: 150, required: false },
] as const; */

export function CollaboratorContact({ sendingEnabled }: { sendingEnabled: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<ContactFormState>({ status: "idle", message: "" });
  const sending = useRef(false);
  const modalRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const resultRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!open || !modalRef.current) return;
    const modal = modalRef.current, trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      modal.close();
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setPending(true);
    const form = event.currentTarget;
    try {
      const response = await submitCollaboratorForm(result, new FormData(form));
      setResult(response);
      if (response.status === "success") form.reset();
      requestAnimationFrame(() => {
        if (!modalRef.current?.open) return;
        const firstError = Object.keys(response.fieldErrors ?? {})[0];
        if (firstError) document.getElementById(`collaborator-${firstError}`)?.focus();
        else resultRef.current?.focus();
      });
    } catch {
      setResult({ status: "error", message: "The connection was interrupted. Your introduction is still here; try again or email hello@rva3d.com." });
    } finally { sending.current = false; setPending(false); }
  }

  return <div className={styles.root}>
    <button ref={triggerRef} className="button collaborate-email" type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
      Start a conversation <span aria-hidden="true">↗</span>
    </button>
    <dialog ref={modalRef} className={styles.dialog} aria-labelledby="collaborator-dialog-title" aria-describedby="collaborator-dialog-intro" onCancel={event => { event.preventDefault(); setOpen(false); }}>
      <button className={styles.close} type="button" aria-label="Close collaborator form" onClick={() => setOpen(false)}>×</button>
      <h2 id="collaborator-dialog-title" className={styles.heading}>Collaborate with <Brand /></h2>
      <p id="collaborator-dialog-intro" className={styles.intro}>Tell us what you have in mind and how we might work together. A link is welcome if it helps, but it is not required.</p>
      {result.status !== "success" && <form onSubmit={submit} noValidate aria-busy={pending}>
        <div className={styles.fields}>
          {fields.map(({ name, label, required, ...input }) => <label className={name === "message" ? styles.note : undefined} key={name} htmlFor={`collaborator-${name}`}>
            {label}{!required && <span> (optional)</span>}
            {name === "message" ? <textarea id={`collaborator-${name}`} name={name} rows={4} required maxLength={input.maxLength} placeholder={"placeholder" in input ? input.placeholder : undefined} aria-invalid={!!result.fieldErrors?.[name]} aria-describedby={result.fieldErrors?.[name] ? `collaborator-${name}-error` : undefined} /> : <input {...input} id={`collaborator-${name}`} name={name} required={required} aria-invalid={!!result.fieldErrors?.[name]} aria-describedby={result.fieldErrors?.[name] ? `collaborator-${name}-error` : undefined} />}
            {result.fieldErrors?.[name] && <span className={styles.error} id={`collaborator-${name}-error`}>{result.fieldErrors[name]}</span>}
          </label>)}
          {/* Previous optional note replaced by the required message above.
          <label htmlFor="collaborator-note" className={styles.note}>Anything we should know? <span>(optional)</span>
            <textarea id="collaborator-note" name="note" rows={3} maxLength={2000} aria-invalid={!!result.fieldErrors?.note} aria-describedby={result.fieldErrors?.note ? "collaborator-note-error" : undefined} />
            {result.fieldErrors?.note && <span className={styles.error} id="collaborator-note-error">{result.fieldErrors.note}</span>}
          </label>
          */}
        </div>
        <div className={styles.trap} aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
        {!sendingEnabled && <p className={styles.preview}>Local preview: this form validates your introduction but does not send email.</p>}
        <button className={`button ${styles.submit}`} type="submit" disabled={pending}>{pending ? "Checking…" : "Say hello"}</button>
      </form>}
      <p className={styles.result} ref={resultRef} tabIndex={-1} role={result.status === "error" ? "alert" : "status"}>{result.message}</p>
    </dialog>
  </div>;
}
