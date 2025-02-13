"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, Typography, TextField, Button, Grid, Box, Container, Paper } from "@mui/material";
import { collection, addDoc, getDocs, query, where, Timestamp, QueryDocumentSnapshot, writeBatch } from "firebase/firestore";
import { auth, db } from "../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { enqueueSnackbar, useSnackbar } from "notistack";
import HistoryIncome from "./components/historyIncome";
import { useTheme } from "../../../_context/ThemeContext";
import { v4 as uuidv4 } from 'uuid';

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
  const [incomeId, setIncomeId] = useState<string>("");
  const { isDarkMode } = useTheme();
  
  const [percentages, setPercentages] = useState<{ [key: string]: number }>(
    DEFAULT_JARS.reduce((acc, jar) => {
      acc[jar.id] = jar.percentage;
      return acc;
    }, {} as { [key: string]: number })
  );
  const [user] = useAuthState(auth);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    // Kiểm tra xem incomeId đã được lưu trong localStorage chưa
    const storedIncomeId = localStorage.getItem("incomeId");
    if (storedIncomeId) {
      setIncomeId(storedIncomeId); // Sử dụng incomeId đã lưu
    } else {
      const newIncomeId = uuidv4(); // Tạo incomeId mới
      localStorage.setItem("incomeId", newIncomeId); // Lưu vào localStorage
      setIncomeId(newIncomeId);
    }
  }, []);
  useEffect(() => {
    if (user?.uid) {
      fetchIncomeData();
      fetchJarSpentValues(incomeId);
    }
  }, [user]);

  const fetchJarSpentValues = async (incomeId: string) => {
    try {
      const budgetsCollection = collection(db, "budgets");

      // Thêm điều kiện incomeId vào truy vấn
      const q = query(budgetsCollection, where("incomeId", "==", incomeId));

      const querySnapshot = await getDocs(q);

      const spentTotals: { [key: string]: number } = {};

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const jarId = data.jarId;
        const amount = data.amount || 0;

        spentTotals[jarId] = (spentTotals[jarId] || 0) + amount;
      });

      // Cập nhật jars với giá trị spent
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
        id: incomeId,
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
      await fetchJarSpentValues(incomeId);

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

  const handleJarClick = (jarId: string, incomeId : string) => {
    console.log("incomeId:", incomeId);
    router.push(`/dashboard/thu-nhap/${jarId}?incomeId=${incomeId}`);
  };
  const saveMonthlyHistory = async (userId: string, jars: Jar[], totalIncome: number) => {
    try {
      const now = new Date();
      const monthlyRecord = {
        month: now.getMonth() + 1, // Tháng (1-12)
        year: now.getFullYear(), // Năm
        jars: jars.map((jar) => ({
          id: jar.id,
          name: jar.name,
          percentage: jar.percentage,
          totalAmount: jar.totalAmount,
          spent: jar.spent,
        })),
        totalIncome: totalIncome,
        createdAt: Timestamp.now(),
      };

      // Lưu vào collection `monthlyHistory`
      await addDoc(collection(db, `users/${userId}/monthlyHistory`), monthlyRecord);
      console.log("Lưu lịch sử hàng tháng thành công!");
    } catch (error) {
      console.error("Lỗi khi lưu lịch sử hàng tháng:", error);
    }
  };
  
  const resetCurrentJars = async (userId: string) => {
    try {
      // Lấy tất cả bản ghi thu nhập hiện tại
      const incomeQuery = query(collection(db, "income"), where("userId", "==", userId));
      const incomeSnapshot = await getDocs(incomeQuery);

      // Xóa tất cả bản ghi thu nhập hiện tại
      const batch = writeBatch(db);
      incomeSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      setIncomeId(uuidv4()); // Generate a new ID after reset
      console.log("Reset dữ liệu hiện tại thành công!");
    } catch (error) {
      console.error("Lỗi khi reset dữ liệu hiện tại:", error);
    }
  };
  const handleMonthlyReset = async (userId: string) => {
    try {
      // Lấy dữ liệu hiện tại từ collection `income`
      const incomeQuery = query(collection(db, "income"), where("userId", "==", userId));
      const incomeSnapshot = await getDocs(incomeQuery);

      let totalIncome = 0;
      const jarsData: Jar[] = [];

      // Tính tổng thu nhập và tổng hợp dữ liệu các lọ
      incomeSnapshot.forEach((doc) => {
        const data = doc.data();
        totalIncome += data.amount;
        data.jars.forEach((jar: Jar) => {
          const existingJar = jarsData.find((j) => j.id === jar.id);
          if (existingJar) {
            existingJar.totalAmount += jar.totalAmount;
            existingJar.spent += jar.spent;
          } else {
            jarsData.push({ ...jar });
          }
        });
      });

      // Lưu dữ liệu vào lịch sử
      await saveMonthlyHistory(userId, jarsData, totalIncome);

      // Reset dữ liệu hiện tại
      await resetCurrentJars(userId);

      // Tạo incomeId mới
      const newIncomeId = uuidv4();
      localStorage.setItem("incomeId", newIncomeId); // Cập nhật localStorage
      setIncomeId(newIncomeId); // Cập nhật state

      console.log("Reset tháng thành công!");
    } catch (error) {
      console.error("Lỗi khi reset tháng:", error);
    }
  };
  
  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,
        bgcolor: "background.default",
        minHeight: "100vh",
        transition: "background-color 0.3s",
      }}
    >
      <Paper
        sx={{
          mb: 4,
          p: 2,
          bgcolor: "background.paper",
          transition: "background-color 0.3s",
        }}
      >
        <Typography variant="h4" gutterBottom>
          Tổng Thu Nhập: {formatCurrency(totalIncome)}
        </Typography>
        <Button variant="outlined" color="error" onClick={() => handleMonthlyReset(user.uid)} sx={{ ml: 2 }}>
          Reset Thu Nhập
        </Button>
      </Paper>

      {/* Form nhập thu nhập */}
      <Paper
        sx={{
          mb: 4,
          p: 2,
          bgcolor: "background.paper",
          transition: "background-color 0.3s",
        }}
      >
        <Card
          sx={{
            bgcolor: "background.paper",
            transition: "background-color 0.3s",
          }}
        >
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Quản Lý Thu Nhập Theo Phương Pháp 6 Lọ
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Tên thu nhập"
                variant="outlined"
                value={incomeTitle}
                onChange={(e) => setIncomeTitle(e.target.value)}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover fieldset": {
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Số tiền"
                type="number"
                variant="outlined"
                value={income}
                onChange={handleIncomeChange}
                sx={{
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)",
                    },
                    "&:hover fieldset": {
                      borderColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
                    },
                  },
                }}
              />
              <Button disabled={!incomeTitle || !income} type="submit" variant="contained" fullWidth size="large" sx={{ mt: 1 }}>
                Lưu Thu Nhập
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Paper>

      {/* Hiển thị các lọ */}
      <Paper
        sx={{
          mb: 4,
          p: 2,
          bgcolor: "background.paper",
          transition: "background-color 0.3s",
        }}
      >
        <Grid container spacing={3}>
          {jars.map((jar) => (
            <Grid item xs={12} sm={6} md={4} key={jar.id}>
              <Card
                sx={{
                  cursor: "pointer",
                  transition: "all 0.3s",
                  bgcolor: "background.paper",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: isDarkMode ? "0 4px 20px rgba(0,0,0,0.5)" : 4,
                  },
                }}
                onClick={() => handleJarClick(jar.id,incomeId)}
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
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.23)" : "rgba(0, 0, 0, 0.23)",
                        },
                        "&:hover fieldset": {
                          borderColor: isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)",
                        },
                      },
                    }}
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

