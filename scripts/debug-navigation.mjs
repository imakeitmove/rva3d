// Unneeded diagnostic import retained: import fs from 'node:fs/promises';
import { localBrowser,pause } from './candidate-browser.mjs';
const b=await localBrowser();
await b.send('Network.enable');await b.send('Network.clearBrowserCookies');
await b.send('Page.navigate',{url:'http://127.0.0.1:4321/review/login'});await pause(900);
await b.evaluate("document.querySelector('[name=password]').value='candidate-local-fixture-only';document.querySelector('form').requestSubmit()");await pause(1400);
for(const route of ['work/amsoil-xpd-wind-grease','capabilities']){
await b.send('Page.navigate',{url:'http://127.0.0.1:4321/review/site/'+route});await pause(1000);
console.log(await b.evaluate("({url:location.href,links:[...document.querySelectorAll('.delivery .button,.case-next>.editorial-link')].map(a=>({href:a.href,text:a.textContent}))})"));
if(route.startsWith('work')){await b.evaluate("document.querySelector('.case-next>.editorial-link').click()");await pause(1200);console.log(await b.evaluate('location.href'));}
}
await b.close();

