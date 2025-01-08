"use client";
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../firebase/client-config";
import CardInfo from "./_components/CardInfo";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { Bar } from "recharts";
import BarChartDashboard from "./_components/BarChartDashboard";
import BudgetItem from "./budgets/_components/BudgetItem";
import ExpensesListTable from "./expenses/_components/ExpensesListTable";

function Dashboard() {
  const [user, loading, error] = useAuthState(auth);
  const [budgetList, setBudgetList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);

  useEffect(() => {
    if (user) {
      // Gọi cả hai hàm khi component mount và user tồn tại
      getBudgetList();
      getAllExpenses();
    }
  }, [user]); // Dependency là user

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
      <div className="grid grid-cols-1 md:grid-cols-3 mt-6 gap-5">
        <div className="md:col-span-2">
          <BarChartDashboard budgetList={budgetList} />
          <ExpensesListTable expensesList={expensesList} refreshData={()=>getBudgetList} />
        </div>
        <div className="grid gap-5">
          <h2 className="font-bold text-lg">Ví mới nhất</h2>
          {budgetList.map((budget, index) => (
            <BudgetItem key={index} budget={budget} /> 
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
