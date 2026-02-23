/**
 * LIFE TIMELINE CELL POSITION MAPPING LAYER
 *
 * This file is responsible for converting a life-month index into an exact
 * pixel coordinate on the Canvas where the corresponding cell should be drawn.
 *
 * The life timeline exists as a linear sequence of months represented by:
 *
 *     index belongs to [0, totalMonths)
 *
 * However, the Canvas rendering engine requires spatial coordinates in order
 * to draw visual elements.
 *
 * This layer performs the transformation:
 *
 *     timeline index
 *             ⬇️
 *     grid row & column
 *             ⬇️
 *     canvas pixel position (x, y)
 *
 * SAFETY:
 *
 * If the provided index is outside the valid grid range:
 *
 *     index < 0 OR index ≥ rows × columns
 *
 * the returned position should place the cell outside the visible viewport.
 * This allows downstream rendering logic to proceed without requiring
 * conditional null-checks while ensuring invalid cells are not displayed.
 *
 *
 * NOTE:
 *
 * This file performs coordinate computation only.
 * It must NOT:
 * - classify cell state
 * - perform layout calculations
 * - access DOM or Canvas APIs
 * - persist any state
 *
 * It serves as the spatial adapter between:
 *
 *     LayoutConfig (grid geometry)
 *                 ⬇️
 *         Canvas draw positions
 */

import type { LayoutConfig, CellPosition } from '../types/life.types';

/**
 *
 * @param {number} index provide the index of cell (0 based indexing)
 * @param {LayoutConfig} layoutConfig provide the layout configuration of the grid
 * @returns {CellPosition} returns valid x y coordinates of the cell
 */
export const getCellPosition = (
  index: number,
  layoutConfig: LayoutConfig,
): CellPosition => {
  // for invalid index this will be drawn outside the screen so will not be visible
  if (index < 0 || index >= layoutConfig.columns * layoutConfig.rows) {
    return {
      x: -layoutConfig.cellSize,
      y: -layoutConfig.cellSize,
    };
  }

  const column = index % layoutConfig.columns;
  const row = Math.floor(index / layoutConfig.columns);

  const x = layoutConfig.offsetX + column * layoutConfig.cellSize;
  const y = layoutConfig.offsetY + row * layoutConfig.cellSize;

  return {
    x,
    y,
  };
};
