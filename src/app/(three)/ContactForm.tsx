"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";

import {
  submitContactForm,
  type ContactFormState,
} from "./contact-action";
import styles from "./home.module.css";

const initialState: ContactFormState = {
  status: "idle",
  message: "",
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.submitButton} type="submit" disabled={pending}>
      {pending ? "Sending…" : "Send message"}
      <span aria-hidden="true">↗</span>
    </button>
  );
}

export default function ContactForm() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state.status, state.submissionId]);

  return (
    <form ref={formRef} className={styles.contactForm} action={formAction}>
      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            required
            aria-invalid={Boolean(state.fieldErrors?.name)}
            aria-describedby={state.fieldErrors?.name ? "contact-name-error" : undefined}
          />
          {state.fieldErrors?.name ? (
            <span id="contact-name-error" className={styles.fieldError}>
              {state.fieldErrors.name}
            </span>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-email">Email</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? "contact-email-error" : undefined}
          />
          {state.fieldErrors?.email ? (
            <span id="contact-email-error" className={styles.fieldError}>
              {state.fieldErrors.email}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.field}>
          <label htmlFor="contact-company">
            Company <span>(optional)</span>
          </label>
          <input
            id="contact-company"
            name="company"
            type="text"
            autoComplete="organization"
            maxLength={150}
            aria-invalid={Boolean(state.fieldErrors?.company)}
            aria-describedby={
              state.fieldErrors?.company ? "contact-company-error" : undefined
            }
          />
          {state.fieldErrors?.company ? (
            <span id="contact-company-error" className={styles.fieldError}>
              {state.fieldErrors.company}
            </span>
          ) : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="contact-inquiry">What can we help with?</label>
          <select
            id="contact-inquiry"
            name="inquiryType"
            defaultValue=""
            required
            aria-invalid={Boolean(state.fieldErrors?.inquiryType)}
            aria-describedby={
              state.fieldErrors?.inquiryType ? "contact-inquiry-error" : undefined
            }
          >
            <option value="" disabled>
              Select one
            </option>
            <option value="visualization">3D visualization</option>
            <option value="animation">Product or technical animation</option>
            <option value="motion">Motion design or VFX</option>
            <option value="support">Production support</option>
            <option value="other">Something else</option>
          </select>
          {state.fieldErrors?.inquiryType ? (
            <span id="contact-inquiry-error" className={styles.fieldError}>
              {state.fieldErrors.inquiryType}
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="contact-message">Message</label>
        <textarea
          id="contact-message"
          name="message"
          rows={6}
          minLength={10}
          maxLength={5000}
          required
          aria-invalid={Boolean(state.fieldErrors?.message)}
          aria-describedby={state.fieldErrors?.message ? "contact-message-error" : undefined}
        />
        {state.fieldErrors?.message ? (
          <span id="contact-message-error" className={styles.fieldError}>
            {state.fieldErrors.message}
          </span>
        ) : null}
      </div>

      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      <div className={styles.formFooter}>
        <SubmitButton />
        <p
          className={
            state.status === "success" ? styles.formSuccess : styles.formStatus
          }
          role={state.status === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          {state.message}
        </p>
      </div>
    </form>
  );
}
