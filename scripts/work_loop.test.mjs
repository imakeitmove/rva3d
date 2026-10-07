import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { amsoilXpdWindGrease } from "../src/content/work/cases/amsoil-xpd-wind-grease.ts";
import { workRecords, portfolioWorkSlugs } from "../src/content/work/records.ts";
import { fiveBelow } from "../src/content/work/cases/five_below.ts";
import { besties } from "../src/content/work/cases/besties.ts";
import { orderedWorkStudies, nextCaseStudy } from "../src/content/work/work_curation.ts";
import { amsoilRefreshCopy, amsoilMediaSequence } from "../src/content/work/amsoil_refresh.ts";
const base = [workRecords.find(x=>x.slug==="geico-geckos-cereal-box"), ...portfolioWorkSlugs.filter(x=>x!=="geico-geckos-cereal-box").map(slug=>workRecords.find(x=>x.slug===slug)), {slug:"desmi-rotan-pump", publication:{status:"public-approved"}}, workRecords.find(x=>x.slug==="uncommon-goods-outta-this-world")];
const reviewOrder = ["geico-geckos-cereal-box", "wawa-coffee-island", "axe-whaxe-lil-baby", "capri-sun", "five-below", "cable-snake", "coca-cola-oreo-besties", "desmi-rotan-pump", "amsoil-xpd-wind-grease", "uncommon-goods-outta-this-world"];
for (const review of [true,false]) test((review?"review":"release")+" Work and circular loop visit each eligible case exactly once",()=>{
  const selected=orderedWorkStudies(base,[fiveBelow,besties],review);
  const expected=review?reviewOrder:["geico-geckos-cereal-box","wawa-coffee-island","axe-whaxe-lil-baby","capri-sun","amsoil-xpd-wind-grease","cable-snake","desmi-rotan-pump","uncommon-goods-outta-this-world"];
  assert.deepEqual(selected.map(x=>x.slug),expected);
  let current=selected[0], visited=[];
  for(let i=0;i<selected.length;i++){visited.push(current.slug);const next=nextCaseStudy(current.slug,selected);assert.equal(next.slug,expected[(i+1)%expected.length]);assert(selected.includes(next));current=next;}
  assert.deepEqual(visited,expected);assert.equal(new Set(visited).size,selected.length);assert.equal(current.slug,selected[0].slug);
  if(!review) assert(selected.every(x=>x.publication.status!=="preview"));
});
test("ineligible candidates are excluded and duplicate sequence records fail",()=>{
 assert(!orderedWorkStudies(base,[{slug:"private",publication:{status:"draft"}}],true).some(x=>x.slug==="private"));
 assert(!orderedWorkStudies(base,[{slug:"pending",publication:{status:"approved"}}],false).some(x=>x.slug==="pending"));
 assert.throws(()=>orderedWorkStudies(base,[base[0]],true),/Duplicate/);
 assert.equal(nextCaseStudy("none",[]),undefined);
});
test("AMSOIL copy, animatic hero and preserved earlier hero provenance",()=>{
 assert.equal(amsoilRefreshCopy.title,"Greasy, not messy.");
 assert(amsoilRefreshCopy.opening.concat(" ",amsoilRefreshCopy.process.join(" ")," ",amsoilRefreshCopy.print).split(/\s+/).length<=100);
 const media=JSON.parse(fs.readFileSync("src/content/site/amsoil_refresh.generated.json"));
 assert.equal(media.source.split("/").at(-1),"AMSWIND_STILL_CAM_Main_FULL_Composite_2k_R003_V002_cropped.jpg");
 const urls=JSON.parse(fs.readFileSync("src/content/site/media-urls.generated.json"));
 const registry=JSON.parse(fs.readFileSync("src/content/site/media.generated.json"));
 const entry=registry[urls[media.hero.src].split("/").at(-1)];
 assert.equal(entry.source,media.source);assert.equal(entry.sourceSha256,media.sourceSha256);
 assert.equal(media.hero.width,entry.width);assert.equal(media.hero.height,entry.height);
 const selected=registry[urls[amsoilMediaSequence.hero.src].split("/").at(-1)];
 assert.equal(selected.source.split("/").at(-1),"Wind_Turbine_Generator_animatic_part1_005_preview_2025-10-28_$time0479.png");
 assert.equal(selected.sourceSha256,"f298ece6d94163778e4801af84dd3c182d9231e5d056597809b0ec79bde2b7ad");
 assert.equal(selected.width,amsoilMediaSequence.hero.width);assert.equal(selected.height,amsoilMediaSequence.hero.height);
 assert.notEqual(amsoilMediaSequence.hero.src,media.hero.src);
});

test("AMSOIL owner copy and ordered process, four loops and final stills",()=>{
 assert.equal(amsoilRefreshCopy.opening,"AMSOIL needed to show how their grease performs inside a wind-turbine bearing. Unable to produce proper video footage, we helped them out by producing a 3D animation instead.");
 assert.deepEqual(amsoilRefreshCopy.process,["Working from limited references and two unrelated stock models,","we rebuilt the drivetrain and main bearing","and pumped grease between the parts."]);
 assert.equal(amsoilRefreshCopy.print,"The same 3D setup later supplied a ten-foot-wide trade-show print, extending the animation work into a large-format still.");
 const urls=JSON.parse(fs.readFileSync("src/content/site/media-urls.generated.json")),registry=JSON.parse(fs.readFileSync("src/content/site/media.generated.json"));
 const entry=media=>registry[urls[media.src].split("/").at(-1)];
 const names=media=>entry(media).source.split("/").at(-1);
 assert.deepEqual(amsoilMediaSequence.process.map(x=>x.kind),["image","video","video"]);
 assert.equal(urls[amsoilMediaSequence.process[0].src],"/media/b874568252fda0520d17.webp");
 // Previous viewport/loop expectations: _002, intro then outro.
 assert.deepEqual(amsoilMediaSequence.process.slice(1).map(names),["amsoil_grease_viewport_001.mp4","SKF_spherical_roller_bearings_003_overpacked.mp4"]);
 assert.deepEqual(amsoilMediaSequence.loops.map(names),["XDP_Grease-Bearings_bearing_loop.mp4","XDP_Grease-Bearings_grease_loop.mp4","XDP_Grease-Bearings_intro_loop.mp4","XDP_Grease-Bearings_outro_loop.mp4"]);
 // Previous ending expectations: animatic on left and trade-show proof on right.
 assert.equal(amsoilMediaSequence.final.length,1);
 assert.equal(names(amsoilMediaSequence.final[0]),"AMSWIND_STILL_CAM_Main_FULL_Composite_4k_R003_V002_cropped.jpg");
 assert.equal(entry(amsoilMediaSequence.final[0]).sourceSha256,"6ce2a6aa40404ced634ba2a42bb2abc99ca0614fb9e81c3b27d043555cd6c2f6");
 const all=[...amsoilMediaSequence.process,...amsoilMediaSequence.loops,...amsoilMediaSequence.final];
 assert(!all.some(item=>names(item)==="amsoil_grease_viewport_002.mp4"));
 assert(!all.some(x=>x.src.includes("grease_comparison")||x.src.includes("bearing_closeup")||x.src.includes("hero_composite")));
});
test("AMSOIL single ending and factual centered credit selection",()=>{
 assert.deepEqual(amsoilXpdWindGrease.credits,[{name:"AMSOIL",role:"Client"},{name:"Greg Collins",role:"Writer / Producer"},{name:"Deven Langston — RVA3D",role:"3D Visualization / Animation"},{name:"2025",role:"Year"}]);
 assert(!amsoilXpdWindGrease.credits.some(credit=>/production company/i.test(credit.role)));
 const active=ts.transpileModule(fs.readFileSync("src/components/site/AmsoilCase.tsx","utf8"),{fileName:"AmsoilCase.tsx",compilerOptions:{jsx:ts.JsxEmit.Preserve,module:ts.ModuleKind.ESNext,removeComments:true}}).outputText;
 assert.match(active,/hero=\{sequence.hero\}/);assert.match(active,/credits=\{study.credits\}/);
 assert.match(active,/<CaseBeat id="final-image">/);assert(!active.includes('id="final-stills"'));
});
/* Retained founder-only assertion for restoration of AboutEditorial.
test("About founder paragraph uses exact owner wording and house BrandText",()=>{
 const active=ts.transpileModule(fs.readFileSync("src/components/site/AboutEditorial.tsx","utf8"),{fileName:"AboutEditorial.tsx",compilerOptions:{jsx:ts.JsxEmit.Preserve,module:ts.ModuleKind.ESNext,removeComments:true}}).outputText;
 const expected="With 20 years of experience in motion design and 3D animation, Deven Langston is RVA3D's founder and senior artist, guiding projects from first frame to final render.";
 assert(active.includes('<BrandText text="'+expected+'"'));
 assert(!active.includes("Deven connects creative direction with hands-on execution."));
 assert(active.includes("A small studio with a clear point of contact."));
});
*/
test("About team biographies retain house BrandText and the artist's confirmed experience",()=>{
 // Previous founder-only paragraph assertion belongs to the retained AboutEditorial composition.
 const active=ts.transpileModule(fs.readFileSync("src/components/site/AboutTeam.tsx","utf8"),{fileName:"AboutTeam.tsx",compilerOptions:{jsx:ts.JsxEmit.Preserve,module:ts.ModuleKind.ESNext,removeComments:true}}).outputText;
 const content=fs.readFileSync("src/content/site/about_team.ts","utf8");
 assert(active.includes('<BrandText text={person.biography}'));
 assert(content.includes("Deven leads the creative and technical work, from early planning through final delivery."));
 assert(content.includes("20 years of experience in motion design and 3D animation"));
 assert(!active.includes("A small studio with a clear point of contact."));
});
test("AMSOIL six web clips have silent browser-compatible media and matching posters",()=>{
 const urls=JSON.parse(fs.readFileSync("src/content/site/media-urls.generated.json")),registry=JSON.parse(fs.readFileSync("src/content/site/media.generated.json"));
 for(const media of [...amsoilMediaSequence.process.slice(1),...amsoilMediaSequence.loops]){
  assert.equal(media.presentation,"loop");assert.equal(media.hasAudio,false);
  const entry=registry[urls[media.src].split("/").at(-1)];
  const streams=JSON.parse(execFileSync("ffprobe",["-v","error","-show_streams","-of","json",entry.file],{encoding:"utf8"})).streams;
  assert(!streams.some(s=>s.codec_type==="audio"));
  const video=streams.find(s=>s.codec_type==="video");assert.equal(video.codec_name,"h264");assert.equal(video.pix_fmt,"yuv420p");
  assert.equal(video.width,media.width);assert.equal(video.height,media.height);
  assert.equal(media.poster.width,media.width);assert.equal(media.poster.height,media.height);
 }
});
