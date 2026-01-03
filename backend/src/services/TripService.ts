export const shiftDates = (
  originalStart: Date,
  originalEnd: Date,
  baseDate: Date
): { newStart: Date; newEnd: Date } => {
  const duration = originalEnd.getTime() - originalStart.getTime();
  const newStart = new Date(baseDate);
  const newEnd = new Date(newStart.getTime() + duration);
  return { newStart, newEnd };
};

export const maintainDurations = (
  originalDates: { start: Date; end: Date },
  newStartDate: Date
): Date => {
  const duration = originalDates.end.getTime() - originalDates.start.getTime();
  return new Date(newStartDate.getTime() + duration);
};

