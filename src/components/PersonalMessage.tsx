/**
 * LIFE TIMELINE PERSONAL MESSAGE COMPONENT
 *
 * A simple declarative UI component that displays the user's custom
 * motivational message or quote over the wallpaper.
 *
 * ARCHITECTURAL DESIGN:
 * - Positioned absolutely at the top to avoid interfering with the
 * central timer layout.
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
    <div className="absolute top-10 left-0 w-full flex justify-center text-center px-6 pointer-events-none select-none">
      <p className="text-3xl md:text-4xl lg:text-5xl font-light tracking-wide text-slate-700 dark:text-white/70 drop-shadow-md max-w-5xl">
        {message}
      </p>
    </div>
  );
}
