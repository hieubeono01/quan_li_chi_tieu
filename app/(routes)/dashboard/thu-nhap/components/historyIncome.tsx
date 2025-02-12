import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, TextField, Button, Grid, Box, Container, Paper } from "@mui/material";
import { collection, addDoc, getDocs, query, where, Timestamp, QueryDocumentSnapshot, writeBatch } from "firebase/firestore";
import { auth, db } from "../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { enqueueSnackbar, useSnackbar } from "notistack";
import { Jar, IncomeEntry } from "../type";

const HistoryIncome: React.FC = () => {
  const [allMonthlyIncomeRecords, setAllMonthlyIncomeRecords] = useState<IncomeEntry[]>([]);
  const [showAllRecords, setShowAllRecords] = useState<boolean>(false);
  const [user] = useAuthState(auth);
  const [incomeHistory, setIncomeHistory] = useState<IncomeEntry[]>([]);

  const fetchAllMonthlyIncomeRecords = async () => {
    if (!user?.uid) return;

    try {
      const q = query(collection(db, "monthly_income_records"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const allRecords: IncomeEntry[] = [];

      querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data() as Omit<IncomeEntry, "id">;
        const entry: IncomeEntry = { id: doc.id, ...data };
        allRecords.push(entry);
      });

      setAllMonthlyIncomeRecords(allRecords);
      setShowAllRecords(true);
    } catch (error) {
      console.error("Error fetching all monthly income records:", error);
      enqueueSnackbar("Lỗi khi lấy lịch sử thu nhập từ tất cả các tháng!", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  };
  const formatCurrency = (amount: number): string => {
    return amount?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };

  const timestampToDate = (createdAt: { seconds: number; nanoseconds: number }): Date => {
    return new Date(createdAt.seconds * 1000 + createdAt.nanoseconds / 1000000);
  };
  return (
    <Paper sx={{ p: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Lịch Sử Thu Nhập Theo Tháng
          </Typography>
          <Button variant="outlined" onClick={fetchAllMonthlyIncomeRecords} sx={{ mb: 2 }}>
            Xem Tất Cả
          </Button>
          <Box sx={{ mt: 2 }}>
            {incomeHistory
              .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
              .map((entry) => (
                <Paper key={entry.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle1">{entry.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {timestampToDate(entry.createdAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1">{formatCurrency(entry.amount)}</Typography>
                  </Box>
                </Paper>
              ))}
            {showAllRecords &&
              allMonthlyIncomeRecords.map((record) => (
                <Paper key={record.id} elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="subtitle1">{record.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {timestampToDate(record.createdAt).toLocaleDateString("vi-VN")}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1">{formatCurrency(record.amount)}</Typography>
                  </Box>
                </Paper>
              ))}
          </Box>
        </CardContent>
      </Card>
    </Paper>
  );
};
export default HistoryIncome;
