"use client";

import { useImageSlideshow } from "@/hooks/use_image_slideshow";
import { CapabilityFullscreen } from "./CapabilityFullscreen";
import { WorkMedia } from "@/components/work/WorkMedia";
import type { WorkImageMedia } from "@/content/work/types";
import { useGeicoPlayback } from "./GeicoMedia";
import styles from "./GeicoInteractions.module.css";

export function GeicoSetSlideshow({ slides }: { slides: WorkImageMedia[] }) {
  /* Previous player preserved for restoration. Shared playback now also handles
     hover, persistent focus/manual pauses, and manual fullscreen inspection.
  const root = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(true);
  const [reduced, setReduced] = useState(true);
  const [paused, setPaused] = useState(false);
  const { mainPlaying, modalOpen } = useGeicoPlayback();
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduced(media.matches);
    const visibility = () => setActive(!document.hidden);
    motion(); visibility();
    media.addEventListener("change", motion);
    document.addEventListener("visibilitychange", visibility);
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(entries => setVisible(entries[0].isIntersecting), { threshold: .25 });
    if (root.current) observer?.observe(root.current);
    return () => { observer?.disconnect(); media.removeEventListener("change", motion); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const eligible = visible && active && !paused && !reduced && !mainPlaying && !modalOpen;
  useEffect(() => {
    if (!eligible) return;
    const timer = setTimeout(() => setIndex(previous => (previous + 1) % slides.length), 5000);
    return () => clearTimeout(timer);
  }, [eligible, index, slides.length]);
  function step(direction: number) { setIndex(previous => (previous + direction + slides.length) % slides.length); }
  */
  const { mainPlaying, modalOpen } = useGeicoPlayback();
  const { root, index, visible, eligible, paused, reduced, fullscreen, step, toggle, pausePointerDown, interactionProps } = useImageSlideshow({ count: slides.length, blocked: mainPlaying || modalOpen });
  if (!slides.length) return null;
  return <div ref={root} {...interactionProps} className={styles.slideshow} role="region" aria-roledescription="carousel" aria-label="Photographs of the practical set" data-active-slide={index} data-autoplay={eligible}>
    <div className={styles.slides} style={{ aspectRatio: `${slides[0].width} / ${slides[0].height}` }}>
      {slides.map((media, slide) => (slide === 0 || visible || slide === index) && <div className={styles.slide} key={media.src} aria-hidden={slide !== index} data-current={slide === index} role="group" aria-roledescription="slide" aria-label={`${slide + 1} of ${slides.length}`}>
        <WorkMedia media={media} privateDelivery sizes="(max-width: 760px) calc(100vw - 40px), 58vw" />
      </div>)}
      <CapabilityFullscreen targetRef={root} kind="image" variant="homepage" />
      <div className={styles.slideControls}>
        <button data-media-control className="custom-control" type="button" onClick={() => step(-1)} disabled={slides.length < 2} aria-label="Previous set photograph"><span aria-hidden="true">‹</span></button>
        <button data-media-control className="custom-control" type="button" onPointerDown={pausePointerDown} onClick={toggle} disabled={reduced || fullscreen || slides.length < 2} aria-label={fullscreen ? "Fullscreen photographs use manual navigation" : reduced ? "Slideshow autoplay disabled by reduced motion" : paused ? "Play set slideshow" : "Pause set slideshow"}><span aria-hidden="true">{paused || reduced ? "▶" : "Ⅱ"}</span></button>
        <button data-media-control className="custom-control" type="button" onClick={() => step(1)} disabled={slides.length < 2} aria-label="Next set photograph"><span aria-hidden="true">›</span></button>
      </div>
    </div>
  </div>;
}
