/** Display helpers for doubt-session times (stored as IST wall clock on server). */

const TZ = 'Asia/Kolkata';

/** "14:45" / "9:05" → "2:45 PM" / "9:05 AM" */
export function formatTime12h(time24: string): string {
  const m = String(time24 || '').trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return time24 || '—';
  let h = parseInt(m[1], 10);
  const mi = m[2];
  if (!Number.isFinite(h) || h < 0 || h > 23) return time24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${mi} ${ampm}`;
}

/** Session label: calendar in IST + 12h time + IST suffix */
export function formatSessionLabelIST(dateIso: string, time24: string): string {
  try {
    const d = new Date(dateIso);
    if (Number.isNaN(d.getTime())) return `${dateIso} · ${formatTime12h(time24)}`;
    const dateStr = d.toLocaleDateString('en-IN', {
      timeZone: TZ,
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
    return `${dateStr} · ${formatTime12h(time24)} IST`;
  } catch {
    return `${dateIso} · ${formatTime12h(time24)}`;
  }
}

/** Next calendar day as YYYY-MM-DD in local browser (avoids UTC shift from toISOString). */
export function localDatePlusDaysYMD(daysFromToday: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

/** 12h UI → "HH:mm" 24h */
export function toTime24From12h(hour1to12: string, minute: string, ampm: 'AM' | 'PM'): string | null {
  const h = parseInt(String(hour1to12).trim(), 10);
  const mi = parseInt(String(minute).trim() || '0', 10);
  if (!Number.isFinite(h) || h < 1 || h > 12 || !Number.isFinite(mi) || mi < 0 || mi > 59) return null;
  let H: number;
  if (ampm === 'AM') H = h === 12 ? 0 : h;
  else H = h === 12 ? 12 : h + 12;
  return `${String(H).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
}
