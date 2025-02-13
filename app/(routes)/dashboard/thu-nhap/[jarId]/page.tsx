"use client";
import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import BudgetList from "../../ngan-sach/_components/BudgetList";

function PageChiPhi({ params }: { params: { jarId: string } }) {
  const searchParams = useSearchParams();
  const incomeId = searchParams.get("incomeId") || "";
  const [totalIncomeFromBudget, setTotalIncomeFromBudget] = useState(0);
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-bold">Tổng thu nhập: {totalIncomeFromBudget.toLocaleString()} VND</h2>
      </div>
      <BudgetList jarId={params.jarId} incomeId={incomeId} onTotalIncomeChange={setTotalIncomeFromBudget} />
    </div>
  );
}

export default PageChiPhi;
