"use client";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../firebase/client-config";
import CardInfo from "./_components/CardInfo";
import { collection, getDocs, orderBy, query, Timestamp, where } from "firebase/firestore";
import { Bar } from "recharts";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./ngan-sach/_components/BudgetItem";
import ExpensesListTable from "./chi-phi/_components/ExpensesListTable";
// import IncomeChart from "../../_components/incomeCharts";
import dynamic from "next/dynamic";
import { Stack } from "@mui/material";
import { useTheme } from "../../_context/ThemeContext";
import MonthlyChart from "../dashboard/_components/MonthlyChart";


function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [totalIncome, setTotalIncome] = useState<number | null>(null);
  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [incomeData, setIncomeData] = useState([]);
  const { isDarkMode } = useTheme();
  const [incomeId, setIncomeId] = useState("");
  
  useEffect(() => {
    const storedIncomeId = localStorage.getItem("incomeId");
    if (storedIncomeId) {
      setIncomeId(storedIncomeId);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (user && incomeId && isMounted) {
        await getBudgetList();
        await getAllExpenses();
        await getTotalIncome(user.uid);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [user, incomeId]);

  const getTotalIncome = async (userId: string): Promise<number> => {
    console.time("getTotalIncome");
    try {
      // Tạo truy vấn để lấy tất cả documents trong collection "income" với userId tương ứng
      const incomeQuery = query(collection(db, "income"), where("userId", "==", userId));
      const querySnapshot = await getDocs(incomeQuery);

      let totalAmount = 0;

      // Lặp qua từng document và cộng dồn amount
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.amount && typeof data.amount === "number") {
          totalAmount += data.amount;
        }
      });

      console.log("Tổng amount:", totalAmount);
      setTotalIncome(totalAmount);
      return totalAmount;
    } catch (error) {
      console.error("Lỗi khi truy vấn Firestore:", error);
      throw error; // Ném lỗi để xử lý ở nơi gọi hàm
    } finally {
      console.timeEnd("getTotalIncome");
    }
  };

  const getBudgetList = async () => {
    console.time("getBudgetList");
    try {
      const budgetsRef = collection(db, "budgets");
      const expensesRef = collection(db, "expenses");

      const budgetsQuery = query(budgetsRef, where("createdByID", "==", user?.uid), where("incomeId", "==", incomeId));
      const budgetsSnapshot = await getDocs(budgetsQuery);

      const budgets = budgetsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const result = await Promise.all(
        budgets.map(async (budget) => {
          const expensesQuery = query(expensesRef, where("budgetId", "==", budget.id));
          const expensesSnapshot = await getDocs(expensesQuery);

          const expenses = expensesSnapshot.docs.map((doc) => doc.data());
          const totalSpend = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
          const totalItem = expenses.length;

          return {
            ...budget,
            totalSpend,
            totalItem,
          };
        })
      );

      setBudgetList(result);
    } catch (error) {
      console.error("Error fetching budget list:", error);
    } finally {
      console.timeEnd("getBudgetList");
    }
  };

  const getAllExpenses = async () => {
    console.time("getAllExpenses");
    try {
      const expensesRef = collection(db, "expenses");

      // Query với createdBy
      const q = query(expensesRef, where("createdBy", "==", user.displayName), where("incomeId", "==", incomeId));

      const expensesSnapshot = await getDocs(q);

      // Log để debug
      console.log("Query results:", expensesSnapshot.docs.length);

      const expenses = expensesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Log để debug
      console.log("Processed expenses:", expenses);

      setExpensesList(expenses);
      return expenses;
    } catch (error) {
      console.error("Error fetching expenses: ", error);
      throw error;
    } finally {
      console.timeEnd("getAllExpenses");
    }
  };

  return (
    <div className={`p-5 ${isDarkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"} min-h-screen transition-colors duration-200`}>
      <h2 className={`font-bold text-3xl mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Xin chào, {user ? user.displayName : "Guest"}</h2>

      <CardInfo budgetList={budgetList} totalIncome={totalIncome} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {/* Cột bên trái (chiếm 2/3 trên màn hình lớn) */}
        <div className={`md:col-span-2 space-y-6 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
          <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
            <BarChartDashboard budgetList={budgetList} />
          </div>

          <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
            <ExpensesListTable expensesList={expensesList} refreshData={() => getBudgetList} />
          </div>

          {/* <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
            <h2 className={`font-bold text-lg mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>Thống kê thu nhập</h2>
            <IncomeChart data={incomeData} />
          </div> */}
          <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
            <MonthlyChart userId={user?.uid} />
          </div>
        </div>

        {/* Cột bên phải (chiếm 1/3 trên màn hình lớn) */}
        <div className={`space-y-5 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
          <h2 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-gray-900"}`}>Ví mới nhất</h2>
          <div className="grid gap-5">
            {budgetList.map((budget, index) => (
              <div key={index} className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-800" : "bg-white"} shadow-lg`}>
                <BudgetItem budget={budget} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
