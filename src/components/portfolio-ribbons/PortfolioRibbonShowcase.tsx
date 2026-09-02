"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { PortfolioRibbonImage } from "@/types/portfolio-ribbon";

import { PortfolioLightbox } from "./PortfolioLightbox";
import { PortfolioRibbon } from "./PortfolioRibbon";
import styles from "./PortfolioRibbons.module.css";

const RIBBON_SELECTION_COUNT = 8;

function randomInteger(maximum: number) {
  if (maximum <= 1) return 0;
  const limit = Math.floor(0x100000000 / maximum) * maximum;
  const value = new Uint32Array(1);

  do {
    window.crypto.getRandomValues(value);
  } while (value[0] >= limit);

  return value[0] % maximum;
}

function shuffled<T>(items: T[]) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInteger(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function makeBalancedSelection(
  images: readonly PortfolioRibbonImage[],
  randomize: boolean,
) {
  const groups = new Map<string, PortfolioRibbonImage[]>();
  images.forEach((image) => {
    const group = groups.get(image.group) ?? [];
    group.push(image);
    groups.set(image.group, group);
  });

  const queues = [...groups.values()].map((group) =>
    randomize ? shuffled(group) : [...group],
  );
  const orderedQueues = randomize ? shuffled(queues) : queues;
  const selection: PortfolioRibbonImage[] = [];

  while (
    selection.length < Math.min(RIBBON_SELECTION_COUNT, images.length) &&
    orderedQueues.some((queue) => queue.length > 0)
  ) {
    orderedQueues.forEach((queue) => {
      const nextImage = queue.shift();
      if (nextImage && selection.length < RIBBON_SELECTION_COUNT) {
        selection.push(nextImage);
      }
    });
  }

  return selection;
}

type ActiveGallery = {
  index: number;
  ribbon: "top" | "bottom";
};

type PortfolioRibbonShowcaseProps = {
  bottomImages: readonly PortfolioRibbonImage[];
  children: ReactNode;
  topImages: readonly PortfolioRibbonImage[];
};

export function PortfolioRibbonShowcase({
  bottomImages,
  children,
  topImages,
}: PortfolioRibbonShowcaseProps) {
  const initialTopSelection = useMemo(
    () => makeBalancedSelection(topImages, false),
    [topImages],
  );
  const initialBottomSelection = useMemo(
    () => makeBalancedSelection(bottomImages, false),
    [bottomImages],
  );
  const [selectedTopImages, setSelectedTopImages] = useState(
    initialTopSelection,
  );
  const [selectedBottomImages, setSelectedBottomImages] = useState(
    initialBottomSelection,
  );
  const [activeGallery, setActiveGallery] = useState<ActiveGallery | null>(
    null,
  );
  const originRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSelectedTopImages(makeBalancedSelection(topImages, true));
      setSelectedBottomImages(makeBalancedSelection(bottomImages, true));
    });

    return () => window.cancelAnimationFrame(frame);
  }, [bottomImages, topImages]);

  const openTopImage = useCallback((index: number, origin: HTMLElement) => {
    originRef.current = origin;
    setActiveGallery({ index, ribbon: "top" });
  }, []);
  const openBottomImage = useCallback((index: number, origin: HTMLElement) => {
    originRef.current = origin;
    setActiveGallery({ index, ribbon: "bottom" });
  }, []);
  const closeLightbox = useCallback(() => {
    setActiveGallery(null);
    window.requestAnimationFrame(() => originRef.current?.focus());
  }, []);
  const stepLightbox = useCallback(
    (direction: -1 | 1) => {
      setActiveGallery((current) => {
        if (!current) return current;
        const imageCount =
          current.ribbon === "top"
            ? selectedTopImages.length
            : selectedBottomImages.length;
        if (imageCount === 0) return current;

        return {
          ...current,
          index: (current.index + direction + imageCount) % imageCount,
        };
      });
    },
    [selectedBottomImages.length, selectedTopImages.length],
  );

  const activeImages =
    activeGallery?.ribbon === "bottom"
      ? selectedBottomImages
      : selectedTopImages;

  return (
    <div
      className={styles.showcase}
      data-portfolio-bottom-selection={selectedBottomImages
        .map((image) => image.fileName)
        .join(",")}
      data-portfolio-top-selection={selectedTopImages
        .map((image) => image.fileName)
        .join(",")}
    >
      <PortfolioRibbon
        direction={-1}
        galleryOffset={0}
        images={selectedTopImages}
        label="Featured work, upper ribbon"
        onActivate={openTopImage}
        paused={activeGallery !== null}
        position={0}
        variant="upper"
      />

      {children}

      <PortfolioRibbon
        direction={1}
        galleryOffset={0}
        images={selectedBottomImages}
        label="Featured work, lower ribbon"
        onActivate={openBottomImage}
        paused={activeGallery !== null}
        position={1}
        variant="lower"
      />

      <PortfolioLightbox
        activeIndex={activeGallery?.index ?? null}
        images={activeImages}
        onClose={closeLightbox}
        onStep={stepLightbox}
      />
    </div>
  );
}
