import { collection, getDocs, query, Timestamp, where } from "firebase/firestore";
import { db } from "../../../../firebase/client-config";

const getMonthlyIncome = async (userId, year, month) => {
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  const q = query(collection(db, "monthly_income_records"), where("createdAt", ">=", Timestamp.fromDate(startOfMonth)), where("createdAt", "<=", Timestamp.fromDate(endOfMonth)), where("userId", "==", userId));

  const incomeSnapshot = await getDocs(q);
  const income = incomeSnapshot.docs.map((doc) => doc.data());
  return income;
};
