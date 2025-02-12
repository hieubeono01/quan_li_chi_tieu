export interface Jar {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  totalAmount: number;
  spent: number; // Thêm trường để theo dõi số tiền đã tiêu
}

export interface IncomeEntry {
  id: string;
  userId: string;
  title: string;
  amount: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  jars: Jar[];
}
