// Previous Direct by Design image import: import Image from "next/image";
import "./editorial-refinement.css";
// Previous intro media: import media from "@/content/site/about-richmond.generated.json";
import { Shell } from "./Shell";
import { BuyerFaq, WorkingProcess } from "./HowWeWork";
import { MovedAboutFragments } from "./MovedAboutFragments";

export function FaqEditorial() {
  return <Shell><div className="about-editorial faq-editorial">
    <MovedAboutFragments faq />
    <WorkingProcess />
    {/* Historical intro retained for rollback only. Studio positioning now lives beside the About portrait.
    <section className="faq-direct editorial-width" data-tone="paper" aria-labelledby="direct-title">
      <div><p className="label">Direct by design</p><h1 id="direct-title">A small studio with a clear point of contact.</h1>
        <p>RVA3D is built so the person you talk to stays close to the work. Deven leads the creative and production process from the first conversation through final delivery, keeping decisions direct and responsibility clear.</p>
        <p>When a project needs more hands or a specialized skill, RVA3D can bring in trusted artists, developers, production partners, or other specialists without adding unnecessary layers between you and the work. The team can expand around the problem while the relationship stays simple.</p>
        <p>The questions below cover the practical details that usually come up before a project begins.</p>
      </div>
      <Image {...media.studio} alt={media.studio.alt} sizes="(max-width: 700px) calc(100vw - 40px), 45vw" unoptimized />
    </section>
    */}
    <BuyerFaq />
  </div></Shell>;
}
