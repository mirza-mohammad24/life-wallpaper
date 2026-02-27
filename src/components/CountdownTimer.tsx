/**
 * LIFE TIMELINE COUNTDOWN TIMER COMPONENT
 *
 * This file is responsible for rendering the central, high-precision countdown
 * timer that visually displays the user's remaining life expectancy.
 *
 * ARCHITECTURAL DESIGN:
 *
 * This component intentionally bypasses the standard React rendering cycle
 * (i.e., `useState` and `setState`) for the clock tick.
 *
 * The reason behind this decision is:
 * Standard React state updates trigger a full re-render of the component tree.
 * Because this clock tracks milliseconds, relying on React state would cause
 * the component to re-render ~60 times per second. This would cause severe 
 * performance degradation, stuttering, and massive CPU overhead.
 *
 * The Solution:
 * 1. `useRef` is used to hold direct references to the physical DOM `<span>` elements.
 * 2. `requestAnimationFrame` creates a native, hardware-synchronized loop.
 * 3. The mathematical loop calculates the remaining time and mutates the
 * DOM directly (`ref.current.innerText = ...`), completely skipping React.
 *
 * TEMPORAL LOGIC:
 *
 * The "End Date" is calculated exactly as:
 * Date of Birth (at 00:00:00) + Life Expectancy (in years)
 *
 * The remaining time is derived by subtracting the current time (`now`)
 * from the calculated `endDate`. The math borrows time downwards
 * (from years -> months -> days, etc.) to handle varying month lengths
 * and leap years accurately.
 *
 * THEME HANDLING:
 *
 * This component relies on Tailwind CSS `dark:` modifiers. It assumes
 * the parent `<App />` component will apply the `.dark` class to the
 * `<body>` or wrapper `<div>` based on the resolved `ThemeMode`.
 */

import { useEffect, useRef } from 'react';

const pad = (num: number, size = 2) => num.toString().padStart(size, '0');

interface CountdownTimerProps {
  dob: string;
  expectancy: number;
}

export default function CountdownTimer({
  dob,
  expectancy,
}: CountdownTimerProps) {
  //required references
  const yearsRef = useRef<HTMLSpanElement | null>(null);
  const monthsRef = useRef<HTMLSpanElement | null>(null);
  const daysRef = useRef<HTMLSpanElement | null>(null);
  const hoursRef = useRef<HTMLSpanElement | null>(null);
  const minsRef = useRef<HTMLSpanElement | null>(null);
  const secsRef = useRef<HTMLSpanElement | null>(null);
  const msRef = useRef<HTMLSpanElement | null>(null);
  
  useEffect(() => {
    const birthDate = new Date(`${dob}T00:00:00`);
    const endDate = new Date(birthDate);
    endDate.setFullYear(endDate.getFullYear() + expectancy);

    //cache years months days hours and mins they will change rarely (we run this at 60 or 120Hz)
    let prevYears = '', prevMonths = '', prevDays = '', prevHours = '', prevMins = '', prevSecs = '';

    //this won't be changing
    const daysInLastMonth = new Date(
      endDate.getFullYear(),
      endDate.getMonth(),
      0,
    ).getDate();

    let animationFrameId: number;

    const updateTimer = () => {
      const now = new Date();

      //base case: The loop will stop when now >= endDate
      if (now >= endDate) {
        if (yearsRef.current) yearsRef.current.innerText = '00';
        if (monthsRef.current) monthsRef.current.innerText = '00';
        if (daysRef.current) daysRef.current.innerText = '00';
        if (hoursRef.current) hoursRef.current.innerText = '00';
        if (minsRef.current) minsRef.current.innerText = '00';
        if (secsRef.current) secsRef.current.innerText = '00';
        if (msRef.current) msRef.current.innerText = '00';
        return;
      }

      let years = endDate.getFullYear() - now.getFullYear();
      let months = endDate.getMonth() - now.getMonth();
      let days = endDate.getDate() - now.getDate();
      let hours = 0 - now.getHours();
      let mins = 0 - now.getMinutes();
      let secs = 0 - now.getSeconds();
      let ms = 0 - now.getMilliseconds();

      //resolving negatives
      if (ms < 0) {
        ms += 1000;
        secs--;
      }
      if (secs < 0) {
        secs += 60;
        mins--;
      }
      if (mins < 0) {
        mins += 60;
        hours--;
      }
      if (hours < 0) {
        hours += 24;
        days--;
      }
      if (days < 0) {
        months--;
        days += daysInLastMonth;
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      //converting ms to 2 digits
      const displayMs = Math.floor(ms / 10);

      const paddedYears = pad(years);
      const paddedMonths = pad(months);
      const paddedDays = pad(days);
      const paddedHours = pad(hours);
      const paddedMins = pad(mins);
      const paddedSecs = pad(secs);

      if (prevYears !== paddedYears){
        if (yearsRef.current) yearsRef.current.innerText = paddedYears;
        prevYears = paddedYears; //cache it
      }
      if (prevMonths !== paddedMonths){
        if (monthsRef.current) monthsRef.current.innerText = paddedMonths;
        prevMonths = paddedMonths; //cache it
      }
      if (prevDays !== paddedDays){
        if (daysRef.current) daysRef.current.innerText = paddedDays;
        prevDays = paddedDays; //cache it
      }
      if (prevHours !== paddedHours){
        if (hoursRef.current) hoursRef.current.innerText = paddedHours;
        prevHours = paddedHours; //cache it
      }
      if (prevMins !== paddedMins){
        if (minsRef.current) minsRef.current.innerText = paddedMins;
        prevMins = paddedMins; //cache it
      }
      if (prevSecs !== paddedSecs){
        if (secsRef.current) secsRef.current.innerText = paddedSecs;
        prevSecs = paddedSecs; //cache it
      }

      //no need to cache (too frequent)
      if (msRef.current) msRef.current.innerText = pad(displayMs);

      //keep on running indefinitely till now>=endDate
      animationFrameId = requestAnimationFrame(updateTimer);
    };

    //start the process
    animationFrameId = requestAnimationFrame(updateTimer);

    return () => cancelAnimationFrame(animationFrameId);
  }, [dob, expectancy]);

  return (
    // text-slate-800 for light mode, dark:text-white/90 for dark mode
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
      <div className="flex flex-col items-center justify-center">
        <div className="flex gap-4 text-6xl font-light tracking-wider">
          <div className="flex flex-col items-center">
            <span
              ref={yearsRef}
              className="
                timer-text
                text-slate-800 dark:text-white/90
                drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]
                dark:drop-shadow-[0_0_6px_rgba(0,0,0,1)]
              "
            >
              00
            </span>
            <span className="text-sm tracking-widest text-slate-900 dark:text-white/50 mt-1 uppercase">
              Years
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              ref={monthsRef}
              className="
              timer-text
              text-slate-800 dark:text-white/90
              drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]
              dark:drop-shadow-[0_0_6px_rgba(0,0,0,1)]
            "
            >
              00
            </span>
            <span className="text-sm tracking-widest text-slate-900 dark:text-white/50 mt-1 uppercase">
              Months
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              ref={daysRef}
              className="
              timer-text
              text-slate-800 dark:text-white/90
              drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]
              dark:drop-shadow-[0_0_6px_rgba(0,0,0,1)]
            "
            >
              00
            </span>
            <span className="text-sm tracking-widest text-slate-900 dark:text-white/50 mt-1 uppercase">
              Days
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              ref={hoursRef}
              className="
              timer-text
              text-slate-800 dark:text-white/90
              drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]
              dark:drop-shadow-[0_0_6px_rgba(0,0,0,1)]
            "
            >
              00
            </span>
            <span className="text-sm tracking-widest text-slate-900 dark:text-white/50 mt-1 uppercase">
              Hours
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              ref={minsRef}
              className="
              timer-text
              text-slate-800 dark:text-white/90
              drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]
              dark:drop-shadow-[0_0_6px_rgba(0,0,0,1)]
            "
            >
              00
            </span>
            <span className="text-sm tracking-widest text-slate-900 dark:text-white/50 mt-1 uppercase">
              Minutes
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              ref={secsRef}
              className="
              timer-text
              text-slate-800 dark:text-white/90
              drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]
              dark:drop-shadow-[0_0_6px_rgba(0,0,0,1)]
            "
            >
              00
            </span>
            <span className="text-sm tracking-widest text-slate-900 dark:text-white/50 mt-1 uppercase">
              Seconds
            </span>
          </div>

          <div className="flex flex-col items-center">
            <span
              ref={msRef}
              className="
                timer-text
                text-slate-800 dark:text-white/90
                drop-shadow-[0_0_6px_rgba(0,0,0,0.7)]
                dark:drop-shadow-[0_0_6px_rgba(0,0,0,1)]
              "
            >
              00
            </span>
            <span className="text-sm tracking-widest text-slate-900 dark:text-white/50 mt-1 uppercase">
              MS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
