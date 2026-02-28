/**
 * LIFE TIMELINE MASTER CONTROLLER
 *
 * This file serves as the root of the application. It is the single source of truth
 * for user configuration and the central hub that connects the React declarative UI
 * with the HTML5 Canvas imperative engine.
 *
 * ARCHITECTURAL RESPONSIBILITIES:
 * 1. State Management: Initializes the app with data from localStorage.
 * 2. Environment Adapters: Handles third-party event hooks (e.g., Lively Wallpaper bindings).
 * 3. Data Error Boundary: Intercepts and corrects corrupted data (e.g., invalid dates) globally.
 * 4. Render Config Derivation: Transforms UserConfig into RenderConfig on the fly.
 * 5. Theme Orchestration: Listens to OS-level theme changes if 'system' is selected,
 * and applies the Tailwind `.dark` class to the absolute root of the DOM.
 * 6. Prop Distribution: Passes exact, narrow props to child components to minimize
 * unnecessary re-renders.
 */
import { useState, useEffect } from 'react';
import type { UserConfig, ThemePreference, Shape } from './types/life.types.ts';

import { loadConfig, saveConfig } from './config/life.config.ts';
import { buildRenderConfig } from './utils/life.render.ts';

import LifeCanvas from './components/LifeCanvas.tsx';
import SettingsOverlay from './components/SettingsOverlay.tsx';
import CountdownTimer from './components/CountdownTimer.tsx';
import PersonalMessage from './components/PersonalMessage.tsx';



// ENVIRONMENT CHECK: Determine if the app is running inside the Lively Wallpaper engine
const isLively = import.meta.env.MODE === 'lively';

export default function App() {
  // Initialize State from Persistence Layer
  const [userConfig, setUserConfig] = useState<UserConfig>(loadConfig());

  // A dummy state to force a React re-render when the OS theme changes
  const [, setSystemThemeTick] = useState(0);

  // System Theme Listener (Browser Extension Only)
  useEffect(() => {
    // Only listen to OS changes if the user specifically requested "system" theme
    if (userConfig.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setSystemThemeTick((tick) => tick + 1);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [userConfig.theme]);

  // Lively Wallpaper External Input Listener
  useEffect(() => {
    // If this is the browser extension build we do nothing here.
    if (!isLively) return;

    // Attach listener to global window object so Lively's C# engine can inject data
    window.livelyPropertyListener = (name: string, val: string | number) => {
      setUserConfig((prev) => {
        const updatedConfig = { ...prev };

        switch (name) {
          case 'dob':
            if (typeof val === 'string') {
              // Raw string is accepted here; validation occurs in the render cycle below
              updatedConfig.dob = val;
            }
            break;
          case 'expectancy': {
            const exp = Number(val);
            if (!isNaN(exp)) {
              updatedConfig.expectancy = Math.max(1, Math.min(150, exp));
            }
            break;
          }
          case 'message':
            if (typeof val === 'string') {
              updatedConfig.message = val.substring(0, 72);
            }
            break;
          case 'theme': {
            // 0 for Light, 1 for Dark (System Auto disabled for Lively due to lively engine limits)
            const themeIndex = Number(val);
            if (themeIndex === 0 || themeIndex === 1) {
              updatedConfig.theme = ['light', 'dark'][
                themeIndex
              ] as ThemePreference;
            }
            break;
          }
          case 'shape': {
            const shapeIndex = Number(val);
            if (shapeIndex >= 0 && shapeIndex <= 2) {
              updatedConfig.shape = ['square', 'circle', 'heart'][
                shapeIndex
              ] as Shape;
            }
            break;
          }
        }

        // Persist Lively changes to localStorage for continuity across restarts
        saveConfig(updatedConfig);
        return updatedConfig;
      });
    };

    return () => {
      delete window.livelyPropertyListener;
    };
  }, []);

  // CENTRALIZED DATA ERROR BOUNDARY
  // Lively's UI allows arbitrary text injection. We must intercept invalid dates here.
  // Try to parse the current date from the state
  const parsedDate = new Date(`${userConfig.dob}T00:00:00`);
  const isInvalidDate = isNaN(parsedDate.getTime());

  // If it's invalid silently fall back to a safe date for calculations
  const safeDob = isInvalidDate ? '1995-01-01' : userConfig.dob;

  // Inject the safe date into the configuration so the Canvas Math NEVER crashes
  const safeConfig = { ...userConfig, dob: safeDob };

  // Derive Runtime Configuration using the safe data
  const renderConfig = buildRenderConfig(safeConfig);
  const isDark = renderConfig.themeMode === 'dark';

  // React UI Update Handler (Settings Menu) (only for browser extension)
  const handleConfigUpdate = (newConfig: UserConfig) => {
    setUserConfig(newConfig);
    saveConfig(newConfig);
  };

  return (
    // The outermost wrapper controls the global Tailwind theme.
    // We toggle the 'dark' class here, and the rest of the app inherits it.
    <div
      className={`relative w-screen h-screen overflow-hidden transition-colors duration-500 ${
        isDark ? 'dark bg-slate-950' : 'bg-slate-50'
      }`}
    >
      {/*  LAYER 1: CANVAS ENGINE (BACKGROUND) */}
      {/* The canvas component handles its own z-index (sits as the background) and full-screen sizing */}
      <LifeCanvas renderConfig={renderConfig} />

      {/*  LAYER 2: REACT UI (FOREGROUND)  */}
      {/* The react layer sits on top of background (canvas layer)*/}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/*  THE ON-SCREEN WARNING BANNER */}
        {/*Conditional Render (will only happen in lively build)  */}
        {isLively && isInvalidDate && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-red-500/10 backdrop-blur-xl border border-red-500/20 py-3 px-6 rounded-2xl shadow-[0_8px_32px_rgba(220,38,38,0.15)] z-50 flex items-center justify-center gap-3 transition-all duration-500">
            {/* Warning Triangle Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 shrink-0 text-red-400"
            >
              <path
                fillRule="evenodd"
                d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                clipRule="evenodd"
              />
            </svg>

            <span className="font-medium text-sm md:text-base tracking-wide text-red-100 drop-shadow-sm">
              Invalid Date Format. Falling back to default: 1995-01-01 . Please
              update the DOB in correct format (YYYY-MM-DD).
            </span>
          </div>
        )}

        {/*Conditional Render of Settings Button & Drawer on basis of build mode.
           If it is getting rendered it Must re-enable pointer events */}
        {!isLively && (
          <div className="pointer-events-auto">
            <SettingsOverlay
              currentConfig={userConfig}
              onSave={handleConfigUpdate}
            />
          </div>
        )}

        {/* Central High-Performance Timer */}
        <CountdownTimer
          dob={safeConfig.dob}
          expectancy={userConfig.expectancy}
        />

        {/* Bottom Message Banner */}
        <PersonalMessage message={renderConfig.message} />
      </div>
    </div>
  );
}
