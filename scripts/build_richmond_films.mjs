import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { selectProductionMedia } from './production-media-selection.mjs';
const root='W:/PROJECTS/_ACTIVE/2026_RVA3D_Website/production/site_content/1_source/rooted_in_richmond/';
const sources=[
 ['48-hour-pixel-drop-meet-the-team-deven.jpg','Deven Langston beside a green screen and studio light in a Pixel Drop team introduction.'],
 ['48-hour-filmapalooza-red-carpet_cropped.jpg','Pixel Drop filmmakers together on the Filmapalooza red carpet.'],
 ['48-hour-runner-up-best-film_cropped.jpg','The filmmaking team on stage beneath the Runner-Up Best Film presentation.'],
 ['48-hour-pixel-drop-meet-the-team.jpg','The Pixel Drop team gathered in front of a green screen.'],
 ['fool_me_twice_cover_image_001.jpg','Fool Me Twice artwork for Pixel Drop\'s Richmond 48 Hour Film Project film.'],
 ['48-hour-pixel-drop-meet-the-team-rumple.jpg','Deven holding Rumple in front of a green screen.'],
];
const rf='src/content/site/media.generated.json',uf='src/content/site/media-urls.generated.json',bf='src/content/site/public_release_20260913.generated.json';
const registry=JSON.parse(await fs.readFile(rf,'utf8')),urls=JSON.parse(await fs.readFile(uf,'utf8')),baseline=JSON.parse(await fs.readFile(bf,'utf8'));
const original=structuredClone(registry),originalUrls={...urls},hash=b=>createHash('sha256').update(b).digest('hex'),slides=[],audit=[];
for (const [name,alt] of sources) {
 const source=root+name,bytes=await fs.readFile(source),sourceSha256=hash(bytes);
 const {data,info}=await sharp(bytes).rotate().resize({width:1280,withoutEnlargement:true}).toColourspace('srgb').webp({quality:85,effort:6}).toBuffer({resolveWithObject:true});
 const sha256=hash(data),key=sha256.slice(0,20)+'.webp',file='private-media/'+key;
 if(!registry[key]) {await fs.writeFile(file,data,{flag:'wx'});registry[key]={file,type:'image/webp',bytes:data.length,sha256,source,sourceSha256,width:info.width,height:info.height,publication:'public-approved',approvedAt:'2026-09-30',approvedBy:'Deven Langston',approvalAuthority:'RVA3D owner',approvalSource:'direct-owner-approval',approvalNote:'Owner-selected six-photo About slideshow; web derivatives only; no deployment authorization.',recipe:'Auto-orient; uncropped max1280px; sRGB; WebP quality85 effort6; metadata stripped.'};}
 assert.equal(registry[key].sourceSha256,sourceSha256);assert.equal(hash(await fs.readFile(file)),sha256);
 const logical='/media/about_richmond/films_'+String(slides.length+1).padStart(2,'0')+'.webp';urls[logical]='/media/'+key;
 slides.push({kind:'image',src:urls[logical],width:info.width,height:info.height,alt});audit.push({name,sourceSha256,key,width:info.width,height:info.height});
 assert.equal(hash(await fs.readFile(source)),sourceSha256);
}
for(const [k,v] of Object.entries(original))assert.deepEqual(registry[k],v);
for(const [k,v] of Object.entries(originalUrls))assert.equal(urls[k],v);
const selected=selectProductionMedia(registry,urls);
baseline.richmondSlideshow20260930 ??= {previousAssets:baseline.assets,previousUrls:baseline.logicalUrls,addedKeys:Object.keys(registry).filter(k=>!original[k]),sources:audit,authorization:'Owner-selected About film slideshow; no deployment.'};
baseline.assets=Object.keys(selected.manifest).length;baseline.logicalUrls=Object.keys(selected.urls).length;baseline.registryDigest=hash(JSON.stringify(selected.manifest));baseline.urlsDigest=hash(JSON.stringify(selected.urls));
for(const [f,v] of [[rf,registry],[uf,urls],[bf,baseline],['src/content/site/richmond_films.generated.json',slides]])await fs.writeFile(f,JSON.stringify(v,null,2)+'\n');
console.log({assets:baseline.assets,urls:baseline.logicalUrls,sources:audit});
