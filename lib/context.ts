import { DAYS, type DayOfWeek, type Season, type TimeOfDay } from "./types";

export function getTimeOfDay(date = new Date()): TimeOfDay {
  const h = date.getHours();
  if (h >= 5 && h < 8) return "early-morning";
  if (h >= 8 && h < 12) return "morning";
  if (h >= 12 && h < 17) return "afternoon";
  if (h >= 17 && h < 22) return "evening";
  return "late-night";
}

export function getDayOfWeek(date = new Date()): DayOfWeek {
  return DAYS[date.getDay()];
}

const SOUTHERN_TZ =
  /^(Australia|Antarctica)\/|^Pacific\/(Auckland|Chatham|Fiji)|^America\/(Argentina|Santiago|Sao_Paulo|Montevideo|Asuncion|La_Paz|Lima)|^Africa\/(Johannesburg|Maputo|Harare|Windhoek|Gaborone|Maseru|Mbabane)|^Indian\/(Mauritius|Reunion)/;

/** Rough, timezone-based hemisphere guess. Good enough for a passing mention. */
export function getSeason(date = new Date(), timeZone?: string): Season {
  const tz = timeZone ?? safeTimeZone();
  const southern = SOUTHERN_TZ.test(tz);
  const m = date.getMonth(); // 0 = Jan
  const north: Season = m <= 1 || m === 11 ? "winter" : m <= 4 ? "spring" : m <= 7 ? "summer" : "autumn";
  if (!southern) return north;
  const flip: Record<Season, Season> = {
    winter: "summer",
    summer: "winter",
    spring: "autumn",
    autumn: "spring",
  };
  return flip[north];
}

function safeTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
  } catch {
    return "";
  }
}

export function describeMoment(date = new Date()): string {
  const tod = getTimeOfDay(date);
  const label: Record<TimeOfDay, string> = {
    "early-morning": "early morning",
    morning: "morning",
    afternoon: "afternoon",
    evening: "evening",
    "late-night": "late night",
  };
  return `${getDayOfWeek(date)} ${label[tod]} · ${getSeason(date)}`;
}

/** Local calendar day key, e.g. "2026-11-11". */
export function dayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Number of consecutive days (ending today) present in `days`. */
export function computeStreak(days: string[], today = new Date()): number {
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date(today);
  while (set.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}
