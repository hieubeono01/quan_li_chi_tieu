"use client";
import React, { useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import BudgetItem from "./BudgetItem";

interface BudgetListProps {
  jarId: string; // Thêm prop jarId
  onTotalIncomeChange: (totalIncome: number) => void;
}

function BudgetList({ jarId, onTotalIncomeChange }: BudgetListProps) {
  const [budgetList, setBudgetList] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      getBudgetList();
    }
  }, [user, jarId]);

  // Cập nhật hàm lấy danh sách budget để lọc theo jarId
  const getBudgetList = async () => {
    try {
      const budgetsRef = collection(db, "budgets");
      const expensesRef = collection(db, "expenses");

      // Tạo query dựa vào điều kiện jarId
      let budgetsQuery;
      if (jarId && jarId.trim() !== "") {
        // Nếu có jarId, sử dụng cả 2 điều kiện
        budgetsQuery = query(budgetsRef, where("createdByID", "==", user?.uid), where("jarId", "==", jarId));
      } else {
        // Nếu không có jarId hoặc jarId rỗng, chỉ dùng điều kiện createdByID
        budgetsQuery = query(budgetsRef, where("createdByID", "==", user?.uid));
      }

      const budgetsSnapshot = await getDocs(budgetsQuery);

      const budgets = budgetsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as { amount: number }),
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
      // Tính tổng thu nhập và cập nhật lên component cha
      const total = result.reduce((sum, budget) => sum + (budget.amount || 0), 0);
      setTotalIncome(total);
      onTotalIncomeChange(total); // Truyền totalIncome lên component cha
    } catch (error) {
      console.error("Error fetching budget list:", error);
    }
  };

  const handleBudgetCreated = (newBudget) => {
    setBudgetList((prevList) => [...prevList, { ...newBudget, totalSpend: 0, totalItem: 0 }]);
    // Cập nhật tổng thu nhập khi thêm một BudgetItem mới
    setTotalIncome((prevTotal) => prevTotal + (newBudget.amount || 0));
  };

  // Hiển thị loading skeleton khi đang tải dữ liệu
  if (loading) {
    return (
      <div className="mt-7">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5].map((item, index) => (
            <div className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse" key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-7">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Tổng thu nhập: {totalIncome.toLocaleString()} VND</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!!jarId ? (
          <CreateBudget
            onBudgetCreated={handleBudgetCreated}
            jarId={jarId} // Truyền jarId xuống CreateBudget
          />
        ) : null}
        {budgetList?.length > 0 ? budgetList.map((budget) => <BudgetItem key={budget.id} budget={budget} />) : [1, 2, 3, 4, 5].map((item, index) => <div className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse" key={index} />)}
      </div>
    </div>
  );
}

export default BudgetList;
