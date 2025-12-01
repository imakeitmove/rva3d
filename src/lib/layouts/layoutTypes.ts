// in something like src/lib/layoutTypes.ts
export type Tile = {
    id: string;
    // size in grid units, not pixels
    w: number; // width in columns
    h: number; // height in rows
  };
  
  export type LayoutParams = {
    columns: number;
    cellSize: number; // world units for one grid cell
    gutter: number;   // space between tiles in world units
  };
  
  export type PositionedTile = Tile & {
    x: number; // world-space position
    y: number;
    col: number; // grid coords if you need them
    row: number;
  };
  