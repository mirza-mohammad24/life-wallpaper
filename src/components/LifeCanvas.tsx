/**
 * LIFE TIMELINE CANVAS COMPONENT
 * * This file serves as the strict boundary between the React (Declarative) world
 * and the HTML5 Canvas (Imperative) world.
 * * ARCHITECTURAL RESPONSIBILITIES:
 * 1. DOM Mounting: Safely injecting the `<canvas>` element into the browser background.
 * 2. High-DPI Scaling: Handling `devicePixelRatio` to prevent blurry rendering on Retina/4K displays.
 * 3. Lifecycle Management: Hooking into window resize events and cleaning them up to prevent memory leaks.
 * 4. Engine Delegation: Passing the configured Canvas context to the `renderLifeTimeline` math engine.
 */

import type { RenderConfig } from '../types/life.types.ts';
import { useEffect, useRef } from 'react';
import { renderLifeTimeline } from '../canvas/life.renderLoop.ts';

interface LifeCanvasProps {
  renderConfig: RenderConfig;
}

/**
 * Prepares the canvas for a crisp, pixel-perfect render and triggers the drawing engine.
 * This function handles the complex math required for High-DPI (Retina) displays.
 * It artificially inflates the internal pixel count of the canvas while using CSS
 * to compress its physical display size, resulting in razor-sharp graphics.
 * @param {HTMLCanvasElement} canvas - The physical DOM element to be resized.
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context to be scaled.
 * @param {RenderConfig} renderConfig - The user's timeline data and visual preferences.
 * @returns {void}
 */
const repaintCanvas = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  renderConfig: RenderConfig,
): void => {
  /*To improve render quality (on modern systems) or else the function can be simple.  */

  // 1. Get the current screen pixel density (fallback to 1 for standard monitors)
  const dpr = window.devicePixelRatio || 1;

  // 2. Get the physical CSS dimensions of the user's viewport
  const cssWidth = window.innerWidth;
  const cssHeight = window.innerHeight;

  // 3. Set the internal bitmap resolution to match the display density
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  // 4. Force the CSS display size to fit the exact viewport
  canvas.style.width = `${cssWidth}px`;
  canvas.style.height = `${cssHeight}px`;

  // scale drawing ops back
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // 5. Scale the drawing context so the engine doesn't have to multiply by DPR manually
  renderLifeTimeline(ctx, renderConfig, cssWidth, cssHeight);
};

/**
 * The React Component that mounts and manages the life timeline canvas.
 * * It strictly acts as a background wallpaper (-z-10) and automatically
 * triggers re-renders whenever the window resizes or the user's config changes.
 * * @param {LifeCanvasProps} props - The component props containing the render configuration.
 */
export default function LifeCanvas({ renderConfig }: LifeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current; //get the current canvas reference
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    //do the initial render and attach the event listener
    repaintCanvas(canvas, ctx, renderConfig);

    //event handler if the window resizes. Only works if the window resizes.
    const handleWindowResize = () => {
      //we have to repaint it entirely
      repaintCanvas(canvas, ctx, renderConfig);
    };

    //Add the event listener
    window.addEventListener('resize', handleWindowResize);

    //clean up
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [renderConfig]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-screen h-screen z-10"
    />
  );
}
