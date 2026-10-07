import "./editorial-refinement.css";
import Image from "next/image";
import { aboutIntroduction, aboutTeam, aboutPromises, aboutFilmHighlights } from "@/content/site/about_team";
import { aboutTestimonials, type AboutTestimonial } from "@/content/site/about_testimonials";
import portraits from "@/content/site/about_team_media.generated.json";
import filmSlides from "@/content/site/richmond_films.generated.json";
import { siteHref } from "@/lib/site/paths";
import { publicInquiryDeliveryEnabled } from "@/lib/site/runtime-environment";
import { Shell } from "./Shell";
import { BrandText } from "./Brand";
import { AboutSkyline } from "./AboutSkyline";
import { AboutTestimonials } from "./AboutTestimonials";
import { CollaboratorContact } from "./CollaboratorContact";
import { MovedAboutFragments } from "./MovedAboutFragments";
import styles from "./AboutTeam.module.css";

// Reuse the exact owner-selected Filmapalooza red-carpet derivative.
const filmPhoto = filmSlides[1];

export function AboutTeamPage({ reviewTestimonials }: { reviewTestimonials?: readonly AboutTestimonial[] }) {
  return <Shell><div className={`about-editorial ${styles.page}`}>
    <MovedAboutFragments />
    <section className={styles.intro} id="communication" data-tone="void" aria-labelledby="studio-title">
      <div className={`${styles.width} ${styles.introGrid}`}>
        <h1 id="studio-title">Rendered with <em>Confidence</em></h1>
        <div className={styles.introCopy}>
          <p><BrandText text={aboutIntroduction} /></p>
          <a className={`editorial-link ${styles.faqLink}`} href={siteHref("/faq")}>Questions about working together? Read the FAQ <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
    <div className={styles.skyline}><AboutSkyline /></div>

    <section className={`${styles.width} ${styles.teamSection}`} id="team" data-tone="paper" aria-labelledby="team-title">
      <div className={styles.sectionHeading}>
        <h2 id="team-title">The people behind <BrandText text="RVA3D." /></h2>
        <p>A small team with complementary strengths.</p>
      </div>
      <div className={styles.profiles}>
        {aboutTeam.map(person => <article key={person.id} className={styles.profile} aria-labelledby={`${person.id}-name`}>
          <Image {...portraits[person.id]} alt={`${person.name}, ${person.role}`} className={styles.portrait} sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1099px) 34vw, 33vw" unoptimized />
          <div className={styles.profileCopy}>
            <h3 id={`${person.id}-name`}>{person.name}</h3>
            <p className={styles.role}>{person.role}</p>
            <p className={styles.biography}><BrandText text={person.biography} /></p>
          </div>
        </article>)}
      </div>
      <div className={styles.promises} aria-label="Working with RVA3D">
        {aboutPromises.map(promise => <article key={promise.title}>
          <h3>{promise.title}</h3><p>{promise.description}</p>
        </article>)}
      </div>
      <p className={styles.nearAndFar}>Based in Richmond. Working with clients near and far.</p>
    </section>

    <AboutTestimonials testimonials={reviewTestimonials ?? aboutTestimonials} privateReview={reviewTestimonials !== undefined} />

    <section className={`${styles.width} ${styles.filmSection}`} id="richmond" data-tone="paper" aria-labelledby="richmond-title">
      <div className={styles.filmGrid}>
        <div className={styles.filmCopy}>
          <h2 id="richmond-title">Rooted in Richmond.</h2>
          <p>Deven built his career alongside Richmond’s filmmakers and production crews. His 48 Hour Film Project work spans multiple teams, including <a href="https://vimeo.com/pixeldropfilms">Pixel Drop</a>.</p>
          <p>Deven also served as lead animator on Pixel Drop’s short film <a href="https://richmondmagazine.com/arts-entertainment/stage-screen/pixel-drop-cmyk-screens-at-cannes-film-festival/"><em>CMYK</em></a>, which screened in the HP/48HFP ‘Power of Ink’ program at Cannes.</p>
          <a className="editorial-link" href="https://vimeo.com/pixeldropfilms">Watch the films <span aria-hidden="true">↗</span></a>
        </div>
        <figure className={styles.filmPhoto}>
          <Image src={filmPhoto.src} width={filmPhoto.width} height={filmPhoto.height} alt={filmPhoto.alt} sizes="(max-width: 900px) calc(100vw - 40px), 55vw" unoptimized />
          <figcaption>Pixel Drop filmmakers on the Filmapalooza red carpet.</figcaption>
        </figure>
      </div>
      <dl className={styles.highlights}>
        {aboutFilmHighlights.map(highlight => <div key={highlight.value}>
          <dt>{highlight.value}</dt><dd><strong>{highlight.title}</strong><span>{highlight.context}</span></dd>
        </div>)}
      </dl>
    </section>

    {/* The approved collaboration invitation and existing form remain intact. */}
    <section className={`collaborate-section ${styles.collaboration}`} id="collaborate" data-tone="paper" aria-labelledby="collaborate-title">
      <div className="editorial-width collaborate-grid">
        <div><p className="label">Collaborate with RVA3D</p><h2 id="collaborate-title">Creative relationships <em>welcome.</em></h2></div>
        <div className="collaborate-copy"><p>RVA3D is open to more than client projects. We like meeting artists, filmmakers, designers, technologists, educators, schools, and community organizations when there’s a good reason to make something together.</p></div>
        <CollaboratorContact sendingEnabled={publicInquiryDeliveryEnabled()} />
      </div>
    </section>
  </div></Shell>;
}
