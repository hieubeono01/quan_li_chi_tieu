"use client";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../../../../firebase/client-config";
import { collection, getDocs, query, where } from "firebase/firestore/lite";
import { useAuthState } from "react-firebase-hooks/auth";

function ExpensesScreen({ params }) {
  const [user, loading, error] = useAuthState(auth);
  const [budgetInfo, setBudgetInfo] = useState(null);

  useEffect(() => {
    if (user) {
      getBudgetInfo(params.id);
    }
  }, [user, params.id]);

  const getBudgetInfo = async (budgetId) => {
    try {
      // Tham chiếu đến collection "budgets"
      const budgetsRef = collection(db, "budgets");
      console.log(budgetId);

      // Truy vấn document có id = params.id
      const budgetsQuery = query(budgetsRef, where("id", "==", budgetId));
      const budgetsSnapshot = await getDocs(budgetsQuery);

      // Lấy document đầu tiên (vì id là duy nhất nên chỉ có 1 kết quả)
      if (!budgetsSnapshot.empty) {
        const budgetData = budgetsSnapshot.docs[0].data();
        console.log("Budget Info:", budgetData);
        setBudgetInfo(budgetData);
      } else {
        console.log("Không tìm thấy thông tin ví!");
        setBudgetInfo(null);
      }
    } catch (error) {
      console.error("Error fetching budget info:", error);
    }
  };

  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold ">Chi phí</h2>
    </div>
  );
}

export default ExpensesScreen;
