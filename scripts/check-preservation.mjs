import fs from 'node:fs/promises';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const baseline=JSON.parse(await fs.readFile('docs/release-candidate/source-baseline.json','utf8'));let mismatches=[];
for(const file of baseline.files){const hash=createHash('sha256').update(await fs.readFile(path.join(baseline.original,file.path))).digest('hex');if(hash!==file.sha256)mismatches.push(file.path);}
const initial=(await fs.readFile('docs/release-candidate/baseline-status.txt','utf8')).replaceAll('\r','').trimEnd();
const current=execFileSync('git',['status','--porcelain=v1','--untracked-files=all'],{cwd:baseline.original,encoding:'utf8'}).replaceAll('\r','').trimEnd();
const currentShort=execFileSync('git',['status','--short'],{cwd:baseline.original,encoding:'utf8'}).replaceAll('\r','').trimEnd();
const result={original:baseline.original,originalFilesChecked:baseline.files.length,hashMismatches:mismatches,statusMatches:initial===current||initial===currentShort,originalUntouched:mismatches.length===0&&(initial===current||initial===currentShort)};
await fs.writeFile('docs/release-candidate/preservation-verification.json',JSON.stringify(result,null,2));console.log(result);
const audit=JSON.parse((await fs.readFile('docs/release-candidate/dependency-audit.json','utf8')).replace(/^\uFEFF/,''));console.log(JSON.stringify({vulnerabilities:audit.metadata?.vulnerabilities,packages:Object.values(audit.vulnerabilities||{}).map(v=>({name:v.name,severity:v.severity,isDirect:v.isDirect,via:v.via.filter(v=>typeof v==='object').map(v=>({title:v.title,url:v.url,range:v.range})),fix:v.fixAvailable}))},null,2));
