import { Color } from "three";

export const RVA3D_GREEN = "#7CFF4F";
export const RVA3D_BLUE = "#42B7FF";
export const RVA3D_PINK = "#FF4FA3";
export const RVA3D_INK = "#07090C";
export const RVA3D_METAL = "#C7CDD2";
export const RVA3D_WHITE = "#F2F4F1";

export const RVA3D_PALETTE = {
  green: RVA3D_GREEN,
  blue: RVA3D_BLUE,
  pink: RVA3D_PINK,
  ink: RVA3D_INK,
  metal: RVA3D_METAL,
  white: RVA3D_WHITE,
} as const;

export function mixRva3dColor(
  color: string,
  mixColor: string,
  amount: number,
) {
  return `#${new Color(color)
    .lerp(new Color(mixColor), amount)
    .getHexString()}`;
}
