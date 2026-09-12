import { capabilities, getCapabilityOverviewMedia } from "@/content/capabilities";
import type { WorkMedia } from "@/content/work/types";
import { studies, headline, mediaUrl, protectedMedia } from "@/lib/site/content";
import { siteHref } from "@/lib/site/paths";
import { Shell } from "./Shell";
import { SiteMedia } from "./SiteMedia";
import { StudioExplorer } from "./StudioExplorer";
const examples: Record<string, string> = { "3d-animation": "cable-snake", "product-technical-visualization": "amsoil-xpd-wind-grease", "motion-design": "axe-whaxe-lil-baby", "vfx-compositing": "cable-snake", "creative-production-support": "capri-sun" };
const deliveries: Record<string, string> = { "3d-animation": "Custom models, animation, lighting, rendered sequences and finished shots. Build the product or character once, then find the right performance.", "product-technical-visualization": "Product stills, technical cutaways, explanatory sequences and alternate views. Turn CAD, physical references or incomplete source material into a clear visual story.", "motion-design": "Campaign sequences, title and graphic animation, product motion and alternate formats. Shape the message through design, timing and a coherent visual rhythm.", "vfx-compositing": "Tracked replacements, CG integration, cleanup, effects animation and final composites. Bring a plate, a problem shot or a plan for something the camera cannot capture.", "interactive-3d": "Browser-based 3D views, guided exploration and responsive information layers. Agree the useful interaction first, then design the controls and fallback around the audience.", "creative-production-support": "Focused ownership of a difficult asset, shot or sequence; additional production capacity; and help moving a concept through finishing and delivery." };
export function CapabilitiesPage() {
  return <Shell><section className="editorial-opening capability-opening" data-tone="purple"><div className="v-broad capability-intro-grid"><div><p className="label">Capabilities / Six ways in</p><h1>Give the idea<br />another <em>dimension.</em></h1><p className="editorial-lead">From a product that needs explaining to a shot that needs another reality. Bring RVA3D in for a focused contribution or a complete visual sequence.</p><a className="button" href={siteHref("/#contact")}>Get in touch ↗</a></div><div className="capability-intro-proof"><SiteMedia media={protectedMedia(studies.find(study => study.slug === "amsoil-xpd-wind-grease")!.heroMedia)} priority /><a href={siteHref("/work/amsoil-xpd-wind-grease")}>Inside the work: AMSOIL technical visualization ↗</a></div></div></section>
    <nav className="capability-jumps v-broad" aria-label="Jump to a capability">{capabilities.map(item => <a key={item.slug} href={`#${item.slug}`}><span>{item.number}</span>{item.title} <span aria-hidden="true">↓</span></a>)}</nav>
    <div className="capability-sections" data-tone="paper">{capabilities.map(capability => {
      const media = getCapabilityOverviewMedia(capability);
      const example = studies.find(study => study.slug === examples[capability.slug]);
      let display: WorkMedia | undefined;
      if (media.type === "video") display = { kind: "video", src: mediaUrl(media.src), mimeType: media.mimeType, width: media.width, height: media.height, alt: media.alt, presentation: "controls", hasAudio: false, poster: { kind: "image", ...media.poster, src: mediaUrl(media.poster.src), alt: media.alt } };
      else if (media.type === "image") display = { kind: "image", ...media, src: mediaUrl(media.src) };
      // Proof always belongs to the adjacent named case; the original sampler remains on the homepage.
      if (example) {
        const selected = capability.slug === "3d-animation" ? example.galleryMedia.find(media => media.kind === "video") || example.processChapters[1].media[2]
          : capability.slug === "product-technical-visualization" ? example.processChapters[2].media[0]
          : capability.slug === "motion-design" ? example.processChapters[1].media[0]
          : capability.slug === "vfx-compositing" ? example.processChapters[3].media[0] : example.heroMedia;
        display = protectedMedia(selected);
      }
      // Commissioned evidence makes production support concrete; the interface photograph remains in the registry.
      if (capability.slug === "creative-production-support" && example) display = protectedMedia(example.heroMedia);
      return <section className={`capability-section v-broad capability-${capability.slug}`} id={capability.slug} key={capability.slug}><div className="capability-number label">{capability.number} / 06</div><div className="capability-copy"><h2>{capability.title}</h2><p className="editorial-lead">{capability.overview}</p><p>{deliveries[capability.slug]}</p><h3>Useful when…</h3><ul>{capability.buyerNeeds.map(need => <li key={need}>{need}</li>)}</ul>{capability.slug === "vfx-compositing" && <a className="editorial-link" href={siteHref("/capabilities/vfx-compositing")}>Explore VFX and Compositing ↗</a>}</div><div className="capability-evidence">{display ? <SiteMedia media={display} /> : <StudioExplorer />}{example && <div className="example-context"><p className="label">In practice</p><a href={siteHref(`/work/${example.slug}`)}>{headline[example.slug]} ↗</a><p>{example.indexSummary}</p></div>}</div></section>;
    })}</div>
    <section className="v-frame collaboration-note" data-tone="paper"><p className="label">Working together</p><h2>Bring the brief.<br />Or the tricky part.</h2><p>You work directly with Deven Langston. Share the audience, what needs to be shown, the source material you have and where the finished work will live. RVA3D can lead a defined piece of work or collaborate with your existing team.</p><a className="editorial-link" href={siteHref("/work")}>See how that looks in practice ↗</a></section>
  </Shell>;
}
