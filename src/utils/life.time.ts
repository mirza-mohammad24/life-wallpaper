/**
 * LIFE TIMELINE TEMPORAL UTILITY LAYER
 *
 * This file is responsible for deriving runtime temporal values from
 * user-provided Date of Birth (DOB).
 *
 * The Life Timeline renderer does NOT operate on calendar months,
 * but on DOB-anchored life-months.
 *
 * LIFE-MONTH DEFINITION:
 *
 * A "life-month" is defined as the duration between:
 *
 *     DOB + N months  →  DOB + (N + 1) months
 *
 * NOT:
 *     calendar month boundaries (e.g., 1st → 30th/31st)
 *
 * This means:
 * - life-month duration varies depending on calendar position
 * - February life-months may be 28 or 29 days
 * - other months may be 30 or 31 days
 *
 * DATA FLOW:
 *
 * UserConfig (dob)
 *        ↓
 * getFullMonthsLived(dob)
 * getCurrentMonthProgress(dob)
 *        ↓
 * Derived temporal state
 *        ↓
 * RenderConfig
 *        ↓
 * Canvas Renderer
 *
 *
 * DOMAIN INVARIANTS GUARANTEED:
 *
 * - fully lived months >= 0
 * - progress belongs to [0,1]
 * - renderer never receives negative indices
 * - timeline alignment remains DOB-anchored
 *
 */

/**
 * @param {string} dob pass the date of birth of the user
 * @returns {number} the number of months that the user has FULLY lived since his dob
 */
export const getFullMonthsLived = (dob: string): number => {
  const presentDate = new Date();
  const birthDay = new Date(dob);

  if (isNaN(birthDay.getTime())) {
    return 0;
  }

  const presentDay = presentDate.getDate();
  const presentMonth = presentDate.getMonth();
  const presentYear = presentDate.getFullYear();

  const dobDay = birthDay.getDate();
  const dobMonth = birthDay.getMonth();
  const dobYear = birthDay.getFullYear();

  const yearDiff = presentYear - dobYear;
  const monthDiff = presentMonth - dobMonth;
  const monthsFromYears = yearDiff * 12;

  const returnVal =
    presentDay >= dobDay
      ? monthsFromYears + monthDiff
      : monthsFromYears + monthDiff - 1;

  //prevents code from breaking if a future dob is entered
  return Math.max(returnVal, 0);
};

/**
 * @param {string} dob pass the date of birth of the user
 * @return {number} a fractional value = [0,1] representing the current month progress
 */
export const getCurrentMonthProgress = (dob: string): number => {
  const birthDay = new Date(dob);

  if (isNaN(birthDay.getTime())) {
    return 0;
  }

  const fullMonthsLived = getFullMonthsLived(dob);

  //start of current month (Note: we move with respect to dob not actual month starting and endings)
  const startDate = new Date(dob);
  startDate.setMonth(startDate.getMonth() + fullMonthsLived);

  //end of current month (Note: with respect to our dob)
  const endDate = new Date(dob);
  endDate.setMonth(endDate.getMonth() + fullMonthsLived + 1);

  const now = new Date();
  const elapsed = now.getTime() - startDate.getTime();
  const duration = endDate.getTime() - startDate.getTime();

  const progress = elapsed / duration;

  //ensures the range of [0,1]
  return Math.min(Math.max(progress, 0), 1);
};
