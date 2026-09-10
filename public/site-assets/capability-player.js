import { MediaController } from "./v004_media.js";
// V3 keeps normal capability examples moving only while they are meaningfully in view.
export function mountCapabilityPlayer(root, media) {
  const player = new MediaController(root, { ...media, hasAudio: false }, { ambient: true });
  player.restoreIntent("auto");
  player.setMedia({ ...media, hasAudio: false, loop: true });
  // Shared React fullscreen controls own their labels; MediaController owns
  // viewport visibility, user intent and reduced-motion behavior.
  return () => player.destroy();
}
// Previous V1 automatic playback and pause-all adapter retained for restoration.
// import { MediaController, reconcileMedia } from "./v004_media.js";
// 
// // Adapt the approved homepage controller; playback, visibility, reduced motion and
// // manual intent remain owned by that controller. This module only mounts capability UI.
// const players = new Set();
// let paused = false;
// document.addEventListener("rva-capability-motion", event => {
//   paused = !!event.detail;
//   for (const player of players) player.sectionPaused = paused;
//   reconcileMedia();
// });
// export function mountCapabilityPlayer(root, media) {
//   const player = new MediaController(root, { ...media, hasAudio: false }, { ambient: true });
//   player.sectionPaused = paused;
//   player.setMedia({ ...media, hasAudio: false, loop: true });
//   players.add(player);
//   const button = root.querySelector(".v-fullscreen");
//   const label = () => {
//     const full = document.fullscreenElement === root.querySelector(".v-picture");
//     button.setAttribute("aria-label", `${full ? "Exit" : "Enter"} capability media fullscreen`);
//     button.innerHTML = `<span aria-hidden="true">${full ? "↙" : "↗"}</span>`;
//   };
//   document.addEventListener("fullscreenchange", label);
//   label();
//   return () => { players.delete(player); document.removeEventListener("fullscreenchange", label); player.destroy(); };
// }
// 
// Previous standalone fullscreen label adapter retained for restoration.
//   const button = root.querySelector(".v-fullscreen");
//   const label = () => {
//     const full = document.fullscreenElement === root.querySelector(".v-picture");
//     button.setAttribute("aria-label", (full ? "Exit" : "Enter") + " capability media fullscreen");
//     button.innerHTML = '<span aria-hidden="true">' + (full ? "↙" : "↗") + '</span>';
//   };
//   document.addEventListener("fullscreenchange", label); label();
//   return () => { document.removeEventListener("fullscreenchange", label); player.destroy(); };
