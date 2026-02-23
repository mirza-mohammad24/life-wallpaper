/**
 * LIFE TIMELINE PERSONAL MESSAGE COMPONENT
 *
 * A simple declarative UI component that displays the user's custom
 * motivational message or quote over the wallpaper.
 *
 * ARCHITECTURAL DESIGN:
 * - Positioned absolutely near the bottom to avoid interfering with the
 * central timer layout.
 * - Uses pointer-events-none so it doesn't accidentally block clicks
 * if the user interacts with the desktop background.
 * - Respects the global Tailwind dark mode state.
 */

interface PersonalMessageProps {
  /**
   * The custom message string derived from the current RenderConfig.
   */
  message: string;
}

export default function PersonalMessage({ message }: PersonalMessageProps) {
  // Guard against rendering empty DOM elements if the user deletes their message
  if (!message || message.trim() === '') {
    return null;
  }

  return (
    <div className="absolute bottom-16 left-0 w-full flex justify-center text-center px-6 pointer-events-none select-none">
      <p className="text-xl md:text-2xl font-light tracking-wide text-slate-700 dark:text-white/70 drop-shadow-sm max-w-4xl">
        {message}
      </p>
    </div>
  );
}
