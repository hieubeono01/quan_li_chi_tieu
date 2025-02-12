import Link from "next/link";
import React from "react";

function BudgetItem({ budget }) {
  // Tính toán tỷ lệ tiêu thụ ngân sách
  const calculateProgressPerc = () => {
    const perc = (budget.totalSpend / budget.amount) * 100;
    return perc.toFixed(2);
  };
  const formatCurrency = (amount: number): string => {
    return amount?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  // Kiểm tra xem ngân sách có sắp vượt quá ngưỡng hay không
  const isBudgetExceeded = () => {
    const perc = calculateProgressPerc();
    return Number(perc) >= 80; // Cảnh báo nếu vượt quá 80%
  };

  return (
    <Link href={"/dashboard/chi-phi/" + budget.id}>
      <div className={`p-5 border rounded-lg hover:shadow-md cursor-pointer h-[170px] ${isBudgetExceeded() ? "border-red-500" : "border-gray-200"}`}>
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <h2 className="text-2xl p-3 px-4 bg-slate-100 rounded-full">{budget?.icon}</h2>
            <div className="">
              <h2 className="font-bold">{budget.name}</h2>
              <h2 className="text-sm text-gray-500">{budget.totalItem} Item</h2>
            </div>
          </div>
          <h2 className="font-bold text-primary text-lg">{formatCurrency(budget.amount)}</h2>
        </div>
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-slate-400">Đã tiêu {formatCurrency(budget.totalSpend) ? formatCurrency(budget.totalSpend) : 0}</h2>
            <h2 className={`text-xs ${Number(calculateProgressPerc()) < 80 ? "text-green-500" : "text-red-600"}`}>Còn lại {formatCurrency(budget.amount - budget.totalSpend)}</h2>
          </div>
          <div className="w-full bg-slate-300 h-2 rounded-full">
            <div
              className={`${Number(calculateProgressPerc()) < 80 ? "bg-primary" : "bg-red-500"} h-2 rounded-full`}
              style={{
                maxWidth: "100%",
                width: `${calculateProgressPerc()}%`,
              }}
            ></div>
          </div>
          {/* Hiển thị cảnh báo nếu vượt ngân sách */}
          {isBudgetExceeded() && <div className="text-red-500 text-sm mt-2">Cảnh báo: Bạn sắp vượt quá ngân sách!</div>}
        </div>
      </div>
    </Link>
  );
}

export default BudgetItem;
