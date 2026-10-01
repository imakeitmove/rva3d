// Overview copy is separate from the shared six-discipline taxonomy and detail routes.
export const capabilityOverview = {
  headline: "We make the pixels do what we want them to do.",
  intro: "Senior-led 3D animation, visualization, motion design and VFX. Work directly with the creative lead from the first conversation through final delivery—or bring RVA3D into an existing production for the part that needs specialist attention.",
  services: [
    {
      id: "3d-animation", title: "3D Animation", index: "3D Animation",
      kicker: "Show them exactly what you mean.",
      body: "Products, characters and worlds built for motion. Modeling, materials, lighting and animation for complete films, campaign sequences or a few carefully made shots.",
      needs: "Product films · Character animation · CG sequences",
      caption: "AXE WHAXE · Production: SuperJoy",
      link: "View WHAXE", href: "/work/axe-whaxe-lil-baby",
    },
    {
      id: "product-technical-visualization", title: "Product & Technical Visualization", index: "Visualization",
      kicker: "No detail is too small.",
      body: "CAD, product references and incomplete plans turned into clear stills and animation. Show how a mechanism works, compare configurations, or present a space before it is built.",
      needs: "Cutaways · Exploded views · Product stills · Technical animation",
      caption: "DESMI ROTAN CHD · Cutaway animation",
      link: "View DESMI", href: "/work/desmi-rotan-pump",
    },
    {
      id: "motion-design", title: "Motion Design", index: "Motion Design",
      kicker: "Make the message move.",
      body: "Type, illustration and graphics with purposeful timing. Brand films, explainers and titles, animated from supplied storyboards or developed with you.",
      needs: "Brand films · Titles · Explainers · Cutdowns",
      // Previous single-project example: "Uncommon Goods · Production: Spang";
      // link: "View Uncommon Goods", href: "/work/uncommon-goods-outta-this-world",
      caption: "Selected motion design",
      link: "Explore selected work", href: "/work",
    },
    {
      id: "vfx-compositing", title: "VFX & Compositing", index: "VFX",
      kicker: "Wait, what did you change?",
      body: "Add what wasn’t there. Remove what shouldn’t be. CG integration, tracking, surface replacement and cleanup that hold together in the finished shot.",
      needs: "Tracked replacements · CG integration · Cleanup · Finishing",
      caption: "Bud Light Seltzer · Original / finished comparison",
      link: "Explore VFX & compositing", href: "/capabilities/vfx-compositing",
    },
  ],
  interactive: {
    title: "Interactive & Prototyping",
    kicker: "Sometimes the picture needs to do something.",
    body: "Browser-based 3D, creative tools and working prototypes. Make an idea usable, test an interaction, or give people a different way to explore the work.",
    needs: "Browser 3D · Prototypes · Creative tools",
  },
  close: {
    // Previous: "A whole project. Or the part you need."
    title: "A whole project. Or just the part you need.",
    body: "We can take a project from concept through delivery, or join your existing team for a defined asset, shot or sequence.",
    final: "Bring the brief, CAD, footage—or the question.",
  },
} as const;
