"use client";
import React, { useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../../firebase/client-config";
import { auth } from "../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import BudgetItem from "./BudgetItem";

function BudgetList() {
  const [budgetList, setBudgetList] = useState([]);
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      getBudgetList();
    }
  }, [user]);

  // Lấy danh sách ví và thông tin liên quan từ Firestore
  const getBudgetList = async () => {
    try {
      const budgetsRef = collection(db, "budgets");
      const expensesRef = collection(db, "expenses");

      // Truy vấn tất cả budgets do người dùng tạo
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

  // Callback được gọi sau khi tạo ví mới
  const handleBudgetCreated = (newBudget) => {
    setBudgetList((prevList) => [
      ...prevList,
      { ...newBudget, totalSpend: 0, totalItem: 0 }, // Thêm ví mới với dữ liệu mặc định
    ]);
  };

  return (
    <div className="mt-7">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Truyền callback vào CreateBudget */}
        <CreateBudget onBudgetCreated={handleBudgetCreated} />
        {budgetList?.length>0 ? budgetList.map((budget) => (
          <BudgetItem key={budget.id} budget={budget} />
        ))
      : [1,2,3,4,5].map((item,index)=>(
        <div className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse" key={index}>

        </div>
      ))
      }
      </div>
    </div>
  );
}

export default BudgetList;
