import type { WorkImageMedia, WorkVideoMedia } from "./types";
import original from "../site/geico.generated.json" with { type: "json" };
import process from "../site/geico_phase_2.generated.json" with { type: "json" };
import reference from "../site/geico_review_refinements.generated.json" with { type: "json" };
import printed from "../site/geico_printed_artwork.generated.json" with { type: "json" };

// Existing approved media keys and publication records stay authoritative.
// Replace commercial source, poster and stage caption together when the owner supplies the final master.
export const geicoRefresh = {
  hero: { ...process.hero, caption: "CG box integrated with the live-action plate — before final color.", statusLabel: "Before final color." } as WorkImageMedia,
  commercial: { ...original.hero, hasAudio: false, alt: "GeckO’s cereal commercial — before final color.", caption: "Commercial edit — before final color.", statusLabel: "Commercial edit — before final color." } as WorkVideoMedia,
  set: process.set as WorkImageMedia,
  panorama: { ...reference.panorama, alt: "360-degree view of the practical kitchen set and surrounding lighting.", caption: "360° lighting reference.", statusLabel: "360° lighting reference." } as WorkImageMedia,
  printed: { ...printed.printedArtwork, caption: "The physical printed box — unfolded packaging.", statusLabel: "Physical printed packaging, held open on set." } as WorkImageMedia,
  blocking: { ...process.blocking, presentation: "loop", caption: "Entrance studies — finding the box’s personality." } as WorkVideoMedia,
  table: { ...reference.tableSide, caption: "A side view of the table setup." } as WorkImageMedia,
  viewport: { ...reference.perspective, caption: "Digital set recreation for shadows and reflections — perspective viewport still.", statusLabel: "Static perspective viewport; not a matching side-view animation capture." } as WorkImageMedia,
  physical: { ...process.physical, caption: "Real on-set box reference", statusLabel: "Photograph of the physical box." } as WorkImageMedia,
  composite: { ...original.hero, poster: process.hero, presentation: "loop", hasAudio: false, alt: "Animated CG box moving among the photographed breakfast props, before final color.", caption: "CG box integrated with the live-action plate — before final color.", statusLabel: "Pre-color commercial excerpt, repeated for presentation." } as WorkVideoMedia,
  // Original-speed excerpt, not synthetic motion or an asserted seamless broadcast loop.
  compositeSegment: [10.6, 14.85] as const,
};

export const geicoCredits = [
  { heading: "Cereal-spot production", credits: [
    { role: "Brand", name: "GEICO" },
    { role: "Agency", name: "The Martin Agency" },
    { role: "Production", name: "SuperJoy", url: "https://wearesuperjoy.com/" },
    { role: "Lead CG Artist / 3D Animator", name: "Deven Langston" },
  ] },
  { heading: "Direction & creative", credits: [
    { role: "Co-directors", name: "David Freeman and Amanda Ricks" },
    { role: "Creative director", name: "Ryan Raab", url: "https://www.ryanraab.com/legendofthelizard" },
    { role: "Associate creative directors", name: "Dustin Dodd and Graham Unterberger" },
  ] },
  { heading: "Production", credits: [
    { role: "Senior producer", name: "Liza Miller" },
    { role: "Junior producer", name: "Zavi Harman" },
    { role: "Director of photography", name: "Brian Camp" },
    { role: "Gaffer", name: "Jake Pulliam" },
    { role: "Food styling", name: "Elliott Shaffner and Katie Taylor" },
  ] },
  { heading: "Post-production", credits: [
    { role: "Post producer", name: "Chris Frendo", url: "https://www.christopherfrendo.com/" },
    { role: "Editor", name: "Brian Gregory" },
    { role: "Flame", name: "Paul Wiederholt" },
    { role: "Color", name: "Roslyn Di Sisto" },
    { role: "Color house", name: "Royal Muster" },
  ] },
  { heading: "Packaging design", credits: [
    { role: "Design director", name: "Robyn Makinson", url: "https://robynmak.net/geico" },
    { role: "Lead designer", name: "Molly Dauphin" },
  ] },
];
