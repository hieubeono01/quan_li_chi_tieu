"use client"
import React, { useState } from "react";
import BudgetList from "../../ngan-sach/_components/BudgetList";

function PageChiPhi({ params }: { params: { jarId: string } }) {
  const [totalIncomeFromBudget, setTotalIncomeFromBudget] = useState(0);
  return (
    <div>
      <BudgetList jarId={params.jarId} onTotalIncomeChange={setTotalIncomeFromBudget} />
    </div>
  );
}

export default PageChiPhi;
