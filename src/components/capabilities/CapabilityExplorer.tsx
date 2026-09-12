"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type AnimationEvent,
  type KeyboardEvent,
} from "react";

import { capabilities } from "@/content/capabilities";
import type { CapabilitySlug } from "@/content/capabilities";

import { CapabilityMedia } from "./CapabilityMedia";
import styles from "./CapabilityExplorer.module.css";

const EXIT_VIEWPORT_EDGE = 0.5;
const INTRO_USABLE_VIEWPORT_POSITION = 0.7;

export function CapabilityExplorer() {
  const explorerRef = useRef<HTMLDivElement>(null);
  // A null selection is intentional: the cover is the explorer's initial state.
  const [selectedSlug, setSelectedSlug] = useState<CapabilitySlug | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<CapabilitySlug>();
  const [isResetting, setIsResetting] = useState(false);
  const [introEntered, setIntroEntered] = useState(false);
  const [introAnimationComplete, setIntroAnimationComplete] = useState(false);
  const selected = capabilities.find(
    (capability) => capability.slug === selectedSlug,
  );

  useEffect(() => {
    const explorer = explorerRef.current;
    if (!explorer) return;

    /* Previous trigger retained for rollback reference. It observed the much
       larger explorer and fired before the heading itself reached the user:
       const observer = new IntersectionObserver(..., {
         rootMargin: "0px 0px -12% 0px",
         threshold: 0.2,
       });
       observer.observe(explorer); */
    const pageHeader = document.querySelector<HTMLElement>("body header");
    const headingTriggers = Array.from(
      explorer.querySelectorAll<HTMLElement>(
        "[data-capability-heading-trigger]",
      ),
    );
    let observer: IntersectionObserver | null = null;
    let resizeFrame = 0;
    let introTriggered = false;

    const enterHeading = () => {
      if (introTriggered) return;
      introTriggered = true;
      explorer.dataset.capabilityIntroState = "entered";
      setIntroEntered(true);
      observer?.disconnect();
    };

    const observeVisibleHeading = () => {
      observer?.disconnect();
      if (introTriggered) return;

      const trigger = headingTriggers.find(
        (candidate) => candidate.getClientRects().length > 0,
      );
      if (!trigger) return;

      const headerHeight = pageHeader?.getBoundingClientRect().height ?? 0;
      const usableViewportHeight = Math.max(
        1,
        window.innerHeight - headerHeight,
      );
      const triggerBounds = trigger.getBoundingClientRect();
      const triggerLine =
        headerHeight +
        usableViewportHeight * INTRO_USABLE_VIEWPORT_POSITION;
      const bottomInset = Math.max(0, window.innerHeight - triggerLine);

      explorer.dataset.capabilityIntroTrigger = "heading-wrapper";
      explorer.dataset.capabilityIntroTriggerLine = triggerLine.toFixed(1);

      // Fast scrolling, direct anchors, and restored scroll positions can put
      // the wrapper above the trigger before the observer's first callback.
      if (triggerBounds.top <= triggerLine) {
        enterHeading();
        return;
      }

      observer = new IntersectionObserver(
        ([entry]) => {
          if (
            entry.isIntersecting ||
            entry.boundingClientRect.top <= triggerLine
          ) {
            enterHeading();
          }
        },
        {
          rootMargin: `-${headerHeight}px 0px -${bottomInset}px 0px`,
          threshold: 0.01,
        },
      );
      observer.observe(trigger);
    };

    const scheduleMeasurement = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(observeVisibleHeading);
    };

    const headerObserver = pageHeader
      ? new ResizeObserver(scheduleMeasurement)
      : null;
    if (headerObserver && pageHeader) headerObserver.observe(pageHeader);
    observeVisibleHeading();
    window.addEventListener("resize", scheduleMeasurement);
    window.addEventListener("orientationchange", scheduleMeasurement);

    return () => {
      observer?.disconnect();
      headerObserver?.disconnect();
      window.cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", scheduleMeasurement);
      window.removeEventListener("orientationchange", scheduleMeasurement);
    };
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedSlug(null);
    setExpandedSlug(undefined);
    setIsResetting(false);
  }, []);

  const beginReset = useCallback(() => {
    const shouldResetImmediately =
      selectedSlug === null ||
      window.matchMedia("(max-width: 900px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (shouldResetImmediately) {
      clearSelection();
      return;
    }

    setIsResetting(true);
  }, [clearSelection, selectedSlug]);

  useEffect(() => {
    const explorer = explorerRef.current;

    if (
      !explorer ||
      isResetting ||
      (selectedSlug === null && expandedSlug === undefined)
    ) {
      return;
    }

    const explorerElement = explorer;
    let lastScrollY = window.scrollY;
    let lastDirection: "up" | "down" = "down";

    function maybeReset(preserveKeyboardFocus = true) {
      const nextScrollY = window.scrollY;

      if (nextScrollY > lastScrollY) {
        lastDirection = "down";
      } else if (nextScrollY < lastScrollY) {
        lastDirection = "up";
      }

      lastScrollY = nextScrollY;

      const activeElement = document.activeElement;
      const keyboardFocusIsInside =
        preserveKeyboardFocus &&
        activeElement instanceof HTMLElement &&
        explorerElement.contains(activeElement) &&
        activeElement.matches(":focus-visible");

      if (keyboardFocusIsInside) {
        return;
      }

      const bounds = explorerElement.getBoundingClientRect();
      const viewportEdge = window.innerHeight * EXIT_VIEWPORT_EDGE;
      const isLeaving =
        (lastDirection === "down" && bounds.bottom <= viewportEdge) ||
        (lastDirection === "up" && bounds.top >= viewportEdge);

      if (isLeaving) {
        beginReset();
      }
    }

    function handleScroll() {
      maybeReset();
    }

    function handleFocusOut(event: FocusEvent) {
      const nextTarget = event.relatedTarget;

      if (nextTarget instanceof Node && explorerElement.contains(nextTarget)) {
        return;
      }

      maybeReset(false);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    explorerElement.addEventListener("focusout", handleFocusOut);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      explorerElement.removeEventListener("focusout", handleFocusOut);
    };
  }, [beginReset, expandedSlug, isResetting, selectedSlug]);

  function selectCapability(slug: CapabilitySlug) {
    setIsResetting(false);
    setSelectedSlug(slug);
  }

  function handleDetailAnimationEnd(event: AnimationEvent<HTMLDivElement>) {
    if (!isResetting || event.currentTarget !== event.target) {
      return;
    }

    clearSelection();
  }

  function handleIntroAnimationEnd(event: AnimationEvent<HTMLHeadingElement>) {
    if (event.currentTarget !== event.target) return;
    setIntroAnimationComplete(true);
  }

  function handleControlKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % capabilities.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + capabilities.length) % capabilities.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = capabilities.length - 1;
    }

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    const nextCapability = capabilities[nextIndex];
    selectCapability(nextCapability.slug);
    event.currentTarget
      .closest('[role="group"]')
      ?.querySelector<HTMLButtonElement>(
        `[data-capability-control="${nextCapability.slug}"]`,
      )
      ?.focus();
  }

  function renderCover(className: string) {
    return (
      <div className={className}>
        <p className={styles.sectionLabel}>Capabilities</p>
        <div
          className={styles.capabilityHeadingPerspective}
          data-capability-heading-trigger
        >
          <h2
            className={
              introAnimationComplete
                ? styles.capabilityHeadingLanded
                : introEntered
                  ? styles.capabilityHeadingEntered
                  : styles.capabilityHeadingReady
            }
            data-capability-heading-state={
              introAnimationComplete
                ? "landed"
                : introEntered
                  ? "entered"
                  : "ready"
            }
            onAnimationEnd={handleIntroAnimationEnd}
          >
            Here&apos;s what we do.
          </h2>
        </div>
        <p className={styles.coverLead}>
          RVA3D has tools and techniques to tackle all things 3D.
        </p>
        <Link className={styles.overviewLink} href="/capabilities">
          Explore all capabilities <span aria-hidden="true">↗</span>
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.explorer} ref={explorerRef}>
      <div
        className={styles.desktopPanel}
        id="capability-desktop-panel"
        role="region"
        aria-label={selected?.title ?? "Capabilities overview"}
        aria-live="polite"
        aria-atomic="true"
      >
        {selected ? (
          <div
            className={[
              styles.desktopDetail,
              isResetting ? styles.desktopDetailLeaving : "",
            ]
              .filter(Boolean)
              .join(" ")}
            key={selected.slug}
            onAnimationEnd={handleDetailAnimationEnd}
          >
            <p className={styles.previewNumber}>{selected.number} / 06</p>
            <h2>{selected.title}</h2>
            <p className={styles.promise}>{selected.homepagePromise}</p>
            <div className={styles.previewVisual}>
              <CapabilityMedia
                active
                compact
                label={selected.title}
                media={selected.homepageMedia}
                motif={selected.motif}
              />
            </div>
            <ul
              className={styles.proofLabels}
              aria-label="Representative strengths"
            >
              {selected.proofLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
            {selected.publication.detailStatus === "published" ? (
              <Link
                className={styles.previewLink}
                href={`/capabilities/${selected.slug}`}
              >
                {selected.publication.detailCta}
                <span aria-hidden="true">↗</span>
              </Link>
            ) : (
              <Link
                className={styles.previewLink}
                href={`/capabilities#${selected.slug}`}
              >
                Explore on the capabilities overview
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        ) : (
          renderCover(styles.desktopCover)
        )}
      </div>

      <div
        className={styles.desktopControls}
        role="group"
        aria-label="Choose a capability to preview"
      >
        {capabilities.map((capability, index) => {
          const isSelected = selectedSlug === capability.slug;

          return (
            <div className={styles.row} key={capability.slug}>
              <button
                className={isSelected ? styles.selected : undefined}
                type="button"
                id={`capability-control-${capability.slug}`}
                data-capability-control={capability.slug}
                aria-controls="capability-desktop-panel"
                aria-pressed={isSelected}
                onClick={() => selectCapability(capability.slug)}
                onKeyDown={(event) => handleControlKeyDown(event, index)}
              >
                <span className={styles.number}>{capability.number}</span>
                <span>{capability.title}</span>
              </button>
            </div>
          );
        })}
      </div>

      {renderCover(styles.mobileIntro)}

      <div className={styles.mobileControls}>
        {capabilities.map((capability) => {
          const isExpanded = expandedSlug === capability.slug;
          const panelId = `capability-panel-${capability.slug}`;

          return (
            <div className={styles.row} key={capability.slug}>
              <button
                className={isExpanded ? styles.selected : undefined}
                type="button"
                aria-controls={panelId}
                aria-expanded={isExpanded}
                onClick={() =>
                  setExpandedSlug((current) =>
                    current === capability.slug ? undefined : capability.slug,
                  )
                }
              >
                <span className={styles.number}>{capability.number}</span>
                <span>{capability.title}</span>
                <span className={styles.icon} aria-hidden="true">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>
              <div
                className={styles.mobilePanel}
                id={panelId}
                hidden={!isExpanded}
              >
                <p>{capability.homepagePromise}</p>
                {isExpanded ? (
                  <CapabilityMedia
                    active
                    compact
                    label={capability.title}
                    media={capability.homepageMedia}
                    motif={capability.motif}
                  />
                ) : null}
                {capability.publication.detailStatus === "published" ? (
                  <Link href={`/capabilities/${capability.slug}`}>
                    {capability.publication.detailCta}
                    <span aria-hidden="true">↗</span>
                  </Link>
                ) : (
                  <Link href={`/capabilities#${capability.slug}`}>
                    Explore on the overview
                    <span aria-hidden="true">→</span>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
