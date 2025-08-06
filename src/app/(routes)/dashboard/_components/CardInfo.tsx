import { PiggyBank, ReceiptText, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react'

function CardInfo({ budgetList, totalIncome }) {
  console.log("totalIncome", totalIncome);
  const [totalBudget, setTotalBudget] = useState(0);
  const [totalSpend, setTotalSpend] = useState(0);
  useEffect(() => {
    budgetList && CaculateCardInfo();
  }, [budgetList]);
  const formatCurrency = (amount: number): string => {
    return amount?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  const CaculateCardInfo = () => {
    console.log(budgetList);
    let totalBudget_ = 0;
    let totalSpend_ = 0;
    budgetList.forEach((element) => {
      totalBudget_ += element.amount;
      totalSpend_ += element.totalSpend;
    });
    setTotalBudget(totalBudget_);
    setTotalSpend(totalSpend_);
  };
  return (
    <div>
      {budgetList?.length > 0 ? (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-7 border rounded-lg flex justify-between items-center">
            <div className="">
              <h2 className="text-sm">Thu nhập</h2>
              <h2 className="font-bold text-2xl">{formatCurrency(totalIncome)}</h2>
            </div>
            <Wallet className="bg-primary p-3 h-12 w-12 rounded-full text-white" />
          </div>
          <div className="p-7 border rounded-lg flex justify-between items-center">
            <div className="">
              <h2 className="text-sm">Ngân sách</h2>
              <h2 className="font-bold text-2xl">{formatCurrency(totalBudget)}</h2>
            </div>
            <PiggyBank className="bg-primary p-3 h-12 w-12 rounded-full text-white" />
          </div>
          <div className="p-7 border rounded-lg flex justify-between items-center">
            <div className="">
              <h2 className="text-sm">Chi tiêu</h2>
              <h2 className="font-bold text-2xl">{formatCurrency(totalSpend)}</h2>
            </div>
            <ReceiptText className="bg-primary p-3 h-12 w-12 rounded-full text-white" />
          </div>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((item, index) => (
            <div key={index} className="h-[110px] w-full bg-slate-200 animate-pulse rounded-lg">
              <div className="">
                <h2 className="text-sm">Loading...</h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CardInfo