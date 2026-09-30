// Timeline seconds are authoritative; no mesh-dependent pointer boundaries.
export type LogoPhase = "idle" | "anticipate" | "hold" | "reverse" | "pause" | "spin";
export type LogoClock = {
  now: () => number;
  frame: (callback: (time: number) => void) => number;
  cancelFrame: (id: number) => void;
  delay: (callback: () => void, ms: number) => number;
  cancelDelay: (id: number) => void;
};
export class LogoPlayback {
  time = 0;
  phase: LogoPhase = "idle";
  inside = false;
  private frameId = 0;
  private pauseId = 0;
  private flashId = 0;
  private previous = 0;
  private clock: LogoClock;
  private pose: (time: number, phase: LogoPhase) => void;
  private flash: (white: boolean) => void;

  constructor(clock: LogoClock, pose: (time: number, phase: LogoPhase) => void, flash: (white: boolean) => void) {
    this.clock = clock;
    this.pose = pose;
    this.flash = flash;
  }
  enter() {
    if (this.inside) return;
    this.inside = true;
    if (this.phase === "spin") return;
    this.clock.cancelDelay(this.pauseId);
    this.move("anticipate");
  }
  leave() {
    this.inside = false;
    if (this.phase === "anticipate" || this.phase === "hold") this.move("reverse");
  }
  click() {
    if (!this.inside || !["anticipate", "hold"].includes(this.phase)) return false;
    this.flash(true);
    this.flashId = this.clock.delay(() => this.flash(false), 125);
    this.move("spin");
    return true;
  }
  private move(phase: LogoPhase) {
    this.clock.cancelFrame(this.frameId);
    this.phase = phase;
    this.previous = this.clock.now();
    this.pose(this.time, this.phase);
    this.frameId = this.clock.frame(this.tick);
  }
  private tick = (now: number) => {
    const delta = Math.max(0, (now - this.previous) / 1000);
    this.previous = now;
    const target = this.phase === "reverse" ? 0 : this.phase === "anticipate" ? 0.4 : 3;
    this.time = this.phase === "reverse" ? Math.max(target, this.time - delta) : Math.min(target, this.time + delta);
    if (this.time === target) {
      if (this.phase === "reverse") {
        this.phase = "pause";
        this.pauseId = this.clock.delay(() => this.move("spin"), 250);
      } else if (this.phase === "anticipate") this.phase = "hold";
      else {
        // Exported endpoint rotations and reference silhouettes match.
        this.time = 0;
        this.phase = "idle";
      }
      this.frameId = 0;
    } else this.frameId = this.clock.frame(this.tick);
    this.pose(this.time, this.phase);
  };
  dispose() {
    this.clock.cancelFrame(this.frameId);
    this.clock.cancelDelay(this.pauseId);
    this.clock.cancelDelay(this.flashId);
  }
}
