"use client";
import React, { useEffect, useState } from "react";
import BudgetList from "./_components/BudgetList";
import { useSearchParams } from "next/navigation";

const DEFAULT_JARS = [
  { id: "NEC", name: "Nhu Cầu Cần Thiết (NEC)" },
  { id: "EDU", name: "Giáo Dục (EDU)" },
  { id: "LTS", name: "Tiết Kiệm Dài Hạn (LTS)" },
  { id: "FFA", name: "Tự Do Tài Chính (FFA)" },
  { id: "PLAY", name: "Giải Trí (PLAY)" },
  { id: "GIVE", name: "Cho Đi (GIVE)" },
];

function Budget() {
  const [totalIncomeFromBudget, setTotalIncomeFromBudget] = useState(0);
  const [incomeId, setIncomeId] = useState("");
  useEffect(() => {
    const storedIncomeId = localStorage.getItem("incomeId");
    if (storedIncomeId) {
      setIncomeId(storedIncomeId);
    }
  }, []);

  return (
    <div className="p-10">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Tổng thu nhập: {totalIncomeFromBudget.toLocaleString()} VND</h2>
      </div>
      
        <BudgetList  jarId={""} incomeId={incomeId} onTotalIncomeChange={setTotalIncomeFromBudget} />
      
    </div>
  );
}

export default Budget;