"use client";
import React, { useEffect, useState } from "react";
import CreateBudget from "./CreateBudget";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import BudgetItem from "./BudgetItem";

interface BudgetListProps {
  jarId: string; // Thêm prop jarId
  incomeId: string; // Thêm prop incomeId
  onTotalIncomeChange: (totalIncome: number) => void;
}

function BudgetList({ jarId, incomeId, onTotalIncomeChange }: BudgetListProps) {
  const [budgetList, setBudgetList] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [user, loading, error] = useAuthState(auth);
  useEffect(() => {
    if (user && incomeId) {
      getBudgetList();
    }
  }, [user, jarId, incomeId]);

  // Cập nhật hàm lấy danh sách budget để lọc theo jarId và incomeId
  const getBudgetList = async () => {
    try {
      const budgetsRef = collection(db, "budgets");
      const expensesRef = collection(db, "expenses");

      // Tạo query dựa vào điều kiện jarId và incomeId
      let budgetsQuery;
      if (jarId && jarId.trim() !== "" && incomeId && incomeId.trim() !== "") {
        // Nếu có jarId và incomeId, sử dụng cả 3 điều kiện
        budgetsQuery = query(budgetsRef, where("createdByID", "==", user?.uid), where("jarId", "==", jarId), where("incomeId", "==", incomeId));
      } else if (incomeId && incomeId.trim() !== "") {
        // Nếu chỉ có incomeId, sử dụng 2 điều kiện
        budgetsQuery = query(budgetsRef, where("createdByID", "==", user?.uid), where("incomeId", "==", incomeId));
      } else {
        throw new Error("incomeId must be defined");
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!!jarId ? (
          <CreateBudget
            onBudgetCreated={handleBudgetCreated}
            jarId={jarId} // Truyền jarId xuống CreateBudget
            incomeId={incomeId} // Truyền incomeId xuống CreateBudget
          />
        ) : null}
        {budgetList?.length > 0 ? budgetList.map((budget) => <BudgetItem key={budget.id} budget={budget} />) : [1, 2, 3, 4, 5].map((item, index) => <div className="w-full bg-slate-200 rounded-lg h-[150px] animate-pulse" key={index} />)}
      </div>
    </div>
  );
}

export default BudgetList;
