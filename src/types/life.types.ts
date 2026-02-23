/**
 * LIFE TIMELINE DOMAIN TYPES
 *
 * This file defines the core data contracts used across the Life Timeline wallpaper application.
 *
 * The application follows a 3-stage data transformation pipeline:
 *
 *      User Input (DOB, expectancy, theme, message)
 *      ⬇️
 *      UserConfig (persisted in localStorage)
 *      ⬇️
 *      Utils Layer (derives temporal runtime values)
 *      ⬇️
 *      RenderConfig (computed renderer contract)
 *      ⬇️
 *      Canvas REndering Engine (draws life timeline)
 *
 * IMPORTANT ARCHITECTURAL RULE:
 * -UserConfig contains ONLY user-controlled input values.
 * -RenderConfig contains ONLY derived runtime values.
 * -Derived values MUST NEVER be stored in localStorage.
 *
 * This separation ensures:
 * -persistence safety
 * -rendering determinism
 * -architectural clarity
 *
 * This file serves as the shared contract between:
 * -React UI Layer
 * -Persistence Layer (localStorage)
 * -Utility Layer (time calculations)
 * -Canvas Rendering Engine
 *
 */

/**
 * Defines the geometric shape used to render each life-month cell.
 *
 * This affects how the Canvas renderer draws individual timeline units.
 * React layer selects this value via user configuration.
 */
export type Shape = 'square' | 'circle' | 'heart'

/**
 * Defines the active theme preference selected by the user.
 *
 * This determines the color palette used by the Canvas renderer
 * during timeline drawing.
 */
export type ThemePreference = 'light' | 'dark' | 'system'

/**
 * Defines the active theme mode.
 *
 * Its value is dynamically resolved on the basis of user's ThemePreference
 */
export type ThemeMode = 'light' | 'dark'

/**
 * Semantic classification of a single life-month cell.
 *
 * Used by the Canvas rendering engine to determine:
 * - fill color
 * - highlight behavior
 * - partial fill logic
 *
 * States:
 * - past: fully lived month
 * - present: current month (partially filled)
 * - future: not yet lived
 * - empty: optional safety fallback
 */
export type CellState = 'past' | 'present' | 'future' | 'empty'

/**
 * Position of the cell inside the grid
 * 
 * Used by the Canvas rendering engine to determine:
 * -x co ordinate of the cell
 * -y co ordinate of the cell
 * 
 * This object is:
 * -produced by the utils layer
 * -consumed by the Canvas renderer
 */
export interface CellPosition {
  x: number
  y: number
}

/**
 * USER CONFIGURATION MODEL
 *
 * Represents user-controlled input values.
 *
 * This object is:
 * -collected via React UI
 * -validated in utils layers
 * -persisted in localStorage
 *
 * MUST NOT contain derived values such as:
 * -totalMonths
 * -fullMonthsLived
 * -currentMonthProgress
 *
 * DOB is stored as an ISO string (YYYY-MM-DD) to ensure
 * JSON serialization compatibility with localStorage.
 */
export interface UserConfig {
  /**
   * User's date of birth in ISO format (YYY-MM-DD).
   * @example: "2004-12-19"
   * @default: "1995-01-01"
   */
  readonly dob: string

  /**
   * User's life expectancy
   * @default: 80
   */
  readonly expectancy: number

  /**
   * User's personal message
   * @default: "Your time, your story."
   */
  readonly message: string

  /**
   * User's choice of theme
   * @default: "light"
   */
  readonly theme: ThemePreference

  /**
   * User's choice of shape
   * @default: "square"
   */
  readonly shape: Shape
}

/**
 * RENDER CONFIGURATION MODEL
 *
 * Represents derived runtime values computed from UserConfig.
 *
 * This object is:
 * -produced by the utils layer
 * -consumed by the Canvas renderer
 *
 * MUST NEVER be persisted in localStorage
 */
export interface RenderConfig {
  /**
   * Total number of life months to render.
   * Computed as: expectancy * 12
   */
  totalMonths: number

  /**
   * Number of fully completed months lived.
   */
  fullMonthsLived: number

  /**
   * Fractional progress withing the current month.
   * Must always be within range [0, 1].
   */
  currentMonthProgress: number

  /**
   * Active theme mode used during rendering.
   */
  themeMode: ThemeMode

  /**
   * Personal message of user
   */

  message: string

  /**
   * Shape used to render timeline cells.
   */
  shape: Shape
}

/**
 * GRID LAYOUT CONFIGURATION MODEL
 *
 * Represents the spatial geometry of the life timeline grid as it should be
 * rendered on the screen.
 *
 * This configuration is produced by the layout computation layer
 * (life.layout.ts) after adapting the total life duration to the available
 * viewport dimensions.
 *
 * It defines:
 * - how many rows and columns the life grid contains
 * - the pixel size of each life-month cell
 * - the positional offset required to visually center the grid
 *
 * These values are consumed by:
 * - position mapping layer (life.position.ts)
 * - canvas rendering engine (drawing logic)
 *
 * NOTE:
 *
 * LayoutConfig represents geometry only.
 * It must NOT contain:
 * - time-derived values
 * - user preferences
 * - rendering states
 *
 * It is strictly a viewport-adapted spatial mapping of the timeline.
 */
export interface LayoutConfig {
  /**
   *  Number of grid rows required to represent the full life timeline.
   */
  rows: number

  /**
   * Number of grid columns required such that:
   * rows * columns >= totalMonths
   */
  columns: number

  /**
   * Side length (in pixels) of each square grid cell allocated for a
   * life-month unit.
   */
  cellSize: number

  /**
   * Horizontal offset (in pixels) from the left edge of the viewport
   * indicating where the grid should begin drawing in order to remain
   * visually centered.
   */
  offsetX: number

  /**
   * Vertical offset (in pixels) from the top edge of the viewport
   * indicating where the grid should begin drawing in order to remain
   * visually centered.
   */
  offsetY: number
}

/**
 * Default configuration used when:
 * - Application runs for the first time
 * - No existing user config is found in localStorage
 *
 * Represents a neutral, believable anonymous life timeline
 * for initial visualization.
 */
export const defaultConfig: UserConfig = {
  dob: '1995-01-01',
  expectancy: 80,
  message: 'Your time, your story.',
  theme: 'light',
  shape: 'square',
}
