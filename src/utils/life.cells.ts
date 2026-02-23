/**
 * LIFE TIMELINE CELL STATE MAPPING LAYER
 *
 * This file is responsible for classifying each life-month cell into a
 * semantic rendering state based on the user's elapsed lifetime.
 *
 * The Canvas renderer does not operate directly on temporal values such as:
 * - fullMonthsLived
 * - currentMonthProgress
 *
 * Instead, it requires each cell to be mapped to a visual state that
 * determines how it should be drawn.
 *
 * CELL CLASSIFICATION MODEL:
 *
 * Each life-month cell (identified by its index in the timeline grid)
 * is categorized into one of the following states:
 *
 * - "past"     → fully completed life-month
 * - "present"  → current life-month (partially filled)
 * - "future"   → not yet lived life-month
 * - "empty"    → out-of-bounds safety fallback
 *
 * Classification is performed using:
 *     RenderConfig.fullMonthsLived
 *     RenderConfig.totalMonths
 *
 * RENDERING IMPLICATIONS:
 *
 * The returned CellState is used by the Canvas layer to determine:
 *
 * - fill color (past vs future)
 * - highlight behavior (present cell)
 * - partial fill logic (using currentMonthProgress)
 * - outline or inactive styling
 *
 * This abstraction allows the renderer to remain decoupled from
 * domain-specific temporal calculations.
 *
 * NOTE:
 * This layer performs classification only.
 * It must NOT:
 * - compute time-based values
 * - perform layout calculations
 * - access DOM or canvas APIs
 * - persist state
 *
 * It serves purely as a semantic adapter between:
 *     RenderConfig (timeline state)
 *                 ⬇️
 *         CellState mapping
 *                 ⬇️
 *        Canvas rendering logic
 */

import type { CellState, RenderConfig } from '../types/life.types.ts';

/**
 * function to return the cellState for each cell corresponding to its index
 * @param {number} index provide the index of the cell
 * @param {RenderConfig} renderConfig provide the renderConfig for the user
 * @returns {CellState} corresponding CellState : 'past', 'present', 'future', 'empty'
 */
export const getCellState = (
  index: number,
  renderConfig: RenderConfig,
): CellState => {
  const fullMonthsLived = renderConfig.fullMonthsLived;
  const totalMonths = renderConfig.totalMonths;

  if (index >= totalMonths || index < 0) return 'empty';

  if (index < fullMonthsLived) {
    return 'past';
  } else if (index === fullMonthsLived) {
    return 'present';
  } else {
    return 'future';
  }
};
