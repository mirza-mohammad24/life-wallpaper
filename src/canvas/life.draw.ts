/**
 * LIFE TIMELINE CANVAS RENDERING ENGINE
 *
 * This file serves as the "Paintbox" for the Life Timeline application.
 * It strictly encapsulates all HTML5 Canvas 2D API commands, keeping the rest
 * of the application entirely agnostic of the rendering implementation.
 *
 * RESPONSIBILITIES:
 * - Color Interpolation: Translating life progress into a smooth RGB gradient.
 * - Spatial Padding: Applying a responsive visual gap between timeline cells.
 * - Shape Drawing: Tracing paths for squares, circles, and bezier-curves (hearts).
 * - State Rendering: Handling the visual differences between:
 * -> Past (Fully filled, solid color)
 * -> Present (Partially filled via clipping masks, stroked outline)
 * -> Future (Empty, stroked outline)
 *
 * RENDERING TECHNIQUE:
 * For the 'present' (current month) state, this engine uses a Canvas Clipping Mask
 * (`ctx.clip()`). This allows a rectangular progress bar to flawlessly mask any
 * complex underlying shape (like a circle or heart) without requiring complex
 * fractional geometry calculations.
 */

import type {
  CellPosition,
  CellState,
  ThemeMode,
} from '../types/life.types.ts';

// COLOR PALETTES & MATH
type RGB = [number, number, number];

const LIGHT_THEME = {
  start: [34, 197, 94] as RGB, // Tailwind Green-500
  end: [239, 68, 68] as RGB, // Tailwind Red-500
  future: '#D1D5DB', // Tailwind Gray-300
};

const DARK_THEME = {
  start: [20, 184, 166] as RGB, // Tailwind Teal-500
  end: [245, 158, 11] as RGB, // Tailwind Amber-500
  future: '#374151', // Tailwind Gray-700
};

/**
 * Linearly interpolates between two RGB colors.
 * @param {RGB} startColor - The starting color [R, G, B]
 * @param {RGB} endColor - The ending color [R, G, B]
 * @param {number} t - The progress value between 0.0 and 1.0
 * @returns {string} A valid CSS rgb() string for the Canvas API
 */
const lerpColor = (startColor: RGB, endColor: RGB, t: number): string => {
  const safeT = Math.max(Math.min(t, 1), 0);

  const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * safeT);
  const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * safeT);
  const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * safeT);

  return `rgb(${r},${g},${b})`;
};

/**
 * Resolves the precise fill color for a specific life-month cell.
 *
 * This function handles two distinct visual states:
 * 1. Future Months: Returns a static, neutral background color to represent unlived time.
 * 2. Past/Present Months: Calculates a dynamic color using linear interpolation (Lerp).
 * The color transitions smoothly from the theme's 'start' color to its 'end' color
 * based on the cell's chronological position across the user's total life expectancy.
 *
 * @param {number} index - The chronological index of the cell being drawn (0-based).
 * @param {number} totalMonths - The total number of months in the user's life expectancy.
 * @param {number} fullMonthsLived - The number of months the user has already completed.
 * @param {ThemeMode} theme - The active rendering theme ('light' or 'dark').
 * @returns {string} A valid CSS color string (Hex or rgb()) for the Canvas API.
 */
const getCellColor = (
  index: number,
  totalMonths: number,
  fullMonthsLived: number,
  theme: ThemeMode,
): string => {
  if (index > fullMonthsLived) {
    return theme === 'light' ? LIGHT_THEME.future : DARK_THEME.future;
  }

  const t = Math.min(index / totalMonths, 1);

  if (theme === 'light') {
    return lerpColor(LIGHT_THEME.start, LIGHT_THEME.end, t);
  } else {
    return lerpColor(DARK_THEME.start, DARK_THEME.end, t);
  }
};

/**
 * Renders a square cell on the canvas, applying dynamic gap padding.
 * * @param {CanvasRenderingContext2D} ctx - The active Canvas 2D rendering context.
 * @param {CellPosition} position - The absolute (x, y) top-left grid coordinate.
 * @param {number} cellSize - The maximum bounded size of the grid cell.
 * @param {CellState} state - 'past' (filled), 'present' (filling), or 'future' (empty).
 * @param {number} progress - Fractional completion of the current month [0, 1].
 * @param {number} index - The chronological index of the cell.
 * @param {number} totalMonths - Total expected life months (used for color math).
 * @param {number} fullMonthsLived - Total fully lived months (used for state/color math).
 * @param {ThemeMode} theme - The active system or user theme mode.
 */
export const drawSquareCell = (
  ctx: CanvasRenderingContext2D,
  position: CellPosition,
  cellSize: number,
  state: CellState,
  progress: number,
  index: number,
  totalMonths: number,
  fullMonthsLived: number,
  theme: ThemeMode,
): void => {
  const gap = cellSize * 0.08;
  const drawSize = cellSize - gap;
  const drawX = position.x + gap / 2;
  const drawY = position.y + gap / 2;

  if (state === 'past') {
    //fully filled
    ctx.fillStyle = getCellColor(index, totalMonths, fullMonthsLived, theme);
    ctx.fillRect(drawX, drawY, drawSize, drawSize);
  } else if (state === 'present') {
    const fillWidth = Math.max(Math.min(drawSize * progress, drawSize), 0);

    //clip fill region (left -> right fill)
    ctx.save();
    ctx.beginPath();
    ctx.rect(drawX, drawY, fillWidth, drawSize);
    ctx.clip();

    //fill full cell (NOT fillWidth)
    ctx.fillStyle = getCellColor(index, totalMonths, fullMonthsLived, theme);

    ctx.fillRect(drawX, drawY, drawSize, drawSize);
    ctx.restore();

    //draw outline
    ctx.strokeStyle =
      theme === 'light' ? LIGHT_THEME.future : DARK_THEME.future;
    ctx.strokeRect(drawX, drawY, drawSize, drawSize);
  } else if (state === 'future') {
    ctx.strokeStyle =
      theme === 'light' ? LIGHT_THEME.future : DARK_THEME.future;
    ctx.strokeRect(drawX, drawY, drawSize, drawSize);
  }
};

/**
 * Renders a circular cell on the canvas.
 * Derives center coordinates and radius from the bounding cell size.
 *
 * @param {CanvasRenderingContext2D} ctx - The active Canvas 2D rendering context.
 * @param {CellPosition} position - The absolute (x, y) top-left grid coordinate.
 * @param {number} cellSize - The maximum bounded size of the grid cell.
 * @param {CellState} state - 'past' (filled), 'present' (filling), or 'future' (empty).
 * @param {number} progress - Fractional completion of the current month [0, 1].
 * @param {number} index - The chronological index of the cell.
 * @param {number} totalMonths - Total expected life months (used for color math).
 * @param {number} fullMonthsLived - Total fully lived months (used for state/color math).
 * @param {ThemeMode} theme - The active system or user theme mode.
 */
export const drawCircleCell = (
  ctx: CanvasRenderingContext2D,
  position: CellPosition,
  cellSize: number,
  state: CellState,
  progress: number,
  index: number,
  totalMonths: number,
  fullMonthsLived: number,
  theme: ThemeMode,
): void => {
  const gap = cellSize * 0.08;
  const drawSize = cellSize - gap;
  const drawX = position.x + gap / 2;
  const drawY = position.y + gap / 2;

  const centerX = drawX + drawSize / 2;
  const centerY = drawY + drawSize / 2;
  const radius = drawSize / 2;

  if (state === 'past') {
    //fill full circle
    ctx.fillStyle = getCellColor(index, totalMonths, fullMonthsLived, theme);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();
  } else if (state === 'present') {
    const fillWidth = Math.max(Math.min(drawSize * progress, drawSize), 0);

    ctx.save();
    ctx.beginPath();
    ctx.rect(drawX, drawY, fillWidth, drawSize);
    ctx.clip();

    ctx.fillStyle = getCellColor(index, totalMonths, fullMonthsLived, theme);

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle =
      theme === 'light' ? LIGHT_THEME.future : DARK_THEME.future;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
  } else if (state === 'future') {
    ctx.strokeStyle =
      theme === 'light' ? LIGHT_THEME.future : DARK_THEME.future;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.closePath();
    ctx.stroke();
  }
};

/**
 * Internal helper function to trace a mathematical heart shape using Bezier curves.
 * Assumes a bounding box defined by x, y, and size.
 *
 * @param {CanvasRenderingContext2D} ctx - The active Canvas context.
 * @param {number} x - The top-left X coordinate of the bounding box.
 * @param {number} y - The top-left Y coordinate of the bounding box.
 * @param {number} size - The width and height of the bounding box.
 */
const createHeartPath = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
): void => {
  ctx.beginPath();
  ctx.moveTo(x + size / 2, y);

  ctx.bezierCurveTo(x, y, x, y + size / 2, x + size / 2, y + size);

  ctx.bezierCurveTo(x + size, y + size / 2, x + size, y, x + size / 2, y);

  ctx.closePath();
};

/**
 * Renders a heart-shaped cell on the canvas utilizing Bezier Curve path.
 *
 * @param {CanvasRenderingContext2D} ctx - The active Canvas 2D rendering context.
 * @param {CellPosition} position - The absolute (x, y) top-left grid coordinate.
 * @param {number} cellSize - The maximum bounded size of the grid cell.
 * @param {CellState} state - 'past' (filled), 'present' (filling), or 'future' (empty).
 * @param {number} progress - Fractional completion of the current month [0, 1].
 * @param {number} index - The chronological index of the cell.
 * @param {number} totalMonths - Total expected life months (used for color math).
 * @param {number} fullMonthsLived - Total fully lived months (used for state/color math).
 * @param {ThemeMode} theme - The active system or user theme mode.
 */
export const drawHeartCell = (
  ctx: CanvasRenderingContext2D,
  position: CellPosition,
  cellSize: number,
  state: CellState,
  progress: number,
  index: number,
  totalMonths: number,
  fullMonthsLived: number,
  theme: ThemeMode,
): void => {
  const gap = cellSize * 0.08;
  const drawSize = cellSize - gap;
  const drawX = position.x + gap / 2;
  const drawY = position.y + gap / 2;

  if (state === 'past') {
    ctx.fillStyle = getCellColor(index, totalMonths, fullMonthsLived, theme);
    createHeartPath(ctx, drawX, drawY, drawSize);
    ctx.fill();
  } else if (state === 'present') {
    const fillWidth = Math.max(Math.min(drawSize * progress, drawSize), 0);

    ctx.save();
    ctx.beginPath();
    ctx.rect(drawX, drawY, fillWidth, drawSize);
    ctx.clip();

    ctx.fillStyle = getCellColor(index, totalMonths, fullMonthsLived, theme);
    createHeartPath(ctx, drawX, drawY, drawSize);
    ctx.fill();

    ctx.restore();

    ctx.strokeStyle =
      theme === 'light' ? LIGHT_THEME.future : DARK_THEME.future;
    createHeartPath(ctx, drawX, drawY, drawSize);
    ctx.stroke();
  } else if (state === 'future') {
    ctx.strokeStyle =
      theme === 'light' ? LIGHT_THEME.future : DARK_THEME.future;
    createHeartPath(ctx, drawX, drawY, drawSize);
    ctx.stroke();
  }
};
