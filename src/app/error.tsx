"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="editorial-opening"><div className="v-frame"><p className="label">RVA3D</p><h1>Something interrupted this view.</h1><p>Your browser can try loading the page again.</p><button className="button" onClick={reset}>Try again ↗</button><p><Link href="/review/site/">Back to the main site</Link></p></div></main>;
}
