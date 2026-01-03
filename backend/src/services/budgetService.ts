export interface DayBudget {
  date: Date;
  totalExpense: number;
  dailyBudget: number;
  isOverBudget: boolean;
}

export interface SectionBudget {
  sectionId: string;
  totalExpense: number;
  budget: number;
  dailyBudget: number;
  days: number;
  isOverBudget: boolean;
}

export interface TripBudget {
  tripTotal: number;
  tripBudget: number;
  avgPerDay: number;
  days: number;
  perDayBudgets: DayBudget[];
  sectionBudgets: SectionBudget[];
}

export const computeDailyBudget = (tripBudget: number, numDays: number): number => {
  if (numDays === 0) return 0;
  return tripBudget / numDays;
};

export const computeSectionDailyBudget = (sectionBudget: number, numDays: number): number => {
  if (numDays === 0) return 0;
  return sectionBudget / numDays;
};

export const checkDayOverBudget = (
  dayExpense: number,
  dailyBudget: number
): boolean => {
  return dayExpense > dailyBudget;
};

export const computeTotals = (
  trip: any,
  sections: any[]
): TripBudget => {
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const numDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  const tripDailyBudget = computeDailyBudget(trip.budget, numDays);

  // Group activities by day
  const dayExpenses: Map<string, number> = new Map();
  const sectionExpenses: Map<string, number> = new Map();

  sections.forEach((section) => {
    let sectionTotal = 0;
    
    section.activities?.forEach((sa: any) => {
      const activityDate = new Date(sa.scheduledDate);
      const dateKey = activityDate.toISOString().split('T')[0];
      const expense = sa.expense || sa.activity?.cost || 0;
      
      dayExpenses.set(dateKey, (dayExpenses.get(dateKey) || 0) + expense);
      sectionTotal += expense;
    });

    sectionExpenses.set(section.id, sectionTotal);
  });

  // Calculate per-day budgets
  const perDayBudgets: DayBudget[] = [];
  for (let i = 0; i < numDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayExpense = dayExpenses.get(dateKey) || 0;
    const isOverBudget = checkDayOverBudget(dayExpense, tripDailyBudget);

    perDayBudgets.push({
      date: currentDate,
      totalExpense: dayExpense,
      dailyBudget: tripDailyBudget,
      isOverBudget,
    });
  }

  // Calculate section budgets
  const sectionBudgets: SectionBudget[] = sections.map((section) => {
    const sectionStart = new Date(section.startDate);
    const sectionEnd = new Date(section.endDate);
    const sectionDays = Math.ceil((sectionEnd.getTime() - sectionStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const sectionDailyBudget = computeSectionDailyBudget(section.budget, sectionDays);
    const sectionTotal = sectionExpenses.get(section.id) || 0;
    const sectionDailyExpense = sectionTotal / sectionDays;
    const isOverBudget = sectionDailyExpense > sectionDailyBudget;

    return {
      sectionId: section.id,
      totalExpense: sectionTotal,
      budget: section.budget,
      dailyBudget: sectionDailyBudget,
      days: sectionDays,
      isOverBudget,
    };
  });

  const tripTotal = Array.from(dayExpenses.values()).reduce((sum, expense) => sum + expense, 0);
  const avgPerDay = numDays > 0 ? tripTotal / numDays : 0;

  return {
    tripTotal,
    tripBudget: trip.budget,
    avgPerDay,
    days: numDays,
    perDayBudgets,
    sectionBudgets,
  };
};

