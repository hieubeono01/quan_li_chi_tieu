import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, Button, Box, Paper } from "@mui/material";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { enqueueSnackbar } from "notistack";
import { Timestamp } from "firebase/firestore";

interface MonthlyRecord {
  id: string;
  month: number;
  year: number;
  totalIncome: number;
  jars: {
    id: string;
    name: string;
    percentage: number;
    totalAmount: number;
    spent: number;
  }[];
  createdAt: Timestamp;
}

const HistoryIncome: React.FC = () => {
  const [allMonthlyRecords, setAllMonthlyRecords] = useState<MonthlyRecord[]>([]);
  const [showAllRecords, setShowAllRecords] = useState<boolean>(false);
  const [user] = useAuthState(auth);

  // Fetch tất cả bản ghi lịch sử hàng tháng
  const fetchAllMonthlyRecords = async () => {
    if (!user?.uid) return;

    try {
      const q = query(collection(db, `users/${user.uid}/monthlyHistory`));
      const querySnapshot = await getDocs(q);
      const records: MonthlyRecord[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        records.push({
          id: doc.id,
          month: data.month,
          year: data.year,
          totalIncome: data.totalIncome,
          jars: data.jars,
          createdAt: data.createdAt,
        });
      });

      setAllMonthlyRecords(records);
      setShowAllRecords(true);
    } catch (error) {
      console.error("Error fetching monthly records:", error);
      enqueueSnackbar("Lỗi khi lấy lịch sử hàng tháng!", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  };

  // Định dạng tiền tệ
  const formatCurrency = (amount: number): string => {
    return amount?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  // Chuyển đổi timestamp thành ngày
  const timestampToDate = (createdAt: Timestamp): string => {
    return new Date(createdAt.seconds * 1000).toLocaleDateString("vi-VN");
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Lịch Sử Thu Nhập Theo Tháng
          </Typography>
          <Button variant="outlined" onClick={fetchAllMonthlyRecords} sx={{ mb: 2 }}>
            Xem Tất Cả
          </Button>
          <Box sx={{ mt: 2 }}>
            {allMonthlyRecords
              .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
              .map((record) => (
                <Paper key={record.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Tháng {record.month}/{record.year}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    Tổng Thu Nhập: {formatCurrency(record.totalIncome)}
                  </Typography>
                  {record.jars.map((jar) => (
                    <Box key={jar.id} sx={{ mb: 1 }}>
                      <Typography variant="body1">{jar.name}</Typography>
                      <Typography variant="body2">Tổng tích lũy: {formatCurrency(jar.totalAmount)}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đã tiêu: {formatCurrency(jar.spent)}
                      </Typography>
                      <Typography variant="body2" color="success.main">
                        Còn lại: {formatCurrency(jar.totalAmount - jar.spent)}
                      </Typography>
                    </Box>
                  ))}
                  <Typography variant="body2" color="text.secondary">
                    Ngày reset: {timestampToDate(record.createdAt)}
                  </Typography>
                </Paper>
              ))}
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
};

export default HistoryIncome;
