import { Color, type MeshBasicMaterial } from "three";

export type LogoRole = "black" | "signal" | "paper";
export type LogoBinding = { material: MeshBasicMaterial; role: LogoRole; flash: boolean };
export type LogoPalette = Record<LogoRole, string>;
export function logoPalette(light: boolean, tokens: { purple: string; signal: string; paper: string }): LogoPalette {
  // Preserve authored outline/interior separation. The body mark always uses
  // the approved dark palette; only the header follows its existing tone.
  return light
    ? { black: tokens.paper, paper: "#000000", signal: tokens.purple }
    : { black: "#000000", paper: tokens.paper, signal: tokens.signal };
}

// A finite, per-instance material transition. No work is scheduled at rest.
export class LogoPaletteTransition {
  private bindings: LogoBinding[];
  private clock: { now: () => number; frame: (callback: () => void) => number; cancel: (id: number) => void };
  private invalidate: () => void;
  private current: Record<LogoRole, Color>;
  private frameId = 0;
  private white = false;
  constructor(bindings: LogoBinding[], palette: LogoPalette, clock: {
    now: () => number;
    frame: (callback: () => void) => number;
    cancel: (id: number) => void;
  }, invalidate: () => void) {
    this.bindings = bindings;
    this.clock = clock;
    this.invalidate = invalidate;
    this.current = { black: new Color(palette.black), paper: new Color(palette.paper), signal: new Color(palette.signal) };
    this.apply();
  }
  private apply() {
    for (const binding of this.bindings) {
      if (this.white && binding.flash) binding.material.color.set("#ffffff");
      else binding.material.color.copy(this.current[binding.role]);
    }
    this.invalidate();
  }
  flash(white: boolean) { this.white = white; this.apply(); }
  change(palette: LogoPalette, duration: number) {
    this.clock.cancel(this.frameId);
    this.frameId = 0;
    const roles = ["black", "paper", "signal"] as const;
    const from = roles.map(role => this.current[role].clone());
    const to = roles.map(role => new Color(palette[role]));
    if (roles.every((role, i) => this.current[role].equals(to[i]))) return;
    const start = this.clock.now();
    const tick = () => {
      const progress = duration > 0 ? Math.min(1, (this.clock.now() - start) / duration) : 1;
      const eased = progress * progress * (3 - 2 * progress);
      roles.forEach((role, i) => this.current[role].lerpColors(from[i], to[i], eased));
      this.apply();
      this.frameId = progress < 1 ? this.clock.frame(tick) : 0;
    };
    tick();
  }
  dispose() { this.clock.cancel(this.frameId); this.frameId = 0; }
}
