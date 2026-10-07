import type { CSSProperties } from "react";
import type { AboutTestimonial } from "@/content/site/about_testimonials";
import { clearedAboutTestimonials } from "@/content/site/about_testimonials";
import styles from "./AboutTeam.module.css";

export function AboutTestimonials({ testimonials, privateReview = false }: {
  testimonials: readonly AboutTestimonial[];
  privateReview?: boolean;
}) {
  const quotes = privateReview ? testimonials.slice(0, 3) : clearedAboutTestimonials(testimonials);
  if (quotes.length === 0) return null;

  return <section className={styles.testimonials} data-tone="paper" aria-labelledby="testimonial-title">
    <div className={`${styles.width} ${styles.testimonialLayout}`}>
    <div className={styles.sectionHeading}>
      <p className={`label ${styles.feedbackLabel}`}>Client feedback</p>
      <h2 id="testimonial-title">What people say about working with us.</h2>
      {/* Previous contextual subtitle retained in historical records:
      <p>From clients and production partners on Deven’s work.</p> */}
      {privateReview && <p className={styles.reviewNotice}>Layout review — testimonial permission pending.</p>}
    </div>
    <div className={styles.quoteGrid} style={{ "--testimonial-count": quotes.length } as CSSProperties}>
      {quotes.map(testimonial => <figure key={testimonial.attribution} className={styles.quote}>
        <span className={styles.quoteMark} aria-hidden="true">“</span>
        <blockquote><p>{testimonial.quote}</p></blockquote>
        {/* Previous single-line attribution: <figcaption>{testimonial.attribution}</figcaption> */}
        <figcaption><strong>{testimonial.attribution}</strong>{testimonial.affiliation && <span>{testimonial.affiliation}</span>}</figcaption>
      </figure>)}
    </div>
    </div>
  </section>;
}
