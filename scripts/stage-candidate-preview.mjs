import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {verifyPreviewSource} from './verify-preview-source.mjs';
await verifyPreviewSource();
const root=process.cwd(),stage=path.join(root,'scripts/runtime/deploy-'+Date.now());
await fs.mkdir(stage,{recursive:true});
const dirs=['src','prisma','public/site-assets','public/fonts/Geist','public/fonts/Geist_Mono'];
for(const dir of dirs)await fs.cp(path.join(root,dir),path.join(stage,dir),{recursive:true});
for(const file of ['package.json','package-lock.json','tsconfig.json','next.config.ts','postcss.config.mjs','next-env.d.ts'])await fs.copyFile(path.join(root,file),path.join(stage,file));
const media=JSON.parse(await fs.readFile('src/content/site/media.generated.json','utf8'));
await fs.mkdir(path.join(stage,'private-media'));
for(const entry of Object.values(media)){const data=await fs.readFile(entry.file);if(createHash('sha256').update(data).digest('hex')!==entry.sha256)throw Error('Asset mismatch');await fs.writeFile(path.join(stage,entry.file),data);}
await fs.mkdir(path.join(stage,'.vercel'));await fs.copyFile('.vercel/project.json',path.join(stage,'.vercel/project.json'));
await fs.writeFile(path.join(stage,'vercel.json'),JSON.stringify({framework:'nextjs',buildCommand:'npm run build -- --webpack',installCommand:'npm ci && npx prisma generate'},null,2));
const files=[];
async function walk(dir){for(const entry of await fs.readdir(dir,{withFileTypes:true})){const absolute=path.join(dir,entry.name);if(entry.isDirectory())await walk(absolute);else{const data=await fs.readFile(absolute);files.push({path:path.relative(stage,absolute).replaceAll('\\','/'),bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}}}
await verifyPreviewSource(stage);
await walk(stage);files.sort((a,b)=>a.path.localeCompare(b.path));
if(files.some(f=>/\.env|edge_profile|design_prototypes|^public\/(media|project-media|models)|\.pem$/.test(f.path)))throw Error('Prohibited deployment path');
const sha256=createHash('sha256').update(JSON.stringify(files)).digest('hex');
await fs.writeFile('docs/release-candidate/deployment-scope.json',JSON.stringify({stage,branch:execFileSync('git',['branch','--show-current'],{encoding:'utf8'}).trim(),base:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),worktree:root,gitStatus:execFileSync('git',['status','--porcelain=v1'],{encoding:'utf8'}),snapshot:sha256,files,privateAssets:Object.keys(media).length,publicAssets:files.filter(f=>f.path.startsWith('public/')).map(f=>f.path)},null,2));
console.log(JSON.stringify({stage,snapshot:sha256,files:files.length,bytes:files.reduce((n,f)=>n+f.bytes,0)}));
