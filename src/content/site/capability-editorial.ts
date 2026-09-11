import type { CapabilitySlug } from "@/content/capabilities/types";
export const capabilityEditorial: Record<CapabilitySlug, { promise: string; copy: string; uses: string[]; proof: string }> = {
  "3d-animation": {
    // Previous: "Imagine anything. Then make it real."
    "promise": "Imaging anything you can imagine.",
    "copy": "Build a product world with control over every camera move, material and moment. From supplied ingredients to finished animation, RVA3D develops the visual treatment, movement and lighting around the idea. Use it for a complete film or a few carefully made shots.",
    "uses": [
      "Product launches",
      "Character animation",
      "Impossible camera moves"
    ],
    // Previous proof described AXE WHAXE; the selected review example is now Five Below.
    "proof": "Five Below: a zig-zag retail display brought into motion, making its shape and arrangement easy to follow."
  },
  "product-technical-visualization": {
    // Previous: "Really get in there good!"
    "promise": "Get in the good!",
    "copy": "Show the inside of a mechanism while it’s running, explain a product, or visualize a space that’s still just an idea. Starting with CAD and physical references, RVA3D turns technical information into clear stills, cutaways and sequences. Keep the useful detail. Find the view that makes the explanation click.",
    "uses": [
      "Technical explainers",
      "Product cutaways",
      "Spaces & configurations"
    ],
    "proof": "DESMI ROTAN CHD: cutaways, exploded views and rotor movement bring the pump’s inner workings into view."
  },
  "motion-design": {
    // Previous: "Make messages move with intent."
    "promise": "Moving messages make moving messages.",
    "copy": "Use design in motion to draw attention and make a message stick. From short brand moments to fleshed-out explainer sequences, RVA3D animates type, graphics and 3D elements to tell compelling visual stories.",
    "uses": [
      "Brand moments",
      "Explainer sequences",
      "Titles & graphics"
    ],
    // Former reel caption removed at review request; do not render an empty paragraph.
    "proof": ""
  },
  "vfx-compositing": {
    // Previous: "Make it belong in the shot."
    "promise": "Wait what did you change?",
    "copy": "Replace a branded surface, integrate a new element into an existing shot or make an unwanted detail disappear. RVA3D handles compositing and shot work that keeps the finished image believable.\n\nBring the footage or production question; we’ll work out the rest!",
    "uses": [
      "Surface replacement",
      "CG in live action",
      "Cleanup & finishing"
    ],
    "proof": "Bud Light Seltzer: replaced the truck-side wrap across several live-action shots. The existing breakdown shows original footage beside the finished effect."
  },
  "interactive-3d": {
    "promise": "Sometimes the picture needs to do something.",
    "copy": "RVA3D also experiments with browser interactions, prototypes, creative tools and media people can explore rather than only watch. A secondary part of the practice, shaped around a useful question.",
    "uses": [],
    "proof": "The interactive gallery on this site is a current, self-initiated RVA3D example."
  },
  "creative-production-support": {
    "promise": "Bring in the render-enforcements!",
    "copy": "An established team may need help moving a difficult asset, shot or sequence forward. RVA3D brings creative and technical support across the making process: interpreting rough inputs, working through the missing pieces and finishing the agreed contribution. A focused addition to the team when the work needs it.",
    "uses": [
      "Production gaps",
      "Specialist collaboration",
      "Difficult shots & assets"
    ],
    "proof": "Fool Me Twice: animation controls beside the finished paper-cut character. Selected founder title-animation work from a 48-hour film project."
  }
};
// V1 copy retained for restoration; V2 reduces volume and replaces proof.
// import type { CapabilitySlug } from "@/content/capabilities/types";
//
// export const capabilityEditorial: Record<CapabilitySlug, { promise: string; copy: string; uses: string[]; proof: string }> = {
//   "3d-animation": {
//     promise: "Give the impossible a convincing performance.",
//     copy: "Show a product before it exists, send a camera somewhere it cannot go or give a character the right kind of personality. RVA3D builds and animates the models, materials and movement around what the audience needs to understand. The result can be a complete film, a campaign sequence or a few carefully made shots.",
//     uses: ["Product launches", "Character animation", "Impossible camera moves"],
//     proof: "Cable Snake shows how a digital character can match a practical one, then move beyond the limits of the set.",
//   },
//   "product-technical-visualization": {
//     promise: "Make the hard-to-see easy to understand.",
//     copy: "Get inside a mechanism, explain a product’s behavior or show a space before it is built. Start with CAD, physical references or an incomplete collection of source material. RVA3D turns that information into clear stills, cutaways and sequences, keeping the useful detail and finding the view that makes the explanation click.",
//     uses: ["Technical explainers", "Product cutaways", "Spaces & configurations"],
//     proof: "For AMSOIL, an inaccessible turbine mechanism became a clear visual explanation through reconstruction and carefully chosen views.",
//   },
//   "motion-design": {
//     promise: "Make the message move with intent.",
//     copy: "Design, movement and timing should do more than fill a frame. Use them to guide attention, set a tone and make a message stick. RVA3D develops product motion, graphic sequences and campaign pieces with a coherent visual rhythm, then adapts the finished work for the formats and screens it needs to reach.",
//     uses: ["Campaign sequences", "Product motion", "Titles & graphic systems"],
//     proof: "The AXE WHAXE film uses product detail, a custom chain and deliberate camera timing to create a distinct visual rhythm. Selected founder work from a SuperJoy production.",
//   },
//   "vfx-compositing": {
//     promise: "Make everything belong in the same shot.",
//     copy: "Some shots need something added. Others need something quietly taken away. RVA3D handles CG integration, tracked replacements, cleanup and compositing so the finished image holds together. Bring a difficult plate, a planned effect or a shot that has stopped cooperating. We can work out what the camera should capture and what needs to happen afterward.",
//     uses: ["CG in live action", "Tracked replacements", "Cleanup & finishing"],
//     proof: "Cable Snake brings practical and digital performances into one visual world, where consistency matters as much as the effect itself.",
//   },
//   "interactive-3d": {
//     promise: "Build something people can use—not just watch.",
//     copy: "Give people a useful way to click, touch or explore. That might be a browser experience, a touchscreen presentation, a lightweight utility or a prototype that makes an idea tangible. RVA3D can help define the interaction, test the approach and build the creative tool or technical experiment that moves the project forward.",
//     uses: ["Interactive experiences", "Creative tools", "Working prototypes"],
//     proof: "Try this self-initiated studio study: change the view with the slider or arrow keys. A small example of user-controlled viewing.",
//   },
//   "creative-production-support": {
//     promise: "Bring in a pair of hands that can own the problem.",
//     copy: "An established team does not always need another department. Sometimes it needs someone who can take a difficult asset, shot or sequence and move it forward. RVA3D brings focused creative and technical support to agencies, studios and internal teams—from interpreting the source material to building, finishing and delivering the agreed piece of work.",
//     uses: ["Demanding shots", "Extra production capacity", "Specialist collaboration"],
//     proof: "Across the Capri Sun assignments, reusable pouch assets supported distinct production needs. Candy Factory produced the work; RVA3D completed the contracted 3D contribution.",
//   },
// };
//


// Superseded approved copy preserved for restoration; the follow-up brief supplies exact replacements.
// Give the impossible a convincing performance.
// Make the hard-to-see easy to understand.
// Get inside a mechanism, explain a product’s behavior or show a space before it is built.
// Use design, movement and timing to guide attention and make a message stick. RVA3D brings type, graphics and dimensional elements into a coherent visual rhythm, from a short brand moment to an explainer sequence. The reel shows the range; the brief gives it direction.
// Make everything belong in the same shot.
// Replace a branded surface, integrate a new element or make an unwanted detail disappear. RVA3D handles compositing and shot work that keeps the finished image believable. Bring the footage or the production question; we’ll work out what the shot needs and how to get there.
// Bring in someone who can own the problem.
