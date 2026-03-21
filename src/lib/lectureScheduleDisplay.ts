/**
 * Human-readable schedule + countdown for lecture cards.
 * Avoids Math.ceil(ms / 86400000) which labels "6 hours from now" as "1 day".
 */

const MS_MIN = 60 * 1000;
const MS_HOUR = 60 * MS_MIN;
const MS_DAY = 24 * MS_HOUR;

function startOfLocalDay(d: Date): number {
  const x = new Date(d.getTime());
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** Calendar days from "today" to the lecture's local calendar day (0 = same day). */
function calendarDaysFromToday(scheduled: Date, now: Date): number {
  return Math.round((startOfLocalDay(scheduled) - startOfLocalDay(now)) / MS_DAY);
}

function formatHoursMinutesLeft(diffMs: number): string {
  if (diffMs <= 0) return '';
  if (diffMs < MS_MIN) return '< 1 min left';
  if (diffMs < MS_HOUR) {
    const m = Math.ceil(diffMs / MS_MIN);
    return `${m} min left`;
  }
  const h = Math.floor(diffMs / MS_HOUR);
  const m = Math.floor((diffMs % MS_HOUR) / MS_MIN);
  if (h === 0) return `${m} min left`;
  if (m === 0) return `${h} hour${h === 1 ? '' : 's'} left`;
  return `${h}h ${m}m left`;
}

function formatDaysLeft(diffMs: number): string {
  const d = Math.floor(diffMs / MS_DAY);
  const days = Math.max(1, d);
  return `${days} day${days === 1 ? '' : 's'} left`;
}

export type LectureScheduleDisplay = {
  isPast: boolean;
  /** Main line next to calendar icon */
  text: string;
  /** Amber badge; null if none */
  badgeText: string | null;
};

/**
 * @param isoDate - lecture.scheduledAt (ISO string)
 * @param maxBadgeDays - show day-count badge only if total time until start is within this many days
 */
export function getLectureScheduleDisplay(
  isoDate: string,
  maxBadgeDays: number = 14
): LectureScheduleDisplay {
  const scheduled = new Date(isoDate);
  const now = new Date();
  const diffMs = scheduled.getTime() - now.getTime();

  if (diffMs < 0) {
    return { isPast: true, text: 'Ended', badgeText: null };
  }

  const calDiff = calendarDaysFromToday(scheduled, now);
  let text: string;
  if (calDiff === 0) {
    text = 'Today';
  } else if (calDiff === 1) {
    text = 'Tomorrow';
  } else if (calDiff >= 2 && calDiff <= 14) {
    text = `${calDiff} days`;
  } else if (calDiff > 14) {
    text = scheduled.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  } else {
    // Past calendar day but diffMs >= 0 shouldn't happen; fallback
    text = scheduled.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  const maxMs = maxBadgeDays * MS_DAY;
  if (diffMs > maxMs) {
    return { isPast: false, text, badgeText: null };
  }

  let badgeText: string;
  if (diffMs < MS_DAY) {
    badgeText = formatHoursMinutesLeft(diffMs);
  } else if (calDiff >= 1) {
    // Match headline ("Tomorrow", "2 days") — avoid "2 days" + "1 day left" from floor(ms/24h)
    badgeText = `${calDiff} day${calDiff === 1 ? '' : 's'} left`;
  } else {
    badgeText = formatDaysLeft(diffMs);
  }

  return { isPast: false, text, badgeText };
}
