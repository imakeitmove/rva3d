export const aboutIntroduction = "RVA3D is a Richmond-based creative studio focused on 3D animation, motion graphics and VFX. We help brands, agencies, and production teams put creative ideas on screens.";

export const aboutDescription = "Meet the Richmond-based RVA3D team: Deven Langston, Lauren Langston and Jim Burns. Senior-led animation, visualization, motion graphics and VFX.";

export const aboutTeam = [
  {
    id: "deven",
    name: "Deven Langston",
    role: "Founder / Lead Artist",
    biography: "Deven leads the creative and technical work, from early planning through final delivery. He brings 20 years of experience in motion design and 3D animation and previously taught in VCU’s Kinetic Imaging program.",
  },
  {
    id: "lauren",
    name: "Lauren Langston",
    role: "Operations Manager",
    biography: "Lauren keeps schedules, project details and communication organized. She helps clients get answers and keeps the day-to-day moving so production can stay focused.",
  },
  {
    id: "jim",
    name: "Jim Burns",
    role: "Client Strategist / Producer",
    biography: "Jim helps define project goals, shape the brief and keep client conversations moving. He connects what a project needs to what RVA3D can deliver.",
  },
] as const;

/* October 6 promises retained for restoration; October 7 copy is below.
export const aboutPromises = [
  {
    title: "Artist-led throughout.",
    description: "Deven stays involved in planning and production, keeping creative decisions connected to the work.",
  },
  {
    title: "Direct access to the artist.",
    description: "Clients can speak directly with Deven about creative and technical decisions.",
  },
  {
    title: "Communication that keeps moving.",
    description: "Lauren and Jim help coordinate questions, feedback and next steps so production can stay focused.",
  },
] as const;
*/
export const aboutPromises = [
  { icon: "senior", title: "Senior-led from planning to final delivery.", description: "Work directly with an experienced 3D artist throughout planning and production." },
  { icon: "organized", title: "Organized, responsive, transparent.", description: "Clear plans, documented decisions and an organized path between milestones." },
  { icon: "communication", title: "Clear communication with our clients.", description: "Straight answers, useful updates and direct access to the people shaping your project." },
] as const;

// Owner-confirmed in the October 6 About brief: five consecutive graphics wins
// across multiple teams and contributions to two Best Film-winning projects.
// Exact years/film-by-film attribution were not supplied. Cannes is a screening,
// not a prize, competitive selection, or award for the newly assembled studio.
/* October 6 highlight formatting retained for restoration.
export const aboutFilmHighlights = [
  { value: "5 years running", title: "Best Use of Graphics", context: "Richmond 48 Hour Film Project — Deven’s graphics work" },
  { value: "2× Best Film", title: "Richmond 48 Hour Film Project", context: "Films Deven contributed to" },
  { value: "Cannes", title: "CMYK screening", context: "HP/48HFP “Power of Ink” program" },
] as const;
*/
export const aboutFilmHighlights = [
  { value: "5", title: "years in a row", context: "Best Use of Graphics" },
  { value: "2×", title: "Best Film", context: "Richmond 48HFP" },
  // Previous label: { value: "Cannes", title: "CMYK screening", context: "HP/48HFP “Power of Ink”" },
  { value: "Cannes", title: "Screened at Cannes Film Festival", context: "" },
] as const;
