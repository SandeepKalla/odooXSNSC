import { SectionType, ActivityType } from '@prisma/client';

export interface ActivityData {
  type: ActivityType;
}

export const inferSectionType = (activities: ActivityData[]): SectionType => {
  if (activities.length === 0) {
    return SectionType.BUFFER;
  }

  // Count activity types
  const typeCounts = {
    TRAVEL: 0,
    STAY: 0,
    EXPERIENCE: 0,
    BUFFER: 0,
  };

  activities.forEach((activity) => {
    typeCounts[activity.type]++;
  });

  // Determine section type based on dominant activity type
  const maxCount = Math.max(...Object.values(typeCounts));
  const dominantType = Object.entries(typeCounts).find(
    ([, count]) => count === maxCount
  )?.[0];

  switch (dominantType) {
    case 'TRAVEL':
      return SectionType.TRAVEL;
    case 'STAY':
      return SectionType.STAY;
    case 'EXPERIENCE':
      return SectionType.EXPERIENCE;
    default:
      return SectionType.BUFFER;
  }
};

export interface SectionDateRange {
  id?: string;
  startDate: Date;
  endDate: Date;
}

export const detectOverlaps = (sections: SectionDateRange[]): Map<string, boolean> => {
  const overlapMap = new Map<string, boolean>();

  for (let i = 0; i < sections.length; i++) {
    let hasOverlap = false;
    const sectionA = sections[i];

    for (let j = i + 1; j < sections.length; j++) {
      const sectionB = sections[j];

      // Check if date ranges overlap
      if (
        (sectionA.startDate <= sectionB.endDate && sectionA.endDate >= sectionB.startDate) ||
        (sectionB.startDate <= sectionA.endDate && sectionB.endDate >= sectionA.startDate)
      ) {
        hasOverlap = true;
        if (sectionB.id) {
          overlapMap.set(sectionB.id, true);
        }
      }
    }

    if (hasOverlap && sectionA.id) {
      overlapMap.set(sectionA.id, true);
    }
  }

  return overlapMap;
};

export const validateSectionDates = (
  sectionStart: Date,
  sectionEnd: Date,
  tripStart: Date,
  tripEnd: Date
): { valid: boolean; error?: string } => {
  if (sectionEnd < sectionStart) {
    return { valid: false, error: 'Section end date must be after start date' };
  }

  if (sectionStart < tripStart) {
    return { valid: false, error: 'Section start date must be within trip dates' };
  }

  if (sectionEnd > tripEnd) {
    return { valid: false, error: 'Section end date must be within trip dates' };
  }

  return { valid: true };
};

