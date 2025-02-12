export interface FinancialGoal {
  id?: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  startDate: Date;
  targetDate: Date;
  autoSaveAmount?: number;
  autoSaveFrequency?: "daily" | "weekly" | "monthly";
}
