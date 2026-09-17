import type { Metadata } from "next";

// V2 remains intact at 5623e596 and safety/hello-v2-5623e596.
import HelloRefinedExperience from "./HelloRefinedExperience";
import { mediaUrl } from "@/lib/site/content";
import { HELLO_MODEL_SOURCE } from "./hello_timeline";

// Keep the QR destination and metadata from the previous /hello review page.
export const metadata: Metadata = {
  title: "Hello | RVA3D",
  description:
    "A quick introduction to RVA3D, a Richmond creative studio for 3D visualization, animation, motion design, VFX, and interactive work.",
  alternates: { canonical: "https://www.rva3d.com/hello" },
  openGraph: {
    type: "website",
    url: "https://www.rva3d.com/hello",
    title: "Hello | RVA3D",
    description: "Very nice to meet you. A small introduction with an extra dimension.",
  },
};

export default function HelloPage() {
  return <HelloRefinedExperience modelUrl={mediaUrl(HELLO_MODEL_SOURCE)} />;
}

// Production landing page preserved for rollback; the intro replaces its presentation.
// import type { Metadata } from "next";
//
// import { Brand } from "@/components/site/Brand";
//
// import styles from "./hello.module.css";
//
// const publicSite = "https://www.rva3d.com";
//
// export const metadata: Metadata = {
//   title: "Hello | RVA3D",
//   description:
//     "A quick introduction to RVA3D, a Richmond creative studio for 3D visualization, animation, motion design, VFX, and interactive work.",
//   alternates: { canonical: `${publicSite}/hello` },
//   openGraph: {
//     type: "website",
//     url: `${publicSite}/hello`,
//     title: "Hello | RVA3D",
//     description:
//       "Add dimension to your work with 3D visualization, animation, motion design, VFX, and interactive work.",
//   },
// };
//
// const primaryActions = [
//   {
//     id: "hello-work",
//     tracking: "work",
//     label: "SEE THE WORK",
//     href: `${publicSite}/work`,
//     strongest: false,
//   },
//   {
//     id: "hello-capabilities",
//     tracking: "capabilities",
//     label: "WHAT WE DO",
//     href: `${publicSite}/#capabilities`,
//     strongest: false,
//   },
//   {
//     id: "hello-contact",
//     tracking: "contact",
//     label: "START A PROJECT",
//     href: `${publicSite}/#contact`,
//     strongest: true,
//   },
// ] as const;
//
// export default function HelloPage() {
//   return (
//     <main className={styles.page}>
//       <a className={styles.skipLink} href="#hello-introduction">
//         Skip to introduction
//       </a>
//
//       <header className={styles.header} aria-label="RVA3D introduction">
//         <a
//           className={styles.logo}
//           href={`${publicSite}/`}
//           aria-label="RVA3D home"
//         >
//           <Brand accent />
//         </a>
//         <p>Richmond, Virginia</p>
//       </header>
//
//       <section className={styles.hero} aria-labelledby="hello-title">
//         <div className={styles.heroCopy}>
//           <p className={styles.eyebrow}>Good to meet you.</p>
//           <h1 id="hello-title">Add dimension to your work.</h1>
//         </div>
//
//         <figure
//           className={styles.proof}
//           aria-labelledby="hello-proof-title hello-proof-caption"
//         >
//           <div className={styles.proofStage} aria-hidden="true">
//             <span className={styles.proofGrid} />
//             <span className={`${styles.proofPlane} ${styles.proofPlaneBack}`}>
//               IMAGE
//             </span>
//             <span className={`${styles.proofPlane} ${styles.proofPlaneMiddle}`}>
//               MOTION
//             </span>
//             <span className={`${styles.proofPlane} ${styles.proofPlaneFront}`}>
//               <span>3D</span>
//               <small>RVA</small>
//             </span>
//             <span className={styles.proofOrbit}>INTERACTIVE</span>
//           </div>
//           <figcaption id="hello-proof-caption">
//             <strong id="hello-proof-title">Ideas, made visible.</strong>
//             <span>
//               3D visualization · Animation · Motion design · VFX · Interactive
//             </span>
//           </figcaption>
//         </figure>
//       </section>
//
//       <section
//         className={styles.introduction}
//         id="hello-introduction"
//         aria-labelledby="hello-introduction-title"
//       >
//         <h2 className={styles.visuallyHidden} id="hello-introduction-title">
//           About RVA3D
//         </h2>
//         <p className={styles.lead}>
//           <Brand /> is a Richmond-based creative studio for 3D visualization,
//           animation, motion design, VFX and interactive work.
//         </p>
//         <p>
//           We help brands, agencies and production teams show what can’t be
//           filmed, explain what’s hard to see and make ideas harder to ignore.
//         </p>
//       </section>
//
//       <nav className={styles.actions} aria-label="Where to go next">
//         {primaryActions.map((action) => (
//           <a
//             className={`${styles.action}${action.strongest ? ` ${styles.actionStrongest}` : ""}`}
//             data-hello-action={action.tracking}
//             href={action.href}
//             id={action.id}
//             key={action.id}
//           >
//             <span>{action.label}</span>
//             <span aria-hidden="true">→</span>
//           </a>
//         ))}
//       </nav>
//
//       <section className={styles.contact} aria-labelledby="hello-contact-title">
//         <div>
//           <p className={styles.eyebrow}>Direct contact</p>
//           <h2 id="hello-contact-title">Deven Langston</h2>
//           <p className={styles.role}>Owner / Lead Artist</p>
//         </div>
//         <address>
//           <a
//             data-hello-action="email"
//             href="mailto:deven@rva3d.com"
//             id="hello-email"
//             aria-label="Email Deven at deven@rva3d.com"
//           >
//             deven@rva3d.com
//           </a>
//           <a
//             data-hello-action="phone"
//             href="tel:+18043928183"
//             id="hello-phone"
//             aria-label="Call Deven at 804 392 8183"
//           >
//             (804) 392-8183
//           </a>
//           <a href={`${publicSite}/`}>rva3d.com</a>
//         </address>
//       </section>
//
//       <footer className={styles.footer}>
//         <span>RVA3D · Richmond, VA</span>
//         <a href={`${publicSite}/`}>Explore the full site →</a>
//       </footer>
//     </main>
//   );
// }
