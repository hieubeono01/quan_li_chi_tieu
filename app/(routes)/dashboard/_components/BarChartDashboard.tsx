import React from "react";
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function BarChartDashboard({ budgetList }) {
  // Hàm định dạng giá trị trên trục Y
  const formatYAxisTick = (value) => {
    if (value >= 1000) {
      return `${value / 1000}k`; // Chia cho 1000 và thêm "k"
    }
    return value; // Giữ nguyên giá trị nếu nhỏ hơn 1000
  };

  return (
    <div className="border rounded-lg p-5 h-[300px] sm:h-[200px] md:h-[250px] lg:h-[300px] justify-items-center">
      <h2>Biểu đồ chi trong tháng</h2>
      <ResponsiveContainer width="80%" height={300}>
        <BarChart data={budgetList} margin={{ top: 7 }}>
          <XAxis dataKey="name" stroke="#8884d8" />
          <YAxis tickFormatter={formatYAxisTick} /> {/* Sử dụng tickFormatter để định dạng giá trị */}
          <Tooltip />
          <Legend />
          <Bar dataKey="totalSpend" stackId="a" fill="#4845d2" />
          <Bar dataKey="amount" stackId="a" fill="#C3C2FF" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BarChartDashboard;
