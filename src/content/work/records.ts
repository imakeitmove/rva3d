import { geicoGeckosCerealBox } from "./cases/geico-geckos-cereal-box.ts";
import { amsoilXpdWindGrease } from "./cases/amsoil-xpd-wind-grease.ts";
import { axeWhaxeLilBaby } from "./cases/axe-whaxe-lil-baby.ts";
import { cableSnake } from "./cases/cable-snake.ts";
import { capriSun } from "./cases/capri-sun.ts";
import { wawaCoffeeIsland } from "./cases/wawa-coffee-island.ts";

// The array order is deliberately independent from the portfolio order below.
// This makes reordering a content decision rather than a layout change.
export const workRecords = [
  cableSnake,
  amsoilXpdWindGrease,
  capriSun,
  axeWhaxeLilBaby,
  wawaCoffeeIsland,
  geicoGeckosCerealBox,
] as const;

export const portfolioWorkSlugs = [
  "cable-snake",
  "amsoil-xpd-wind-grease",
  "capri-sun",
  "axe-whaxe-lil-baby",
  "wawa-coffee-island",
  "geico-geckos-cereal-box",
] as const;
