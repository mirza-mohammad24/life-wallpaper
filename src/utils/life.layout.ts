/**
 *
 * LIFE TIMELINE GRID LAYOUT ENGINE
 *
 * This file is responsible for translating the user's total life duration
 * (expressed as the number of life-months) into a spatial grid layout that
 * can be rendered on the screen.
 *
 * The goal is to map:
 *
 *     totalMonths (timeline domain)
 *             ⬇️
 *     screen resolution (viewport domain)
 *             ⬇️
 *     centered grid geometry (rendering domain)
 *
 * into a layout that:
 * - fills most of the screen area
 * - remains visually centered
 * - maintains continuous life progression
 * - adapts dynamically to any screen resolution
 *
 * DESIGN PRINCIPLE:
 *
 * The life timeline should act as a focal visual element rather than occupying
 * the entire screen edge-to-edge.
 *
 * Therefore, a safe drawing region is computed by introducing proportional
 * padding around the viewport:
 *
 *     usableWidth  = width  - (2 * horizontalPadding)
 *     usableHeight = height - (2 * verticalPadding)
 *
 * The grid is then computed within this usable region to maintain:
 * - visual breathing space
 * - balanced composition
 * - central alignment
 *
 *
 * GRID COMPUTATION STRATEGY:
 *
 * Given:
 *     totalMonths
 *     usableWidth
 *     usableHeight
 *
 * The grid dimensions are determined such that:
 *
 *     rows * columns >= totalMonths
 *
 * Rows are estimated using:
 *
 *     rows = sqrt( totalMonths * usableHeight / usableWidth )
 *
 * The resulting value is:
 * - floored to ensure integer row count
 * - clamped to a minimum of 1 for safety
 *
 * Columns are then computed as:
 *
 *     columns = ceil(totalMonths / rows)
 *
 * This guarantees that the entire life timeline fits within the grid.
 *
 * CELL DIMENSIONS:
 *
 * Individual cell size is derived from available space:
 *
 *     cellWidth  = usableWidth  / columns
 *     cellHeight = usableHeight / rows
 *
 *     cellSize = min(cellWidth, cellHeight)
 *
 * Using the minimum ensures that:
 * - cells remain square
 * - grid fits entirely within the usable region
 *
 * GRID CENTERING:
 *
 * The computed grid may not occupy the full viewport.
 * To center it visually, offset values are calculated:
 *
 *     offsetX = (width  - columns * cellSize) / 2
 *     offsetY = (height - rows    * cellSize) / 2
 *
 * These offsets represent the top-left starting coordinate from which
 * the grid should be drawn on the Canvas.
 *
 * Final cell position is computed as:
 *
 *     x = offsetX + columnIndex * cellSize
 *     y = offsetY + rowIndex    * cellSize
 *
 * OUTPUT:
 *
 * Returns:
 * - rows      → number of grid rows
 * - columns   → number of grid columns
 * - cellSize  → side length of each square cell
 * - offsetX   → horizontal centering offset
 * - offsetY   → vertical centering offset
 *
 * This layout data is consumed by the Canvas rendering engine.
 *
 * NOTE:
 *
 * This function performs layout computation only.
 * It must NOT:
 * - access DOM or Canvas APIs
 * - perform drawing
 * - persist state
 * - compute temporal values
 *
 * It strictly adapts timeline size to viewport geometry.
 */

interface returnVal {
  rows: number
  columns: number
  cellSize: number
  offsetX: number
  offsetY: number
}

/**
 * Function to calculate the layout of the grid
 * @param {number} totalMonths provide the totalMonths
 * @param {number} width provide the viewport width
 * @param {number} height provide the viewport height
 * @returns {returnVal} returns number of rows, columns, cellSize, offsetX, offsetY
 */
export const computeGridLayout = (
  totalMonths: number,
  width: number,
  height: number,
): returnVal => {
  const horizontalPadding = 0.1 * width //10% of width
  const verticalPadding = 0.1 * height //10% of height

  const usableWidth = width - 2 * horizontalPadding
  const usableHeight = height - 2 * verticalPadding

  const rows = Math.max(
    Math.floor(Math.sqrt((totalMonths * usableHeight) / usableWidth)),
    1,
  )

  const columns = Math.ceil(totalMonths / rows)

  const cellWidth = usableWidth / columns
  const cellHeight = usableHeight / rows

  const cellSize = Math.min(cellWidth, cellHeight)

  const offsetX = (width - columns * cellSize) / 2
  const offsetY = (height - rows * cellSize) / 2

  return {
    rows,
    columns,
    cellSize,
    offsetX,
    offsetY,
  }
}
