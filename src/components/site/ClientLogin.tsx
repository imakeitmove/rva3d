"use client";

import Image from "next/image";
import Link from "next/link";
import data from "@/content/site/home.generated.json";
import { siteHref } from "@/lib/site/paths";
import { useState, type FormEvent } from "react";

import styles from "@/components/auth/LoginPanel.module.css";

export default function LoginPage() {
  const [message, setMessage] = useState("");

  function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The existing provider authenticates by email link. Never transmit or
    // store passwords until a real credentials provider has been implemented.
    event.currentTarget.reset();
    setMessage("Use a secure email link to access your account, or contact hello@rva3d.com for help signing in.");
  }


  return (
    <main className={styles.page} data-tone="void">
      <section className={styles.panel} aria-labelledby="client-login-title">
        <Link className={styles.centeredBrand} href={siteHref()} aria-label="RVA3D home">
          <Image src={data.logoStill} unoptimized alt="RVA3D" width={1172} height={352} priority />
        </Link>
        <div>
          <p className={styles.eyebrow}>Client access</p>
          <h1 id="client-login-title">Client login</h1>
        </div>
        <form className={styles.form} method="post" onSubmit={handlePasswordSubmit} aria-describedby={message ? "login-message" : undefined}>
          <label htmlFor="client-username">Username</label>
          <input id="client-username" name="username" type="text" autoComplete="username" autoCapitalize="none" spellCheck={false} required />
          <label htmlFor="client-password">Password</label>
          <input id="client-password" name="password" type="password" autoComplete="current-password" required />
          <button type="submit">Log in</button>
        </form>
        {message ? <p id="login-message" className={styles.message} role="status">{message}</p> : null}
        <a className={styles.alternate} href="https://www.rva3d.com/login">Sign in with an email link <span aria-hidden="true">&#8599;</span></a>
      </section>
    </main>
  );
}
