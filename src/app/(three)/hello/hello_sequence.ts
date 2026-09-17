export const HELLO_LOGO = "/site-assets/hello/rva3d_hello.webp";
export const END_THRESHOLD = 0.975;
export const END_HOLD_MS = 1500;

export const HELLO_BEATS = [
  { text: "HELLO!", spoken: "Hello!", color: "#d7ff43" },
  { text: "IT WAS VERY\nNICE TO\nMEET YOU.", spoken: "It was very nice to meet you.", color: "#f3f1e9" },
  { text: "OR...", spoken: "Or…", color: "#d7ff43" },
  { text: "IF YOU FOUND\nOUR CARD ON\nTHE GROUND...", spoken: "If you found our card on the ground…", color: "#f3f1e9" },
  { text: "THAT’S\nCOOL TOO.", spoken: "That’s cool too.", color: "#d7ff43" },
  { text: "WELCOME.", spoken: "Welcome.", color: "#f3f1e9" },
] as const;

export const clampProgress = (value: number) => Math.max(0, Math.min(1, value));
