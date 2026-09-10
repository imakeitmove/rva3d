// One restrained icon family; names belong to the actual interactive buttons.
export function icon(name) {
  const paths = {
    play: '<path d="M8 5l11 7-11 7z" fill="currentColor" stroke="none"/>',
    pause: '<path d="M8 5v14M16 5v14" stroke-width="3"/>',
    muted: '<path d="M11 5L6 9H3v6h3l5 4zM16 9l6 6m0-6-6 6"/>',
    sound: '<path d="M11 5L6 9H3v6h3l5 4zM16 8c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
    expand: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
  };
  return `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true" focusable="false">${paths[name] || paths.play}</svg>`;
}
