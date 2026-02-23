/**
 * LIFE TIMELINE MASTER CONTROLLER
 *
 * This file serves as the root of the application. It is the single source of truth
 * for user configuration and the central hub that connects the React declarative UI
 * with the HTML5 Canvas imperative engine.
 *
 * ARCHITECTURAL RESPONSIBILITIES:
 * 1. State Management: Initializes the app with data from localStorage.
 * 2. Render Config Derivation: Transforms UserConfig into RenderConfig on the fly.
 * 3. Theme Orchestration: Listens to OS-level theme changes if 'system' is selected,
 * and applies the Tailwind `.dark` class to the absolute root of the DOM.
 * 4. Prop Distribution: Passes exact, narrow props to child components to minimize
 * unnecessary re-renders.
 */

import { useState, useEffect } from 'react';
import type { UserConfig } from './types/life.types.ts';

import { loadConfig, saveConfig } from './config/life.config.ts';
import { buildRenderConfig } from './utils/life.render.ts';

import LifeCanvas from './components/LifeCanvas.tsx';
import SettingsOverlay from './components/SettingsOverlay.tsx';
import CountdownTimer from './components/CountdownTimer.tsx';
import PersonalMessage from './components/PersonalMessage.tsx';

export default function App() {
  // 1. Initialize State from Persistence Layer
  const [userConfig, setUserConfig] = useState<UserConfig>(loadConfig());

  // A dummy state to force a React re-render when the OS theme changes
  const [, setSystemThemeTick] = useState(0);

  // 2. System Theme Listener
  useEffect(() => {
    // Only listen to OS changes if the user specifically requested "system" theme
    if (userConfig.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      setSystemThemeTick((tick) => tick + 1);
    };

    // Modern browsers support addEventListener on MediaQueryList
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [userConfig.theme]);

  // 3. Derive Runtime Configuration
  // This runs whenever userConfig changes OR when systemThemeTick forces a re-render
  const renderConfig = buildRenderConfig(userConfig);
  const isDark = renderConfig.themeMode === 'dark';

  // 4. Update Handler
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
      {/* --- LAYER 1: CANVAS ENGINE (BACKGROUND) --- */}
      {/* The canvas component handles its own z-index (-z-10) and full-screen sizing */}
      <LifeCanvas renderConfig={renderConfig} />

      {/* --- LAYER 2: REACT UI (FOREGROUND) --- */}
      {/* pointer-events-none ensures the invisible wrapper doesn't block 
        interaction with the desktop behind the Lively Wallpaper. 
      */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Settings Button & Drawer (Must re-enable pointer events) */}
        <div className="pointer-events-auto">
          <SettingsOverlay
            currentConfig={userConfig}
            onSave={handleConfigUpdate}
          />
        </div>

        {/* Central High-Performance Timer */}
        <CountdownTimer
          dob={userConfig.dob}
          expectancy={userConfig.expectancy}
        />

        {/* Bottom Message Banner */}
        <PersonalMessage message={renderConfig.message} />
      </div>
    </div>
  );
}
