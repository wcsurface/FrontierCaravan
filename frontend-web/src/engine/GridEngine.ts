export type ShapeCoord = [number, number];

export interface ItemDef {
  id: string;
  sku: string;
  name: string;
  color: string;
  glowColor: string;
  shape: ShapeCoord[];
  spriteIndex: number;
  width: number;
  height: number;
}

export interface PlacedItem {
  instanceId: string;
  defId: string;
  gridX: number;
  gridY: number;
  color: string;
  shape: ShapeCoord[];
}

export class GridEngine {
  public rows: number;
  public cols: number;
  public matrix: number[][]; // 0: empty, 1: blocked, 2: filled

  constructor(rows: number, cols: number, obstacles: ShapeCoord[] = []) {
    this.rows = rows;
    this.cols = cols;
    this.matrix = Array.from({ length: rows }, () => Array(cols).fill(0));
    for (const [r, c] of obstacles) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        this.matrix[r][c] = 1;
      }
    }
  }

  public canPlace(item: ItemDef, targetR: number, targetC: number): boolean {
    for (const [dr, dc] of item.shape) {
      const r = targetR + dr;
      const c = targetC + dc;
      if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) {
        return false;
      }
      if (this.matrix[r][c] !== 0) {
        return false;
      }
    }
    return true;
  }

  public place(item: ItemDef, targetR: number, targetC: number): PlacedItem {
    if (!this.canPlace(item, targetR, targetC)) {
      throw new Error(`Invalid placement at (${targetR}, ${targetC})`);
    }
    for (const [dr, dc] of item.shape) {
      this.matrix[targetR + dr][targetC + dc] = 2;
    }
    return {
      instanceId: `${item.id}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      defId: item.id,
      gridX: targetC,
      gridY: targetR,
      color: item.color,
      shape: item.shape,
    };
  }

  public remove(placed: PlacedItem): void {
    for (const [dr, dc] of placed.shape) {
      const r = placed.gridY + dr;
      const c = placed.gridX + dc;
      if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
        if (this.matrix[r][c] === 2) {
          this.matrix[r][c] = 0;
        }
      }
    }
  }

  public isFull(): boolean {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.matrix[r][c] === 0) return false;
      }
    }
    return true;
  }

  public getOccupancyRate(): number {
    let playCells = 0;
    let filledCells = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.matrix[r][c] !== 1) playCells++;
        if (this.matrix[r][c] === 2) filledCells++;
      }
    }
    return playCells === 0 ? 1 : filledCells / playCells;
  }
}
