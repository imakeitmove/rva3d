// src/lib/layout.ts
import type { Tile, LayoutParams, PositionedTile } from "./layoutTypes";

export function computeLayout(
  tiles: Tile[],
  params: LayoutParams
): PositionedTile[] {
  const { columns, cellSize, gutter } = params;

  // 2D occupancy grid: grid[row][col] = true/false
  const grid: boolean[][] = [];
  const result: PositionedTile[] = [];

  const ensureRow = (row: number) => {
    while (grid.length <= row) {
      grid.push(new Array(columns).fill(false));
    }
  };

  const canPlace = (col: number, row: number, w: number, h: number): boolean => {
    for (let r = row; r < row + h; r++) {
      ensureRow(r);
      for (let c = col; c < col + w; c++) {
        if (c >= columns) return false;
        if (grid[r][c]) return false;
      }
    }
    return true;
  };

  const occupy = (col: number, row: number, w: number, h: number) => {
    for (let r = row; r < row + h; r++) {
      ensureRow(r);
      for (let c = col; c < col + w; c++) {
        grid[r][c] = true;
      }
    }
  };

  // Big tiles first so they get the best spots
  const sorted = [...tiles].sort(
    (a, b) => b.w * b.h - a.w * a.h
  );

  for (const tile of sorted) {
    let placed = false;
    for (let row = 0; !placed; row++) {
      ensureRow(row);
      for (let col = 0; col <= columns - tile.w; col++) {
        if (canPlace(col, row, tile.w, tile.h)) {
          occupy(col, row, tile.w, tile.h);

          // Convert grid coords -> world coords (centered around 0)
          const worldX =
            (col + tile.w / 2) * (cellSize + gutter) -
            (columns * (cellSize + gutter)) / 2;
          const worldY =
            -(row + tile.h / 2) * (cellSize + gutter); // negative so rows go downward

          result.push({
            ...tile,
            col,
            row,
            x: worldX,
            y: worldY,
          });

          placed = true;
          break;
        }
      }
    }
  }

  return result;
}
