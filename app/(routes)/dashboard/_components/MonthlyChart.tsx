import { useState, useEffect } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { db } from "../../../../firebase/client-config"; // Điều chỉnh đường dẫn phù hợp
import { collection, query, getDocs, where, onSnapshot } from "firebase/firestore";
import { Timestamp } from "firebase/firestore";

interface Jar {
  id: string;
  name: string;
  spent: number;
}

interface MonthlyData {
  month: number;
  year: number;
  totalIncome: number;
  jars: Jar[];
}

interface ChartProps {
  userId: string;
}

const MonthlyChart = ({ userId }: ChartProps) => {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch dữ liệu từ Firestore
  useEffect(() => {
    const q = query(collection(db, `users/${userId}/monthlyHistory`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const data = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          month: data.month,
          year: data.year,
          totalIncome: data.totalIncome,
          jars: data.jars,
          createdAt: data.createdAt.toDate(),
        } as MonthlyData;
      });

      // Sắp xếp theo thời gian
      data.sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));

      setMonthlyData(data);
      setLoading(false);
    });

    // Hủy lắng nghe khi component unmount
    return () => unsubscribe();
  }, [userId]);

  // 2. Xử lý dữ liệu cho biểu đồ
  const processChartData = () => {
    return monthlyData.map((data) => ({
      month: `${data.month}/${data.year}`,
      totalIncome: data.totalIncome,
      totalSpent: data.jars.reduce((sum, jar) => sum + jar.spent, 0),
      ...data.jars.reduce((acc, jar) => {
        acc[jar.name] = jar.spent;
        return acc;
      }, {}),
    }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const chartData = processChartData();

  // 3. Render biểu đồ
  return (
    <div className="chart-container">
      <h2>Biểu đồ thu nhập và chi tiêu</h2>

      {/* Biểu đồ tổng thu nhập */}
      <div className="chart-section">
        <h3>Tổng thu nhập theo tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="totalIncome" stroke="#8884d8" name="Tổng thu nhập" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Biểu đồ chi tiêu các lọ */}
      <div className="chart-section">
        <h3>Chi tiêu theo danh mục</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {monthlyData[0]?.jars.map((jar, index) => (
              <Bar key={jar.id} dataKey={jar.name} fill={`#${Math.floor(Math.random() * 16777215).toString(16)}`} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyChart;
