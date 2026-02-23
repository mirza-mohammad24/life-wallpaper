/**
 * LIFE TIMELINE MASTER RENDERER
 *
 * This file acts as the primary orchestrator for the canvas rendering engine.
 * It bridges the pure mathematical domain (Layout, Age, Positioning) with
 * the visual domain (Shapes, Colors, Canvas Context).
 *
 * ARCHITECTURAL FLOW:
 * 1. Wipes the canvas clean to prevent ghosting across re-renders or resizes.
 * 2. Computes the optimal spatial grid based on the current viewport dimensions.
 * 3. Iterates through the entire sequential lifecycle (0 to totalMonths).
 * 4. For each month, resolves its exact (x, y) spatial coordinate and semantic state.
 * 5. Delegates the actual pixel-drawing to the specific shape renderer requested by the user.
 *
 * This function is designed to be called rapidly (e.g., inside a requestAnimationFrame
 * or a ResizeObserver callback) and relies on the underlying O(1) math functions
 * to maintain high performance without dropping frames.
 */

import type { RenderConfig } from '../types/life.types';
import { drawSquareCell, drawCircleCell, drawHeartCell } from './life.draw.ts';
import { getCellPosition } from '../utils/life.position.ts';
import { getCellState } from '../utils/life.cells.ts';
import { computeGridLayout } from '../utils/life.layout';

/**
 * Executes a complete render cycle of the life timeline onto the provided Canvas.
 *
 * @param {CanvasRenderingContext2D} ctx - The active 2D rendering context of the target canvas.
 * @param {RenderConfig} renderConfig - The derived runtime configuration containing timeline metrics and user preferences.
 * @param {number} canvasWidth - The current physical pixel width of the canvas.
 * @param {number} canvasHeight - The current physical pixel height of the canvas.
 * @returns {void} This function performs side-effects (drawing to the canvas) and returns nothing.
 */
export const renderLifeTimeline = (
  ctx: CanvasRenderingContext2D,
  renderConfig: RenderConfig,
  canvasWidth: number,
  canvasHeight: number,
): void => {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const totalMonths = renderConfig.totalMonths;
  const fullMonthsLived = renderConfig.fullMonthsLived;
  const theme = renderConfig.themeMode;
  const shape = renderConfig.shape;
  const currentMonthProgress = renderConfig.currentMonthProgress;

  const layoutConfig = computeGridLayout(
    totalMonths,
    canvasWidth,
    canvasHeight,
  );

  const cellSize = layoutConfig.cellSize;

  for (let index = 0; index <= totalMonths - 1; ++index) {
    let progress = 1;

    const cellPosition = getCellPosition(index, layoutConfig);
    const cellState = getCellState(index, renderConfig);

    if (cellState === 'present') {
      progress = currentMonthProgress; //for others it is 1 only future will ignore it completely so no issue there
    }

    switch (shape) {
      case 'square':
        drawSquareCell(
          ctx,
          cellPosition,
          cellSize,
          cellState,
          progress,
          index,
          totalMonths,
          fullMonthsLived,
          theme,
        );
        break;
      case 'circle':
        drawCircleCell(
          ctx,
          cellPosition,
          cellSize,
          cellState,
          progress,
          index,
          totalMonths,
          fullMonthsLived,
          theme,
        );
        break;
      case 'heart':
        drawHeartCell(
          ctx,
          cellPosition,
          cellSize,
          cellState,
          progress,
          index,
          totalMonths,
          fullMonthsLived,
          theme,
        );
        break;
    }
  }
};
