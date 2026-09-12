import { redirect } from "next/navigation";
import Link from "next/link";

import {
  hasPrivateReviewSession,
  safePrivateReviewPath,
} from "@/lib/private_review_auth";

import styles from "./review-login.module.css";

type PrivateReviewLoginProps = {
  searchParams: Promise<{
    error?: string;
    logged_out?: string;
    next?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function PrivateReviewLogin({
  searchParams,
}: PrivateReviewLoginProps) {
  const params = await searchParams;
  const next = safePrivateReviewPath(params.next ?? null);
  if (await hasPrivateReviewSession()) {
    redirect(next);
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="review-login-title">
        <Link className={styles.brand} href="/">
          RVA<span>3D</span>
        </Link>
        <div>
          <p className={styles.eyebrow}>Private review room</p>
          <h1 id="review-login-title">Private RVA3D Review</h1>
          <p className={styles.introduction}>
            This area contains working portfolio material shared for feedback.
          </p>
        </div>

        {params.error === "1" ? (
          <p className={styles.message} role="alert">
            That password did not match. Please try again.
          </p>
        ) : null}
        {params.logged_out === "1" ? (
          <p className={styles.message} role="status">
            You have signed out of the private review.
          </p>
        ) : null}

        <form className={styles.form} action="/review/auth" method="post">
          <input name="next" type="hidden" value={next} />
          <label htmlFor="review-password">Password</label>
          <input
            autoComplete="current-password"
            autoFocus
            id="review-password"
            name="password"
            required
            type="password"
          />
          <button type="submit">Enter review</button>
        </form>
      </section>
    </main>
  );
}
