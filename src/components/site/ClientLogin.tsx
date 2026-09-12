"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import data from "@/content/site/home.generated.json";
import { siteHref } from "@/lib/site/paths";
import styles from "@/components/auth/LoginPanel.module.css";

export function ClientAccess({ recovery = false }: { recovery?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Private layout preview only: no request, credential storage, account creation,
    // enumeration or email dispatch. The legacy email provider is NOT an invitation gate.
    event.currentTarget.reset();
    setSubmitted(true);
  }
  return <main className={styles.page} data-tone="void">
    <section className={styles.panel} aria-labelledby="client-access-title">
      <div className={styles.brandIntro}>
        <Link className={styles.centeredBrand} href={siteHref()} aria-label="RVA3D home">
          <Image data-brand-artwork="client-access" src={data.logoStill} alt="RVA3D" width={1172} height={352} unoptimized priority />
        </Link>
        <p className={styles.eyebrow}>Client access</p>
        <h1 id="client-access-title">{recovery ? "Recover access" : "Client login"}</h1>
        <p className={styles.introduction}>{recovery ? "Forgot your username or password? Start with the email and company associated with your account." : "A private place for invited clients to access their projects."}</p>
        {/* Previous private-candidate destination: /review/site */}
        <Link className={styles.backLink} href="/">← Back to site</Link>
      </div>
      <div className={styles.formSide}>
        <p id="client-access-notice" className={styles.notice}>Local preview — {recovery ? "account recovery is not connected. No email will be sent." : "sign-in is not connected. Please do not enter real credentials."}</p>
        <form className={styles.form} onSubmit={handleSubmit} aria-describedby="client-access-notice client-access-message">
          {recovery ? <>
            <label htmlFor="client-email">Email</label>
            <input id="client-email" name="email" type="email" autoComplete="email" maxLength={254} required />
            <label htmlFor="client-company">Company name</label>
            <input id="client-company" name="company" type="text" autoComplete="organization" maxLength={150} pattern=".*\S.*" required />
          </> : <>
            <label htmlFor="client-username">Username</label>
            <input id="client-username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={150} pattern=".*\S.*" required />
            <label htmlFor="client-password">Password</label>
            <input id="client-password" name="password" type="password" autoComplete="current-password" maxLength={256} required />
          </>}
          <button type="submit">{recovery ? "Submit" : "Log in"}</button>
        </form>
        <p id="client-access-message" className={submitted ? styles.message : styles.emptyMessage} role="status">{submitted ? recovery ? "Recovery is unavailable in this local preview. Nothing was sent and your details were not stored." : "Sign-in is unavailable in this local preview. Your credentials were not sent or stored." : ""}</p>
        <Link className={styles.backLink} href={siteHref(recovery ? "/login" : "/login/recovery")}>{recovery ? "← Back to login" : "Forgot username or password?"}</Link>
      </div>
    </section>
  </main>;
}
export default function LoginPage() { return <ClientAccess />; }

// Earlier external email-link layout retained below for restoration only.
// It must not be re-enabled without an invitation-only account/recovery integration.
// "use client";
//
// // Previous image logo used data.logoStill; use the shared monochrome wordmark here.
// import { Brand } from "./Brand";
// import Link from "next/link";
// // import data from "@/content/site/home.generated.json";
// import { siteHref } from "@/lib/site/paths";
// import { useState, type FormEvent } from "react";
//
// import styles from "@/components/auth/LoginPanel.module.css";
//
// export default function LoginPage() {
//   const [message, setMessage] = useState("");
//
//   function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();
//     // The existing provider authenticates by email link. Never transmit or
//     // store passwords until a real credentials provider has been implemented.
//     event.currentTarget.reset();
//     setMessage("Use a secure email link to access your account, or contact hello@rva3d.com for help signing in.");
//   }
//
//
//   return (
//     <main className={styles.page} data-tone="void">
//       <section className={styles.panel} aria-labelledby="client-login-title">
//         <Link className={styles.centeredBrand} href={siteHref()} aria-label="RVA3D home">
//           <Brand />
//         </Link>
//         <div>
//           <p className={styles.eyebrow}>Client access</p>
//           <h1 id="client-login-title">Client login</h1>
//         </div>
//         <form className={styles.form} method="post" onSubmit={handlePasswordSubmit} aria-describedby={message ? "login-message" : undefined}>
//           <label htmlFor="client-username">Username</label>
//           <input id="client-username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
//           <label htmlFor="client-password">Password</label>
//           <input id="client-password" name="password" type="password" autoComplete="current-password" required />
//           <button type="submit">Log in</button>
//         </form>
//         {message ? <p id="login-message" className={styles.message} role="status">{message}</p> : null}
//         <a className={styles.alternate} href="https://www.rva3d.com/login">Sign in with an email link <span aria-hidden="true">&#8599;</span></a>
//       </section>
//     </main>
//   );
// }
//
