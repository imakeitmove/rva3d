import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";
import { workRecords, portfolioWorkSlugs } from "../src/content/work/records.ts";
import { fiveBelow } from "../src/content/work/cases/five_below.ts";
import { besties } from "../src/content/work/cases/besties.ts";
import { orderedWorkStudies, nextCaseStudy } from "../src/content/work/work_curation.ts";
import { amsoilRefreshCopy } from "../src/content/work/amsoil_refresh.ts";
const base = [workRecords.find(x=>x.slug==="geico-geckos-cereal-box"), ...portfolioWorkSlugs.filter(x=>x!=="geico-geckos-cereal-box").map(slug=>workRecords.find(x=>x.slug===slug)), {slug:"desmi-rotan-pump", publication:{status:"public-approved"}}, workRecords.find(x=>x.slug==="uncommon-goods-outta-this-world")];
const reviewOrder = ["geico-geckos-cereal-box", "wawa-coffee-island", "axe-whaxe-lil-baby", "capri-sun", "five-below", "cable-snake", "desmi-rotan-pump", "coca-cola-oreo-besties", "amsoil-xpd-wind-grease", "uncommon-goods-outta-this-world"];
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
test("AMSOIL interim copy and exact hero provenance",()=>{
 assert.equal(amsoilRefreshCopy.title,"Greasy, not messy.");
 assert(amsoilRefreshCopy.opening.concat(" ",amsoilRefreshCopy.process).split(/\s+/).length<=100);
 const media=JSON.parse(fs.readFileSync("src/content/site/amsoil_refresh.generated.json"));
 assert.equal(media.source.split("/").at(-1),"AMSWIND_STILL_CAM_Main_FULL_Composite_2k_R003_V002_cropped.jpg");
 const urls=JSON.parse(fs.readFileSync("src/content/site/media-urls.generated.json"));
 const registry=JSON.parse(fs.readFileSync("src/content/site/media.generated.json"));
 const entry=registry[urls[media.hero.src].split("/").at(-1)];
 assert.equal(entry.source,media.source);assert.equal(entry.sourceSha256,media.sourceSha256);
 assert.equal(media.hero.width,entry.width);assert.equal(media.hero.height,entry.height);
});
