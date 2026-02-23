/**
 * This file has only 3 responsibilities(our persistence layer):
 * -load userConfig from localStorage
 * -save userConfig to localStorage
 * -fallback to defaultConfig() if nothing exists in the localStorage
 */

import type {
  Shape,
  ThemePreference,
  UserConfig,
} from '../types/life.types.ts';
import { defaultConfig } from '../types/life.types.ts';

const LOCAL_STORAGE_KEY = 'life_timeline_config';
const VALID_THEMES_PREFERENCES = ['light', 'dark', 'system'] as const;
const VALID_SHAPES = ['square', 'circle', 'heart'] as const;

//Type Predicates implementation with help of Type Guards
/**
 * Type Guard: Validates if an unknown value is a supported Shape.
 * If true, narrows the type from 'unknown' to 'Shape' for the compiler.
 */
const isShape = (value: unknown): value is Shape => {
  return VALID_SHAPES.includes(value as Shape);
};

/**
 * Type Guard: Validates if an unknown value is a supported ThemePreference.
 * If true, narrows the type from 'unknown' to 'ThemePreference' for the compiler.
 */
const isThemePreference = (value: unknown): value is ThemePreference => {
  return VALID_THEMES_PREFERENCES.includes(value as ThemePreference);
};

/**
 * Safely retrieves and parses the persisted userConfig from localStorage.
 * Falls back to defaultConfig if data is missing, corrupted or incomplete.
 * @returns {UserConfig} A guaranteed valid configuration object.
 */
export const loadConfig = (): UserConfig => {
  try {
    const storedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);

    if (!storedConfig) {
      throw new Error('localStorage returned null or empty string');
    }

    const parsedData: unknown = JSON.parse(storedConfig);

    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('The UserConfig in localStorage is corrupt');
    }

    /**
     * further narrow it down to a safeObject that has keys as strings and the values are
     *  still unknown; We will check the values further below with typeof and type guards.
     */
    const safeObject: Record<string, unknown> = { ...parsedData };

    const safeToReturnConfig: UserConfig = {
      dob:
        typeof safeObject.dob === 'string' ? safeObject.dob : defaultConfig.dob,

      expectancy:
        typeof safeObject.expectancy === 'number'
          ? safeObject.expectancy
          : defaultConfig.expectancy,

      message:
        typeof safeObject.message === 'string'
          ? safeObject.message
          : defaultConfig.message,

      theme: isThemePreference(safeObject.theme)
        ? safeObject.theme
        : defaultConfig.theme,

      shape: isShape(safeObject.shape) ? safeObject.shape : defaultConfig.shape,
    };

    return safeToReturnConfig;
  } catch (error) {
    console.error(
      'Failed to retrieve data from localStorage returning the defaultConfig.',
      error,
    );

    //do not return reference of original defaultConfig return a copy to prevent undesired modification
    return { ...defaultConfig };
  }
};

/**
 * Persists the current UserConfig to localStorage
 * @param {UserConfig} config -The configuration to save
 */
export const saveConfig = (config: UserConfig): void => {
  try {
    const dataToWrite = JSON.stringify(config);

    //may throw QuotaExceededError or SecurityError
    localStorage.setItem(LOCAL_STORAGE_KEY, dataToWrite);
  } catch (error) {
    console.error(
      'Saving failed. Continuing to run the app on previous Configuration',
      error,
    );
  }
};
