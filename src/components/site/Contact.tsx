import { Brand } from "./Brand";
import { InquiryForm } from "./InquiryForm";
import data from "@/content/site/home.generated.json";
export function Contact({ testMode = false }: { testMode?: boolean }) {
  return <section className="v-contact" id="contact" data-tone="void"><div className="v-frame v-contact-grid"><div className="v-contact-copy">
    {/* Approved artwork is served through the authenticated exact media manifest. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img className="v-contact-logo" src={data.logoStill} alt="RVA3D" width={280} height={96} />
    <p className="label">THE IDEA IS NOT THE PROBLEM.</p><h2>Add<br /><em>dimension</em><br />to your work.</h2>
    <p><Brand /> brings ideas to life with 3D animation, motion graphics, VFX, and interactive media.</p>
    <address><a href="mailto:hello@rva3d.com">hello@rva3d.com ↗</a><a href="tel:+18043928183">(804) 392-8183</a></address>
  </div><InquiryForm testMode={testMode} sendingEnabled={process.env.RVA3D_PUBLIC_LAUNCH_ENABLED === "1"} /></div><footer className="v-frame v-footer"><div><Brand /><span>Richmond, VA</span></div><small>© 2026 Make It Move, LLC. All rights reserved.</small></footer></section>;
}
