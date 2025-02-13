"use client";
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../firebase/client-config";
import ExpensesListTable from "./_components/ExpensesListTable";

interface Expense {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
}

function AllExpenses() {
  const [expensesList, setExpensesList] = useState<Expense[]>([]);
  const [incomeId, setIncomeId] = useState("");
  useEffect(() => {
    const storedIncomeId = localStorage.getItem("incomeId");
    if (storedIncomeId) {
      setIncomeId(storedIncomeId);
    }
  }, []);

  useEffect(() => {
    if (incomeId) {
      fetchExpenses();
    }
  }, [incomeId]);

  const fetchExpenses = async () => {
    try {
      const expensesRef = collection(db, "expenses");
      const q = query(expensesRef, where("incomeId", "==", incomeId));
      const querySnapshot = await getDocs(q);

      const expensesData: Expense[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Expense),
      }));

      setExpensesList(expensesData);
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Danh sách chi phí</h1>
      <ExpensesListTable expensesList={expensesList} refreshData={fetchExpenses} />
    </div>
  );
}

export default AllExpenses;