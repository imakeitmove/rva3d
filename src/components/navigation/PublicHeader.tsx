"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type CSSProperties } from "react";

import styles from "./PublicHeader.module.css";

type PublicHeaderProps = {
  initialColor?: string;
  overlay?: boolean;
};

type HeaderStyle = CSSProperties & {
  "--header-surface": string;
};

type HeaderTone = "dark" | "light";

const DEFAULT_HEADER_SURFACE = "#080a09";

const navigation = [
  { href: "/work", label: "Work", section: "/work" },
  {
    href: "/capabilities",
    label: "Capabilities",
    section: "/capabilities",
  },
  { href: "/#about", label: "About", section: undefined },
  { href: "/#contact", label: "Contact", section: undefined },
] as const;

function parseHexColor(color: string) {
  const match = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);

  if (!match) {
    return undefined;
  }

  return match.slice(1).map((channel) => Number.parseInt(channel, 16));
}

function relativeLuminance(color: string) {
  const channels = parseHexColor(color);

  if (!channels) {
    return 0;
  }

  const [red, green, blue] = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045
      ? normalized / 12.92
      : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function getHeaderTone(color: string): HeaderTone {
  const backgroundLuminance = relativeLuminance(color);
  const lightInkLuminance = relativeLuminance("#f3f1e9");
  const darkInkLuminance = relativeLuminance("#0b0d0c");
  const lightInkContrast =
    (lightInkLuminance + 0.05) / (backgroundLuminance + 0.05);
  const darkInkContrast =
    (backgroundLuminance + 0.05) / (darkInkLuminance + 0.05);

  return darkInkContrast > lightInkContrast ? "light" : "dark";
}

export function PublicHeader({
  initialColor = DEFAULT_HEADER_SURFACE,
  overlay = false,
}: PublicHeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);
  const initialTone = getHeaderTone(initialColor);

  useEffect(() => {
    const header = headerRef.current;

    if (!header) {
      return;
    }

    const adaptiveHeader = header;

    let intersectionObserver: IntersectionObserver | undefined;
    let activeColor = initialColor;
    const activeRegions = new Set<HTMLElement>();

    function applyRegion(region: HTMLElement) {
      const nextColor = region.dataset.navColor;

      if (!nextColor || !parseHexColor(nextColor) || nextColor === activeColor) {
        return;
      }

      const nextTone = getHeaderTone(nextColor);
      const toneChanges = adaptiveHeader.dataset.navTone !== nextTone;

      if (toneChanges) {
        // A delayed dark/light handoff would pass through a midtone where the
        // two editorial ink palettes can both miss AA. Apply cross-tone
        // changes atomically; same-tone region colors retain the soft blend.
        adaptiveHeader.dataset.navTransition = "instant";
        adaptiveHeader.dataset.navTone = nextTone;
      }

      adaptiveHeader.style.setProperty("--header-surface", nextColor);
      activeColor = nextColor;

      if (toneChanges) {
        window.getComputedStyle(adaptiveHeader).getPropertyValue("background-color");
        delete adaptiveHeader.dataset.navTransition;
      }
    }

    function observeRegions() {
      intersectionObserver?.disconnect();
      activeRegions.clear();

      const regions = Array.from(
        document.querySelectorAll<HTMLElement>("[data-nav-color]"),
      ).filter((region) =>
        Boolean(parseHexColor(region.dataset.navColor ?? "")),
      );

      if (regions.length === 0) {
        return;
      }

      const headerHeight = Math.ceil(
        adaptiveHeader.getBoundingClientRect().height,
      );
      const observationLine = Math.min(
        window.innerHeight - 1,
        headerHeight + 1,
      );
      const bottomInset = Math.max(
        0,
        window.innerHeight - observationLine - 1,
      );
      const initialRegions = regions.filter((region) => {
        const bounds = region.getBoundingClientRect();
        return bounds.top <= observationLine && bounds.bottom > observationLine;
      });
      const initialRegion = initialRegions[initialRegions.length - 1];

      if (initialRegion) {
        applyRegion(initialRegion);
      }

      intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const region = entry.target as HTMLElement;

            if (entry.isIntersecting) {
              activeRegions.add(region);
            } else {
              activeRegions.delete(region);
            }
          });

          const matchingRegions = regions.filter((region) =>
            activeRegions.has(region),
          );
          const activeRegion = matchingRegions[matchingRegions.length - 1];

          if (activeRegion) {
            applyRegion(activeRegion);
          }
        },
        {
          rootMargin:
            "-" +
            observationLine +
            "px 0px -" +
            bottomInset +
            "px 0px",
          threshold: 0,
        },
      );

      regions.forEach((region) => intersectionObserver?.observe(region));
    }

    const resizeObserver = new ResizeObserver(observeRegions);
    resizeObserver.observe(adaptiveHeader);
    window.addEventListener("resize", observeRegions);
    observeRegions();

    return () => {
      intersectionObserver?.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("resize", observeRegions);
    };
  }, [initialColor, pathname]);

  return (
    <header
      className={styles.header}
      data-nav-tone={initialTone}
      data-overlay={overlay ? "true" : undefined}
      ref={headerRef}
      style={{ "--header-surface": initialColor } as HeaderStyle}
    >
      {/* The previous header element was itself the constrained three-column
        grid. The inner wrapper preserves that alignment while the sticky
        solid surface can span the full viewport. */}
      <div className={styles.inner}>
        <Link className={styles.brand} href="/" aria-label="RVA3D home">
          <span aria-hidden="true" className={styles.brandVisual}>
            <span className={styles.brandRva}>RVA</span>
            <span className={styles.brandGroovy}>
              <span className={styles.brandThree}>3</span>
              <span className={styles.brandD}>D</span>
            </span>
          </span>
        </Link>
        <nav className={styles.nav} aria-label="Primary navigation">
          {navigation.map((item) => {
            const isActive = item.section
              ? pathname === item.section ||
                pathname.startsWith(item.section + "/")
              : false;

            return (
              <Link
                className={isActive ? styles.active : undefined}
                href={item.href}
                key={item.href}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link className={styles.projectLink} href="/#contact">
          Start a project
          <span aria-hidden="true">{"\u2197"}</span>
        </Link>
      </div>
    </header>
  );
}
