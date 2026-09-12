// Unneeded diagnostic import retained: import fs from 'node:fs/promises';
import {localBrowser,pause} from './candidate-browser.mjs';
const b=await localBrowser();await b.send('Network.enable');await b.send('Network.clearBrowserCookies');await b.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});await b.send('Page.navigate',{url:'http://127.0.0.1:4321/review/login'});await pause(700);await b.evaluate("document.querySelector('[name=password]').value='candidate-local-fixture-only';document.querySelector('form').requestSubmit()");await pause(900);
for(const route of ['capabilities#product-technical-visualization','work#amsoil-xpd-wind-grease','work/amsoil-xpd-wind-grease']){
await b.send('Page.navigate',{url:'http://127.0.0.1:4321/review/site/'+route});await pause(2200);
if(route.includes('#')){console.log('BEFORE',await b.evaluate('scrollY'));await b.evaluate("document.getElementById(location.hash.slice(1)).scrollIntoView({block:'start',behavior:'instant'})");await pause(300);console.log('AFTER',await b.evaluate('scrollY'));}
console.log(await b.evaluate("({url:location.href,y:scrollY,hashTop:document.getElementById(location.hash.slice(1))?.getBoundingClientRect().top,ready:document.readyState})"));
if(route.includes('/amsoil')){
await b.evaluate("document.querySelector('details').open=true;document.querySelector('details').getBoundingClientRect();document.querySelector('details img').scrollIntoView({block:'center',behavior:'instant'})");await pause(1000);
console.log(await b.evaluate("[...document.querySelectorAll('details img')].map(i=>({src:i.src,loaded:i.naturalWidth,complete:i.complete,rect:i.getBoundingClientRect().toJSON()}))"));
}
}
await b.close();
