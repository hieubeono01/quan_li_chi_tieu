"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, TextField, Button, Grid, Box, Container, Paper } from "@mui/material";
import { collection, addDoc, getDocs, query, where, Timestamp, QueryDocumentSnapshot, writeBatch } from "firebase/firestore";
import { auth, db } from "../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { enqueueSnackbar, useSnackbar } from "notistack";
import HistoryIncome from "./components/historyIncome";

interface Jar {
  id: string;
  name: string;
  percentage: number;
  amount: number;
  totalAmount: number;
  spent: number; // Thêm trường để theo dõi số tiền đã tiêu
}

interface IncomeEntry {
  id: string;
  userId: string;
  title: string;
  amount: number;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  jars: Jar[];
}

const DEFAULT_JARS: Jar[] = [
  { id: "NEC", name: "Nhu Cầu Cần Thiết (NEC)", percentage: 55, amount: 0, totalAmount: 0, spent: 0 },
  { id: "EDU", name: "Giáo Dục (EDU)", percentage: 10, amount: 0, totalAmount: 0, spent: 0 },
  { id: "LTS", name: "Tiết Kiệm Dài Hạn (LTS)", percentage: 10, amount: 0, totalAmount: 0, spent: 0 },
  { id: "FFA", name: "Tự Do Tài Chính (FFA)", percentage: 10, amount: 0, totalAmount: 0, spent: 0 },
  { id: "PLAY", name: "Giải Trí (PLAY)", percentage: 10, amount: 0, totalAmount: 0, spent: 0 },
  { id: "GIVE", name: "Cho Đi (GIVE)", percentage: 5, amount: 0, totalAmount: 0, spent: 0 },
];

const SixJarsFinance = ({ totalIncomeFromBudget }) => {
  const router = useRouter();
  const [income, setIncome] = useState<string>("");
  const [incomeTitle, setIncomeTitle] = useState<string>("");
  const [incomeHistory, setIncomeHistory] = useState<IncomeEntry[]>([]);
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [jars, setJars] = useState<Jar[]>(DEFAULT_JARS);
  const [percentages, setPercentages] = useState<{ [key: string]: number }>(
    DEFAULT_JARS.reduce((acc, jar) => {
      acc[jar.id] = jar.percentage;
      return acc;
    }, {} as { [key: string]: number })
  );
  const [user] = useAuthState(auth);
  const { enqueueSnackbar } = useSnackbar();
  
  

  const fetchJarSpentValues = async () => {
    try {
      const budgetsCollection = collection(db, "budgets");
      const querySnapshot = await getDocs(budgetsCollection);

      const spentTotals: { [key: string]: number } = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const jarId = data.jarId;
        const amount = data.amount || 0;

        spentTotals[jarId] = (spentTotals[jarId] || 0) + amount;
      });

      // Update jars with spent values
      setJars((prevJars) =>
        prevJars.map((jar) => ({
          ...jar,
          spent: spentTotals[jar.id] || 0,
        }))
      );
    } catch (error) {
      console.error("Error fetching spent values:", error);
    }
  };

  const fetchIncomeData = async () => {
    if (!user?.uid) return;

    try {
      const q = query(collection(db, "income"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const incomeData: IncomeEntry[] = [];
      let totalAmount = 0;

      const jarTotals = DEFAULT_JARS.reduce((acc, jar) => {
        acc[jar.id] = 0;
        return acc;
      }, {} as { [key: string]: number });

      querySnapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data() as Omit<IncomeEntry, "id">;
        const entry: IncomeEntry = { id: doc.id, ...data };
        incomeData.push(entry);
        totalAmount += entry.amount;

        entry.jars.forEach((jar) => {
          jarTotals[jar.id] += jar.amount;
        });
      });

      const updatedJars = DEFAULT_JARS.map((jar) => ({
        ...jar,
        totalAmount: jarTotals[jar.id],
        amount: 0,
      }));

      setIncomeHistory(incomeData);
      setTotalIncome(totalAmount);
      setJars(updatedJars);
    } catch (error) {
      console.error("Error fetching income data:", error);
    }
  };

  // Combine data fetching in useEffect
  useEffect(() => {
    if (user?.uid) {
      fetchIncomeData();
      fetchJarSpentValues();
    }
  }, [user]);

  // Rest of the component remains the same...
  const handlePercentageChange = (jarId: string, newPercentage: number) => {
    setPercentages((prevPercentages) => {
      const totalPercentage = Object.values(prevPercentages).reduce((acc, perc) => acc + perc, 0) - prevPercentages[jarId] + newPercentage;
      if (totalPercentage > 100) {
        enqueueSnackbar("Tổng tỷ lệ không được vượt quá 100%", {
          variant: "warning",
          autoHideDuration: 1500,
        });
        return prevPercentages;
      }
      return {
        ...prevPercentages,
        [jarId]: newPercentage,
      };
    });
    setJars((prevJars) =>
      prevJars.map((jar) =>
        jar.id === jarId ? { ...jar, percentage: newPercentage } : jar
      )
    );
  };

  const calculateJars = (value: string): Jar[] => {
    const numValue = parseFloat(value) || 0;

    return jars.map((jar) => ({
      ...jar,
      amount: Number(((numValue * percentages[jar.id]) / 100).toFixed(1)),
      totalAmount: jar.totalAmount + Number(((numValue * percentages[jar.id]) / 100).toFixed(1)),
    }));
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setIncome(value);
    setJars(calculateJars(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeTitle || !income || !user?.uid) {
      enqueueSnackbar("Vui lòng nhập đầy đủ thông tin!", {
        variant: "warning",
        autoHideDuration: 1500,
      });
      return;
    }

    try {
      const calculatedJars = calculateJars(income);
      const incomeData = {
        userId: user.uid,
        title: incomeTitle,
        amount: parseFloat(income),
        jars: calculatedJars.map((jar) => ({
          ...jar,
          totalAmount: jar.amount,
        })),
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "income"), incomeData);
      await fetchIncomeData();
      await fetchJarSpentValues();

      setIncome("");
      setIncomeTitle("");
      enqueueSnackbar("Lưu thành công!", {
        variant: "error",
        autoHideDuration: 1500,
      });
    } catch (error) {
      console.error("Error saving income:", error);
      enqueueSnackbar("Có lỗi xảy ra khi lưu thu nhập!", {
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

  const handleJarClick = (jarId: string) => {
    router.push(`thu-nhap/${jarId}`);
  };
  const saveMonthlyIncomeRecord = async () => {
    if (!user?.uid) return;

    try {
      const monthlyRecord = {
        userId: user.uid,
        totalIncome: totalIncome,
        jars: jars.map((jar) => ({
          id: jar.id,
          name: jar.name,
          percentage: jar.percentage,
          totalAmount: jar.totalAmount,
          spent: jar.spent,
        })),
        incomeHistory: incomeHistory,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "monthly_income_records"), monthlyRecord);
      enqueueSnackbar("Đã lưu bản ghi thu nhập hàng tháng!", {
        variant: "success",
        autoHideDuration: 1500,
      });
    } catch (error) {
      console.error("Error saving monthly income record:", error);
      enqueueSnackbar("Lỗi khi lưu bản ghi thu nhập hàng tháng!", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  };
  
  const resetTotalIncome = async () => {
    try {
      await saveMonthlyIncomeRecord();

      // Reset local state
      setTotalIncome(0);
      setIncomeHistory([]);

      // Xóa tất cả các document trong collection "income" của người dùng hiện tại
      if (user?.uid) {
        const q = query(collection(db, "income"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);

        const batch = writeBatch(db);
        querySnapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });

        await batch.commit();

        // Reset jars
        setJars(DEFAULT_JARS);

        enqueueSnackbar("Đã reset toàn bộ thu nhập!", {
          variant: "success",
          autoHideDuration: 1500,
        });
      }
    } catch (error) {
      console.error("Error resetting income:", error);
      enqueueSnackbar("Lỗi khi reset thu nhập!", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ mb: 4, p: 2 }}>
        <Typography variant="h4" gutterBottom>
          Tổng Thu Nhập: {formatCurrency(totalIncome)}
        </Typography>
        <Button disabled variant="outlined" color="error" onClick={resetTotalIncome} sx={{ ml: 2 }}>
          Reset Thu Nhập
        </Button>
      </Paper>

      {/* Form nhập thu nhập */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Quản Lý Thu Nhập Theo Phương Pháp 6 Lọ
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField fullWidth label="Tên thu nhập" variant="outlined" value={incomeTitle} onChange={(e) => setIncomeTitle(e.target.value)} sx={{ mb: 2 }} />
              <TextField fullWidth label="Số tiền" type="number" variant="outlined" value={income} onChange={handleIncomeChange} sx={{ mb: 2 }} />
              <Button disabled={!incomeTitle || !income} type="submit" variant="contained" fullWidth size="large" sx={{ mt: 1 }}>
                Lưu Thu Nhập
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Paper>

      {/* Hiển thị các lọ */}
      <Paper sx={{ mb: 4, p: 2 }}>
        <Grid container spacing={3}>
          {jars.map((jar) => (
            <Grid item xs={12} sm={6} md={4} key={jar.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleJarClick(jar.id)}
              >
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {jar.name}
                  </Typography>
                  <TextField
                    label="Tỷ lệ (%)"
                    type="number"
                    value={percentages[jar.id]}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => handlePercentageChange(jar.id, parseFloat(e.target.value))}
                    fullWidth
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body1">Thu nhập mới: {formatCurrency(jar.amount)}</Typography>
                  <Typography variant="body1" color="primary">
                    Tổng tích lũy: {formatCurrency(jar.totalAmount)}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Đã tiêu: {formatCurrency(jar.spent)}
                  </Typography>
                  <Typography variant="body1" color="success.main">
                    Còn lại: {formatCurrency(jar.totalAmount - jar.spent)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
      {/* Lịch sử thu nhập */}
      <HistoryIncome />
    </Container>
  );
};

export default SixJarsFinance;

