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

      console.log(data); // Kiểm tra dữ liệu có được cập nhật đúng không

      data.sort((a, b) => (a.year === b.year ? a.month - b.month : a.year - b.year));

      setMonthlyData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);
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
  const formatYAxisTick = (value) => {
    if (value >= 1000) {
      return `${value / 1000}k`; // Chia cho 1000 và thêm "k"
    }
    return value; // Giữ nguyên giá trị nếu nhỏ hơn 1000
  };
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  };
  return (
    <div className="chart-container">
      <h2>Biểu đồ thu nhập và chi tiêu</h2>

      {/* Biểu đồ tổng thu nhập */}
      <div className="chart-section">
        <h3>Tổng thu nhập theo tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart key={JSON.stringify(chartData)} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                const [month, year] = value.split("/");
                return `${month}/${year}`;
              }}
            />
            <YAxis tickFormatter={formatYAxisTick} />
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
            <YAxis tickFormatter={formatYAxisTick} />
            <Tooltip />
            <Legend />
            {monthlyData[0]?.jars.map((jar) => (
              <Bar key={jar.id} dataKey={jar.name} fill={stringToColor(jar.name)} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyChart;
