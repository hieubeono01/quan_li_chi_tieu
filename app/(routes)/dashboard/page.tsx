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


const IncomeChart = dynamic(() => import("../../_components/incomeCharts"), { ssr: false });
function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);
  const [incomeData, setIncomeData] = useState([]);


  useEffect(() => {
    if (user) {
      getBudgetList();
      getAllExpenses();
      getIncomeData();

    }
  }, [user]);
  const formatCurrency = (amount: number): string => {
    return amount?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  const getMonthlyIncome = async (userId, year, month) => {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const q = query(collection(db, "monthly_income_records"), where("createdAt", ">=", Timestamp.fromDate(startOfMonth)), where("createdAt", "<=", Timestamp.fromDate(endOfMonth)), where("userId", "==", userId));

    const incomeSnapshot = await getDocs(q);
    const income = incomeSnapshot.docs.map((doc) => doc.data());
    return income;
  };
  const aggregateIncomeByMonth = (incomeData) => {
    const monthlyIncome = incomeData.reduce((acc, item) => {
      const date = new Date(item.createdAt.seconds * 1000);
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear();
      const key = `${month} ${year}`;

      if (!acc[key]) {
        acc[key] = 0;
      }
      acc[key] += item.amount;
      return acc;
    }, {});

    return Object.keys(monthlyIncome).map((key) => ({
      name: key,
      amount: monthlyIncome[key],
    }));
  };
  const getIncomeData = async () => {
    const income = await getMonthlyIncome(user.uid, 2025, 1); // Lấy dữ liệu tháng 1 năm 2025
    const aggregatedData = aggregateIncomeByMonth(income);
    setIncomeData(aggregatedData);
  };
  const getBudgetList = async () => {
    try {
      const budgetsRef = collection(db, "budgets");
      const expensesRef = collection(db, "expenses");

      const budgetsQuery = query(budgetsRef, where("createdByID", "==", user?.uid));
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
    }
  };

  const getAllExpenses = async () => {
    try {
      const expensesRef = collection(db, "expenses");

      // Query với createdBy
      const q = query(expensesRef, where("createdBy", "==", user.displayName), orderBy("createdAt", "desc"));

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
    }
  };
  return (
    <div className="p-5">
      <h2 className="font-bold text-3xl">Xin chào, {user ? user.displayName : "Guest"}</h2>
      <CardInfo budgetList={budgetList} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {/* Cột bên trái (chiếm 2/3 trên màn hình lớn) */}
        <div className="md:col-span-2 space-y-6">
          <BarChartDashboard budgetList={budgetList} />
          <ExpensesListTable expensesList={expensesList} refreshData={() => getBudgetList} />
          <div>
            <h2 className="font-bold text-lg">Thống kê thu nhập</h2>
            <IncomeChart data={incomeData} />
          </div>
        </div>

        {/* Cột bên phải (chiếm 1/3 trên màn hình lớn) */}
        <div className="space-y-5">
          <h2 className="font-bold text-lg">Ví mới nhất</h2>
          <div className="grid gap-5">
            {budgetList.map((budget, index) => (
              <BudgetItem key={index} budget={budget} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
