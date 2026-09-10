"use client";
import { useState } from "react";
export function StudioExplorer() {
  const [angle, setAngle] = useState(25);
  return <figure className="studio-explorer"><div className="cube-stage" aria-hidden="true"><div className="explorer-cube" style={{ transform: `rotateX(-18deg) rotateY(${angle}deg)` }}>{["front", "back", "right", "left", "top", "bottom"].map((face, i) => <div className={`cube-face ${face}`} key={face}><span>0{i + 1}</span></div>)}</div></div><label>Explore the view<input type="range" min={0} max={360} value={angle} onChange={e => setAngle(Number(e.target.value))} aria-valuetext={`${angle} degrees`} /></label><figcaption>Studio interaction study. Drag the control or use the arrow keys to explore the object. A small example of user-directed viewing, with no automatic motion.</figcaption></figure>;
}
