import Image from "next/image";
import data from "@/content/site/home.generated.json";
import { Brand } from "./Brand";
import { InquiryForm } from "./InquiryForm";
import { siteHref } from "@/lib/site/paths";
import { publicInquiryDeliveryEnabled } from "@/lib/site/runtime-environment";
// import data from "@/content/site/home.generated.json"; // Previous colored artwork.
export function Contact({ testMode = false }: { testMode?: boolean }) {
  return <section className="v-contact" id="contact" data-tone="void"><div className="v-frame v-contact-grid"><div className="v-contact-copy">
    {/* Previous: <img className="v-contact-logo" src={data.logoStill} alt="RVA3D" width={280} height={96} /> */}
    <Image className="v-contact-logo" data-brand-artwork="contact" src={data.logoStill} alt="RVA3D" width={1172} height={352} unoptimized />
    <p className="label">THE IDEA IS NOT THE PROBLEM.</p><h2>Add<br /><em>dimension</em><br />to your work.</h2>
    <p><Brand /> brings ideas to life with 3D animation, motion graphics, VFX, and interactive media.</p>
    <address><a href="mailto:hello@rva3d.com">hello@rva3d.com ↗</a><a href="tel:+18043928183">(804) 392-8183</a></address>
  </div>{/* Previous UI launch gate: process.env.RVA3D_PUBLIC_LAUNCH_ENABLED === "1". */}<InquiryForm testMode={testMode} sendingEnabled={publicInquiryDeliveryEnabled()} /></div><footer className="v-frame v-footer"><div><Brand /><span>Richmond, VA</span></div><nav className="v-footer-links" aria-label="Studio information"><a href={siteHref("/how-we-work")}>How we work</a><a href={siteHref("/how-we-work#faq")}>FAQ</a><a href={siteHref("/about#collaborate")}>Collaborate with <Brand /></a></nav><small>© 2026 Make It Move, LLC. All rights reserved.</small></footer></section>;
}
