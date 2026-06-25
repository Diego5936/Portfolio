function getTimePeriod(hour: number) {
  if (hour < 12) {
    return "morning";
  }
  if (hour < 18) {
    return "afternoon";
  }
  if (hour === 19) {
    return "sunset";
  }
  return "night";
}

function parseVisitDate(visitDateISO?: string, timezone?: string) {
  const date = visitDateISO ? new Date(visitDateISO) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;
  const timeZone =
    timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;

  const weekDay = safeDate.toLocaleDateString("en-US", {
    weekday: "long",
    timeZone,
  });
  const hour = Number.parseInt(
    safeDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone,
    }),
    10,
  );

  return { weekDay, hour };
}

/** Stable bucket used for fallback bundles (weekday + time period). */
export function buildPromptBucket(
  visitDateISO?: string,
  timezone?: string,
) {
  const { weekDay, hour } = parseVisitDate(visitDateISO, timezone);
  return `${weekDay}|${getTimePeriod(hour)}`;
}

export function promptBucketToSlug(promptBucket: string) {
  const [weekday, period] = promptBucket.split("|");
  return `${weekday.toLowerCase()}-${period}`;
}
