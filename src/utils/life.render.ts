/**
 * 
 * LIFE TIMELINE RENDER CONFIG BUILDER
 * 
 * This file is responsible for transforming user-controlled configuration
 * (UserConfig) into renderer-ready runtime state (RenderConfig).
 *
 * The Canvas rendering engine must NOT directly depend on UserConfig because:
 * - UserConfig represents persistence-layer input (stored in localStorage)
 * - It may contain user preferences that require runtime resolution
 *
 * Instead, this builder produces a RenderConfig object which serves as the
 * single contract between domain logic and the rendering layer.
 *
 * RESPONSIBILITIES:
 * 
 * - Derive total timeline scope (totalMonths) from life expectancy
 * - Compute fully lived life-months from DOB
 * - Compute fractional progress of the current life-month
 * - Resolve ThemePreference → ThemeMode at runtime
 * - Pass through renderer-relevant user selections (message, shape)
 *
 * 
 * THEME RESOLUTION:
 * 
 * UserConfig stores a ThemePreference:
 *     "light" | "dark" | "system"
 *
 * If "system" is selected, the builder dynamically resolves the active
 * ThemeMode using the OS-level color scheme preference via:
 *
 *     window.matchMedia('(prefers-color-scheme: dark)')
 *
 * RenderConfig MUST always contain a concrete ThemeMode:
 *     "light" | "dark"
 *
 * The renderer does not understand or handle "system" preferences.
 * 
 * DOMAIN GUARANTEES:
 * 
 * The returned RenderConfig ensures:
 * - totalMonths ≥ 0
 * - fullMonthsLived ≥ 0
 * - currentMonthProgress ∈ [0,1]
 * - themeMode ∈ {"light", "dark"}
 *
 * This guarantees the Canvas renderer receives safe, deterministic input.
 *
 * NOTE:
 * 
 * This builder performs pure computation and runtime resolution only.
 * It must NOT:
 * - persist data
 * - listen to system events
 * - access DOM layout (width/height)
 * - trigger redraws
 *
 * Application-level controllers are responsible for invoking this builder
 * when user configuration or environment state (e.g. system theme) changes.
 * 
 */

import type {
  RenderConfig,
  ThemeMode,
  ThemePreference,
  UserConfig,
} from '../types/life.types.ts'
import { getFullMonthsLived, getCurrentMonthProgress } from './life.time.ts'

function resolveTheme(themePreference: ThemePreference): ThemeMode {
  if (themePreference === 'light') {
    return 'light'
  } else if (themePreference === 'dark') {
    return 'dark'
  } else {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }
}

export const buildRenderConfig = (userConfig: UserConfig): RenderConfig => {
  const dob = userConfig.dob
  const expectancy = userConfig.expectancy
  const message = userConfig.message
  const themePreference = userConfig.theme
  const shape = userConfig.shape

  const totalMonths = expectancy * 12
  const fullMonthsLived = getFullMonthsLived(dob)
  const currentMonthProgress = getCurrentMonthProgress(dob)

  const themeMode: ThemeMode = resolveTheme(themePreference)

  const renderConfig: RenderConfig = {
    totalMonths: totalMonths,
    fullMonthsLived: fullMonthsLived,
    currentMonthProgress: currentMonthProgress,
    themeMode: themeMode,
    message: message,
    shape: shape,
  }

  return renderConfig;
}
