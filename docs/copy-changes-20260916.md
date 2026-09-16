# Exact copy changes — September 16, 2026

Public copy and related metadata only. Source/test preservation notes remain in the files.

## src/lib/site/home-template.mjs

Before:

```text
Deven Langston — selected animation & motion
```

After:

```text
RVA3D — selected animation & motion
```

Before:

```text
Selected prior professional work by Deven Langston, the experience behind ${brandName()}.
```

After:

```text
Selected 3D animation, visualization and motion design. Explore the case studies for our role and project credits.
```

Before:

```text
At ${brandName(true)}, we make the invisible visible, present ideas clearly and consistently, and give people something worth watching. Let’s put your idea in motion.
```

After:

```text
${brandName(true)} creates 3D animation, product visualization, motion design and VFX for campaigns, launches and technical stories. Bring an early idea or an existing production that needs experienced hands.
```

Before:

```text
Founded in 2026 by Deven Langston, ${brandName()} brings his 20 years of experience in animation, motion design, and 3D production to every project... combining senior-level creative direction with the speed and flexibility of a small studio.
```

After:

```text
Work directly with Deven Langston, founder and creative lead of ${brandName()}. His 20 years in animation, motion design and 3D production help us make sound creative and technical decisions, from the first conversation through final delivery.
```

Before:

```text
Existing footage needs extending, replacing, integrating, cleaning up or otherwise making believable.
```

After:

```text
A shot needs a new element, a surface replacement or cleanup that holds up in motion.
```

Before:

```text
Campaign or brand work needs to move, transform or feel more visually distinctive. Design, 3D, animation, compositing, visualization or interactive work needs to come together as one coherent engagement.
```

After:

```text
A campaign needs design, animation and compositing to work together, from the first visual direction to the final formats.
```

Before:

```text
An agency, production company or internal creative team needs senior 3D, motion or visualization capacity — with creative and technical thinking, not just software execution.
```

After:

```text
Your agency or in-house team needs someone who can take ownership of a difficult asset, shot or sequence within your production workflow.
```

## src/components/site/WorkPages.tsx

Before:

```text
<span>Deven Langston has brought characters to life. Made ideas memorable.</span><span>This is the experience behind RVA3D. We’d love to elevate your idea, too.</span>
```

After:

```text
<span>Products to explain. Characters to animate. Shots to solve.</span><span>See what each project needed, what we contributed and how it came together.</span>
```

Before:

```text
The work changes with the brief. A product to explain, a story to tell, a shot that needs something you can’t film... bring us the challenge. We’ll help figure out what to make and the best way to make it.
```

After:

```text
Bring the product, story or shot you need to solve. We’ll work out what to make and how to get it finished.
```

Before:

```text
href={siteHref("/how-we-work")}>How we work <span
```

After:

```text
href={siteHref("/#contact")}>Tell us what you’re making <span
```

Before:

```text
Deven Langston / Contribution
```

After:

```text
Our contribution
```

Before:

```text
Agency / production: Candy Factory. Deven Langston completed the contracted 3D work described below, including modeling, materials, animation, rendering and compositing.
```

After:

```text
Our role covered modeling, materials, animation, rendering and compositing within the Candy Factory production.
```

Before:

```text
Have something in mind? Get in touch ↗
```

After:

```text
Tell us about your project ↗
```

Before:

```text
  return { title: study.seo.title, description: study.seo.description,
    alternates: { canonical: `https://www.rva3d.com/work/${study.slug}` },
  };
```

After:

```text
  return { title: study.seo.title, description: study.seo.description,
    alternates: { canonical: `https://www.rva3d.com/work/${study.slug}` },
    openGraph: { title: study.seo.title, description: study.seo.description, images: [protectedMedia(study.seo.image).src] },
    twitter: { card: "summary_large_image", title: study.seo.title, description: study.seo.description, images: [protectedMedia(study.seo.image).src] },
  };
```

## src/components/site/EditorialCasePage.tsx

Before:

```text
<p className="label">{editorial.context} · Prior work by Deven Langston</p>
```

After:

```text
<p className="label">{editorial.context}</p>
```

Before:

```text
editorial.contributionLabel ?? "Deven’s contribution"
```

After:

```text
editorial.contributionLabel ?? "Our contribution"
```

Before:

```text
      </dl>
    </section>
```

After:

```text
      </dl>
      {study.credits.length > 0 && <details className={styles.details}>
        <summary>Project credits</summary>
        {study.credits.map(credit => <p key={`${credit.name}-${credit.role}`}>
          <strong>{credit.name}</strong> — {credit.role}{credit.organization ? ` · ${credit.organization}` : ""}
        </p>)}
      </details>}
    </section>
```

## src/content/work/cases/cable-snake.ts

Before:

```text
For Twist Wireless's Cable is a Snake campaign, Deven Langston built and animated the digital counterpart to a practical puppet, matching its appearance and integrating it into live-action scenes. The campaign was produced through Spang and Dotted Line.
```

After:

```text
For Twist Wireless’s Cable is a Snake campaign, we built and animated a digital counterpart to the practical puppet. Matching its appearance gave the Spang and Dotted Line production more control over performance in live-action scenes.
```

Before:

```text
Deven Langston built, rigged, animated, lit, rendered, and composited the digital character to match the practical puppet and sit naturally in the live-action plates.
```

After:

```text
Digital character modeling, rigging, animation, lighting, rendering and compositing, matched to the practical puppet and live-action footage.
```

Before:

```text
Deven Langston's digital character build, animation and compositing for Twist Wireless, through Spang and Dotted Line.
```

After:

```text
A practical puppet recreated in 3D for Twist Wireless: character modeling, animation and compositing within a Spang and Dotted Line production.
```

## src/content/work/cases/amsoil-xpd-wind-grease.ts

Before:

```text
AMSOIL needed to show how different grease conditions behave inside a wind-turbine bearing, where conventional filming was impractical. Working from limited diagrams, reference footage, engineering guidance, and two stock models, Deven reconstructed a credible internal assembly and developed controllable grease animation.
```

After:

```text
AMSOIL needed to compare three grease conditions inside a wind-turbine bearing that a camera could not reach. We reconstructed the assembly from limited references and stock models, then developed the animation with engineering guidance.
```

Before:

```text
Deven Langston handled the 3D reconstruction, look development, animation, lighting, rendering, compositing, and engineering-review revisions described in this case.
```

After:

```text
3D reconstruction, materials, animation, lighting, rendering and compositing, refined through engineering review.
```

Before:

```text
An art-directable Cinema 4D setup produced liquid-like movement inside the bearing while remaining fast to revise in response to creative feedback and engineering review.
```

After:

```text
A controllable animation setup made the grease move convincingly inside the bearing and kept revisions practical through creative and engineering review.
```

Before:

```text
Technical visualization by Deven Langston: a reconstructed wind-turbine assembly and animation comparing three grease conditions for AMSOIL.
```

After:

```text
Inside an AMSOIL wind-turbine bearing: 3D reconstruction and animation make three grease conditions easy to compare.
```

## src/content/work/cases/capri-sun.ts

Before:

```text
Across Noise Tech, Solstice, and Trick & Treat, Deven Langston built and adapted a photoreal Capri Sun pouch, handling 3D modeling, texturing, lighting, animation, rendering, and compositing as each assignment turned the familiar silver package into a different visual joke.
```

After:

```text
Three Capri Sun campaigns needed the familiar silver pouch to carry three different jokes. Working within Candy Factory’s production, we built a photoreal 3D pouch and adapted its shape, packaging and performance for each idea.
```

Before:

```text
Deven Langston handled the 3D modeling, materials, texturing, artwork adaptation, lighting, rendering, animation, filmed performance reference, and compositing described in this selected-work case.
```

After:

```text
3D modeling, materials, packaging artwork adaptation, lighting, rendering, animation, performance reference and compositing.
```

Before:

```text
The pouch was stretched absurdly tall for the longest day of the year. The joke required revised geometry, rebuilt UVW mapping, and taller artwork rather than a simple scale change.
```

After:

```text
An absurdly tall pouch marked the longest day of the year. We rebuilt the shape and remapped the packaging artwork so the stretched product still looked real.
```

Before:

```text
A photoreal pouch foundation adapted across macro product imagery, an exaggerated form, and reference-driven character animation.
```

After:

```text
One photoreal pouch adapted for close-up product imagery, exaggerated proportions and comic animation.
```

Before:

```text
Deven Langston's 3D product visualization and animation for Capri Sun through Candy Factory, across three campaign assignments.
```

After:

```text
Three Capri Sun campaigns through Candy Factory, using a reusable 3D pouch for product imagery, exaggerated proportions and animation.
```

## src/content/work/cases/wawa-coffee-island.ts

Before:

```text
Pak-It Displays designed the Coffee Island as a modular fixture for different footprints and coffee programs. Showing that flexibility meant visualizing it in multiple configurations, fully stocked and convincing in both stills and motion. Deven handled the complete 3D visualization and production.
```

After:

```text
Pak-It Displays needed to show its modular Wawa Coffee Island in different configurations. We turned the supplied fixture CAD into a fully stocked 3D scene for stills and animation, down to the cups, packets and coffee bags.
```

Before:

```text
Deven Langston handled CAD cleanup, scene construction, product and packaging reconstruction, scan- and photography-based texture creation, look development, dressing, lighting, rendering, animation, and compositing.
```

After:

```text
Complete 3D visualization: CAD cleanup, product reconstruction, materials, scene dressing, lighting, rendering, animation and compositing.
```

Before:

```text
The visualization mirrored the product it presented: a flexible system designed to reconfigure across layouts and deliverables.
```

After:

```text
Pak-It Displays could show new layouts, camera angles and product details using the same scene, without rebuilding the environment for each deliverable.
```

Before:

```text
Deven Langston's retail visualization for Pak-It Displays: a fully stocked Wawa Coffee Island, developed from supplied fixture CAD.
```

After:

```text
Wawa Coffee Island visualization for Pak-It Displays: supplied fixture CAD becomes a stocked 3D scene for multiple layouts, stills and animation.
```

## src/content/work/cases/axe-whaxe-lil-baby.ts

Before:

```text
Product animation \u00b7 Selected founder experience
```

After:

```text
Product animation
```

Before:

```text
SuperJoy needed a polished campaign piece for AXE\u2019s WHAXE collaboration with Lil Baby. The supplied product models still needed finished look development, and no detailed storyboard had pre-solved the sequence. Within a lean schedule and budget, Deven developed the product treatment, shot language, motion, lighting, pacing, and rendering.
```

After:

```text
SuperJoy needed a product film for AXE’s WHAXE collaboration with Lil Baby, with unfinished models and an open brief. We developed the product treatment, shots and animation together, working within a lean schedule and budget.
```

Before:

```text
Deven finished the product assets, modeled the WHAXE text and chain, solved the diamond rendering problem, and developed camera behavior, product motion, lighting, framing, and editorial flow as one connected piece within the SuperJoy production.
```

After:

```text
We finished the supplied assets, modeled the WHAXE text and chain, and solved the diamond rendering problem. Camera moves, product motion and lighting were developed together to give the SuperJoy production a coherent sequence.
```

Before:

```text
Produced through SuperJoy for the AXE WHAXE collaboration with Lil Baby. Deven Langston handled the product-focused 3D work described here; this selected experience predates RVA3D\u2019s formation.
```

After:

```text
Product-focused 3D look development, custom modeling, animation, lighting and rendering within the SuperJoy production.
```

Before:

```text
Finished 16:9 campaign piece. Product-focused 3D treatment, shot design, animation, lighting, rendering, and pacing by Deven Langston within the SuperJoy production.
```

After:

```text
Finished campaign film. Our role covered the product-focused 3D treatment, shot design, animation, lighting, rendering and pacing within the SuperJoy production.
```

Before:

```text
Selected founder experience developing product-focused 3D look, motion, lighting, rendering, and finish within a SuperJoy campaign production.
```

After:

```text
AXE WHAXE × Lil Baby: product look development, custom modeling and animation turn an open brief into a campaign film within the SuperJoy production.
```

Before:

```text
AXE / SuperJoy / Selected founder experience
```

After:

```text
AXE / SuperJoy
```

Before:

```text
Deven Langston within the SuperJoy production, before RVA3D
```

After:

```text
Product-focused 3D within the SuperJoy production
```

Before:

```text
Deven\u2019s contribution
```

After:

```text
Our contribution
```

## src/content/work/cases/geico-geckos-cereal-box.ts

Before:

```text
For GEICO, Deven Langston served as VFX supervisor and lead animator on a cereal box that could perform like a character and still belong on a real kitchen table.
```

After:

```text
A GEICO cereal box needed personality without losing its place on a real kitchen table. Our role spanned on-set VFX supervision, character animation and 3D integration through the initial composite.
```

Before:

```text
Deven Langston developed the digital box, animation, lighting, renders and initial composite. A separate Flame artist handled finishing, composite touch-ups and consistency with the surrounding commercial.
```

After:

```text
Digital box development, animation, lighting, rendering and initial compositing. A separate Flame artist handled final finishing and consistency with the surrounding commercial.
```

Before:

```text
GEICO cereal-box animation and VFX by Deven Langston, including on-set supervision, animation, lighting, rendering and initial compositing, with separate Flame finishing.
```

After:

```text
GEICO cereal-box animation and VFX: on-set supervision, character performance, lighting, rendering and an initial composite prepared for separate Flame finishing.
```

Before:

```text
The physical cereal box gave us a shared reference for scale, framing, color, and light. Deven provided VFX guidance on set and captured HDRI reference so the digital work could follow the photographed kitchen.
```

After:

```text
The real box established scale, framing and color. On-set VFX guidance and captured lighting reference gave us what we needed to match the photographed kitchen.
```

Before:

```text
A hop, a turn, a little flex: each changes the box's personality. Deven explored different entrances and reactions to find how expressive it could be while still reading as cardboard. Early blocking made those choices visible before detailed lighting and compositing.
```

After:

```text
A hop, a turn, a little flex: each changes the box’s personality. We explored entrances and reactions in rough animation so the performance could be reviewed before detailed lighting and compositing.
```

Before:

```text
The surrounding objects mattered even where the photography stayed. Digital stand-ins provided surfaces for reflections, contact shading and occlusion, helping the animated box sit among the bowl, glass and milk bottle. Deven developed the lighting and renders, then brought those elements into the initial composite.
```

After:

```text
Digital stand-ins for the bowl, glass and milk bottle supplied reflections and contact shading. We matched the lighting and brought the renders into the initial composite so the animated box sat naturally among the photographed objects.
```

Before:

```text
Deven's contribution carried the box from on-set reference through animation, lighting, rendering and the initial composite. A separate Flame artist handled finishing and adjustments for consistency with the surrounding commercial.
```

After:

```text
The performance and technical handoff were developed together. Our initial composite passed to a separate Flame artist for final finishing and consistency with the surrounding commercial.
```

Before:

```text
"productionRole": "Deven Langston — VFX supervisor and lead animator."
```

After:

```text
"productionRole": "On-set VFX supervision and lead animation"
```

## src/content/work/cases/uncommon-goods-outta-this-world.ts

Before:

```text
Working through Spang TV, Deven Langston brought supplied creative direction and product assets into motion for Uncommon Goods, connecting a different animation challenge in every scene.
```

After:

```text
Working through Spang TV, we turned supplied creative direction and product assets into an Uncommon Goods commercial, solving a different animation challenge in every scene.
```

Before:

```text
Deven Langston handled motion-design execution through Spang TV within the supplied creative framework.
```

After:

```text
Motion design, animation and compositing through Spang TV, working within the supplied creative direction.
```

Before:

```text
Motion design, animation and compositing by Deven Langston through Spang TV for Uncommon Goods, working from supplied creative direction.
```

After:

```text
Uncommon Goods motion design through Spang TV: supplied direction and product assets become connected 30- and 15-second commercial edits.
```

Before:

```text
Deven’s contribution
```

After:

```text
Our contribution
```

Before:

```text
Supplied creative direction established the products, visual world and key actions. Deven combined 2D motion design, compositing and selective 3D, adapting the technique to each scene and building the timing and transitions that hold the edit together.
```

After:

```text
The supplied direction established the products, visual world and key actions. We combined 2D animation, compositing and selective 3D to connect the scenes with consistent timing and transitions.
```

Before:

```text
The :15 wasn't a :30 with half the shots blindly removed. Its route changes. The astronaut sequence connects directly into the mug, bypassing the puzzle and accordion lamp before the spot races toward the same finish. Compressing the idea meant finding a different sequence of visual handoffs that still felt intentional.
```

After:

```text
The 15-second edit needed its own route. Connecting the astronaut directly to the mug kept the spot moving toward the same finish, with transitions rebuilt around the shorter running time.
```

Before:

```text
A detailed storyboard can define what should happen. There is still a lot of creative work between that document and a finished commercial: preparing the assets, finding the timing, building the motion, solving the transitions and knowing when something simply feels right.
```

After:

```text
Asset preparation, animation and carefully timed transitions turned the supplied boards into two finished commercial edits.
```

## src/lib/site/content.ts

Before:

```text
Selected technical visualization and animation from Deven Langston’s prior professional work.
```

After:

```text
Technical visualization and animation revealing the pump’s internal mechanism.
```

Before:

```text
Technical visualization and animation by Deven Langston
```

After:

```text
Technical visualization and animation
```

Before:

```text
AXE / SuperJoy / Selected founder experience
```

After:

```text
AXE / SuperJoy
```

Before:

```text
  credits: [],
```

After:

```text
  credits: [{ name: "Deven Langston", role: "Technical visualization and animation" }],
```

## src/content/site/capability-editorial.ts

Before:

```text
Imaging anything you can imagine.
```

After:

```text
Give the impossible a convincing performance.
```

Before:

```text
Build a product world with control over every camera move, material and moment. From supplied ingredients to finished animation, RVA3D develops the visual treatment, movement and lighting around the idea. Use it for a complete film or a few carefully made shots.
```

After:

```text
Show a product before it exists, give a character personality or take the camera somewhere it cannot go. RVA3D develops the models, look and movement for a complete film or a few demanding shots.
```

Before:

```text
From Deven Langston’s prior work: a Five Below zig-zag retail display brought into motion, making its shape and arrangement easy to follow.
```

After:

```text
Five Below: an animated retail display makes its shape and arrangement easy to follow.
```

Before:

```text
Show the inside of a mechanism while it’s running, explain a product, or visualize a space that’s still just an idea. Starting with CAD and physical references, RVA3D turns technical information into clear stills, cutaways and sequences. Keep the useful detail. Find the view that makes the explanation click.
```

After:

```text
Show how a mechanism works or visualize a space before it is built. We turn CAD, physical references or incomplete source material into stills, cutaways and animation that make the important details clear.
```

Before:

```text
DESMI ROTAN CHD: technical visualization and animation from Deven Langston’s prior work bring the pump’s inner workings into view.
```

After:

```text
DESMI ROTAN CHD: technical visualization and animation reveal the pump’s inner workings.
```

Before:

```text
Use design in motion to draw attention and make a message stick. From short brand moments to fleshed-out explainer sequences, RVA3D animates type, graphics and 3D elements to tell compelling visual stories.
```

After:

```text
Turn a script, supplied boards or brand direction into motion. Type, graphics and 3D work together in campaign films, titles and explainers, with timing and transitions shaped around the message.
```

Before:

```text
Bud Light Seltzer: Deven Langston replaced the truck-side wrap across several live-action shots. The breakdown shows original footage beside the finished effect.
```

After:

```text
Bud Light Seltzer: the truck-side wrap was replaced across several live-action shots. The comparison shows how the new surface follows the original camera movement and light.
```

Before:

```text
RVA3D also experiments with browser interactions, prototypes, creative tools and media people can explore rather than only watch. A secondary part of the practice, shaped around a useful question.
```

After:

```text
Explore a product or test an interaction in the browser. RVA3D’s experiments include interactive media, prototypes and creative tools; this site offers a working example.
```

Before:

```text
An established team may need help moving a difficult asset, shot or sequence forward. RVA3D brings creative and technical support across the making process: interpreting rough inputs, working through the missing pieces and finishing the agreed contribution. A focused addition to the team when the work needs it.
```

After:

```text
Add senior creative and technical support to your agency or in-house team. RVA3D can take ownership of a difficult asset, shot or sequence, working with your existing files, creative direction and review process through delivery.
```

Before:

```text
Fool Me Twice: animation controls beside the finished paper-cut character, from Deven Langston’s title-animation work on a 48-hour film project.
```

After:

```text
Fool Me Twice: animation controls beside the finished paper-cut character, created for the titles of a 48-hour film project.
```

Before:

```text
Wait what did you change?
```

After:

```text
Wait, what did you change?
```

## src/components/site/CapabilityEditorial.tsx

Before:

```text
Take the idea from talk to tech. RVA3D has the tools and techniques to tell the story, show how a product works or build something people can interact with. Tell us what you need people to see.
```

After:

```text
Launch a product, explain a mechanism or finish a demanding shot. RVA3D can develop the idea with you or join an existing production to handle the part that needs specialist attention.
```

Before:

```text
Finished sign replacement from Deven Langston’s prior VFX work.
```

After:

```text
The replacement sign follows the original perspective and light.
```

Before:

```text
href={siteHref("/how-we-work")}>See how we work <span
```

After:

```text
href={siteHref("/#contact")}>Tell us what you’re making <span
```

## src/components/site/CapabilityDetail.tsx

Before:

```text
Camera, perspective, movement, light, reflections and texture all need to agree. For Bud Light Seltzer, Deven Langston replaced the truck-side wrap across several live-action shots. The breakdown shows the original footage alongside the finished result.
```

After:

```text
For Bud Light Seltzer, we replaced the truck-side wrap across several live-action shots, matching the camera movement, perspective and light. The breakdown compares the original footage with the finished effect.
```

## src/components/site/AboutEditorial.tsx

Before:

```text
His experience across motion design, 3D animation, visual effects and
              production predates the studio name and spans nearly 20 years.
```

After:

```text
His 20 years in motion design, 3D animation, visual effects and
              production connect creative direction with hands-on execution.
```

Before:

```text
Then Deven takes responsibility for making it happen: sharing meaningful
              progress while decisions are easy to change, keeping the next step clear
              and raising problems while there are still good options.
```

After:

```text
You’ll see progress while there’s room to shape it, know what needs your
              decision and hear about changes to scope or timing while there are
              still good options.
```

## src/components/site/Contact.tsx

Before:

```text
<Brand /> brings ideas to life with 3D animation, motion graphics, VFX, and interactive media.
```

After:

```text
Bring the brief, the rough idea or the part that has you stuck. We’ll work out where <Brand /> can help and what comes next.
```

## src/components/site/InquiryForm.tsx

Before:

```text
Ready to say hello?
```

After:

```text
Tell us what you’re making.
```

Before:

```text
Tell us what you are making and where RVA3D can help.
```

After:

```text
Share the goal, timing and any materials you already have. A finished brief is welcome, but not required.
```

## src/content/site/how-we-work.ts

Before:

```text
Start with the problem, audience, deliverables, timing, existing materials, constraints, and what success needs to look like.
```

After:

```text
Bring the problem, audience, deadline and whatever materials you have. We’ll work out what the project needs to achieve.
```

Before:

```text
RVA3D turns that conversation into a clear scope, estimate, schedule, deliverables, and review plan before production begins.
```

After:

```text
Agree the scope, estimate, schedule, deliverables and review points before production begins.
```

Before:

```text
Concepting, design, visualization, animation, compositing, interactive development, or whatever combination the project actually requires.
```

After:

```text
Develop the design, animation or shot work around the brief, with progress shared while there’s room to steer.
```

Before:

```text
RVA3D works directly with brands and internal creative or marketing teams, and also partners with agencies, production companies and other creative studios. The common denominator is usually a project that needs strong visual problem-solving across 3D, motion, visualization, compositing or interactive work.
```

After:

```text
Brands, agencies, production companies and in-house creative teams. RVA3D can lead a project or handle a defined part of your production.
```

Before:

```text
Start with a conversation about the problem, deliverables, audience, timeline and any existing assets or constraints. From there RVA3D can define the scope, estimate, schedule and useful review points before production begins.
```

After:

```text
We’ll discuss what you need to make, when you need it and what you already have. From there, we can define the scope, estimate and review plan.
```

Before:

```text
    `Yes. We use AI as a utility... not as a replacement for creativity, judgment, or craft.

This website is actually a good example. AI helped us write code and build things that would have been impractical for a tiny studio to create otherwise. But every page, interaction, visual, word, and decision was directed, reviewed, tested, revised, and occasionally wrestled back onto the rails by an actual human.

That’s how we think about AI in general.

Computers have always expanded what creative people can do. You can’t 3D animate with a pencil. AI is another incredibly powerful tool, and pretending otherwise would be silly. But powerful tools still need someone at the helm who understands the work and knows why they’re making it.

We don’t use AI as an excuse not to think, and we don’t want to contribute to replacing artists with thoughtless, soulless output. Our use of AI remains firmly on the utility side of the equation.

It’s a complicated subject with real implications, and we’re happy to talk about it. We’re not hiding anything.`
```

After:

```text
    "Yes. We use AI for practical tasks such as coding and prototyping. This website is one example: AI helped build it; a human directed, reviewed and tested the work. Creative judgment and responsibility stay with RVA3D. We’re happy to discuss its use on your project."
```

## src/components/site/HowWeWork.tsx

Before:

```text
A hands-on build and technical visualization from Deven Langston’s experience behind RVA3D.
```

After:

```text
A physical build alongside its 3D technical visualization.
```

## src/app/layout.tsx

Before:

```text
Senior-led 3D visualization and animation, motion design, VFX, and interactive media that add depth, movement, and visual possibility to products, campaigns, and ideas.
```

After:

```text
Senior-led 3D animation, product visualization, motion design and VFX. Work directly with RVA3D’s creative lead, from early ideas through final delivery.
```

## src/app/(three)/work/page.tsx

Before:

```text
Selected prior work by Deven Langston: 3D animation, product visualization, motion design and VFX from the experience behind RVA3D.
```

After:

```text
Explore RVA3D case studies in 3D animation, product visualization, motion design and VFX: the challenge, our contribution and the finished work.
```

## src/app/(three)/about/page.tsx

Before:

```text
Meet Deven Langston, the Richmond-based creative lead behind RVA3D.
```

After:

```text
Work directly with Deven Langston, RVA3D’s founder and creative lead, with 20 years of experience in animation, motion design and 3D production.
```

## src/content/site/home.generated.json

Before:

```text
Deven Langston — selected animation & motion
```

After:

```text
RVA3D — selected animation & motion
```

Before:

```text
Selected prior professional work by Deven Langston, the experience behind RVA3D.
```

After:

```text
Selected 3D animation, visualization and motion design. Explore the case studies for our role and project credits.
```

Before:

```text
Selected animation and visualization from Deven Langston's professional experience
```

After:

```text
Selected 3D animation, visualization and motion design in the RVA3D reel
```

Before:

```text
Finished 16:9 campaign piece. Product-focused 3D treatment, shot design, animation, lighting, rendering, and pacing by Deven Langston within the SuperJoy production.
```

After:

```text
Finished campaign film. Our role covered the product-focused 3D treatment, shot design, animation, lighting, rendering and pacing within the SuperJoy production.
```

Before:

```text
Deven Langston / Selected finished work
```

After:

```text
RVA3D / Selected work
```

Before:

```text
Deven Langston / Twist Wireless / CG character build / Rigging
```

After:

```text
Twist Wireless / CG character build / Rigging
```

Before:

```text
Deven Langston / Capri Sun / 3D modeling / Materials and texturing
```

After:

```text
Capri Sun / 3D modeling / Materials and texturing
```

Before:

```text
Show products, systems, and ideas with custom, art-directed visual design.
```

After:

```text
Show a product before launch, animate a character or explain what a camera cannot capture.
```

## src/content/site/geico_phase_2.generated.json

Before:

```text
Deven Langston’s initial composite before separate Flame finishing and final color correction.
```

After:

```text
Our initial composite before separate Flame finishing and final color correction.
```
