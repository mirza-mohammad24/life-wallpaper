/**
 * LIFE TIMELINE SETTINGS OVERLAY COMPONENT
 *
 * This file handles the declarative UI for user configuration. It acts as the
 * input boundary for the application, collecting user preferences and passing
 * them up to the central controller (`App.tsx`).
 *
 * ARCHITECTURAL RESPONSIBILITIES:
 * 1. State Isolation: Maintains local state (`formData`) during editing so that
 * the canvas does not stutter or re-render on every single keystroke.
 * 2. Data Contract: Ensures all collected data strictly conforms to the `UserConfig`
 * interface before passing it up the chain.
 * 3. Theme Awareness: Utilizes Tailwind's `dark:` variants to seamlessly blend
 * with the dynamic global theme controlled by `App.tsx`.
 * 4. Unobtrusive UI: Implements a sliding drawer pattern (backdrop-blur) to
 * ensure the settings menu doesn't permanently obscure the wallpaper canvas.
 */

import type { ChangeEvent, SyntheticEvent } from 'react';
import { useState } from 'react';
import type { UserConfig } from '../types/life.types.ts';

interface SettingsOverlayProps {
  /**
   * The current configuration loaded from App state / localStorage.
   * Used to initialize the form fields.
   */
  currentConfig: UserConfig;
  /**
   * Callback fired when the user commits their changes.
   * This updates App.tsx state and triggers the persistence layer.
   */
  onSave: (newConfig: UserConfig) => void;
}

export default function SettingsOverlay({
  currentConfig,
  onSave,
}: SettingsOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [formData, setFormData] = useState<UserConfig>(currentConfig);

  // Generic handler for all standard inputs
  //It has been made sure that the name of the inputs will exactly match the keys defined in interface UserConfig
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'expectancy' ? Number(value) : value,
    }));
  };

  // Submission handler
  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(formData);
    setIsOpen(false); // Close drawer on save
  };

  // Reset form to current config if user cancels/closes without saving
  const handleClose = () => {
    setFormData(currentConfig);
    setIsOpen(false);
  };

  return (
    <>
      {/* Menu Toggle Button (Cogwheel Icon)*/}
      <button
        onClick={() => setIsOpen(true)}
        className="absolute top-6 left-6 z-50 p-2 text-slate-800 dark:text-white/80 hover:text-slate-600 dark:hover:text-white transition-colors focus:outline-none cursor-pointer"
        aria-label="Open Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8"
        >
          {/* The outer gear teeth */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.99l1.005.828c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
          />
          {/* The inner circle of the gear */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      </button>

      {/* Backdrop (closes menu when clicked outside) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Sliding Drawer */}
      <div
        className={`fixed top-0 left-0 z-50 h-screen w-80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
            Configuration
          </h2>
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 flex flex-col h-[calc(100vh-80px)] overflow-y-auto"
        >
          {/* DOB Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Date of Birth
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Expectancy Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Life Expectancy (Years)
            </label>
            <input
              type="number"
              name="expectancy"
              value={formData.expectancy}
              onChange={handleChange}
              min="1"
              max="150"
              required
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Personal Message
            </label>
            <input
              type="text"
              name="message"
              value={formData.message}
              onChange={handleChange}
              maxLength={72}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Theme Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Theme Preference
            </label>
            <select
              name="theme"
              value={formData.theme}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Auto</option>
            </select>
          </div>

          {/* Shape Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Cell Shape
            </label>
            <select
              name="shape"
              value={formData.shape}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="square">Square</option>
              <option value="circle">Circle</option>
              <option value="heart">Heart</option>
            </select>
          </div>

          {/* Spacer to push button to bottom*/}
          <div className="grow"></div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            Save & Apply
          </button>
        </form>
      </div>
    </>
  );
}
