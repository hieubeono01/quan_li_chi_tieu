'use client'
import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Grid, Paper, useTheme } from "@mui/material";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db, auth } from "../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";

const FinancialGoals = () => {
  const [user] = useAuthState(auth);
  const [targetAmount, setTargetAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.uid) return;
    try {
      // Fetch latest spend
      const spendQuery = query(collection(db, "spend"), where("userId", "==", user.uid), limit(1));
      const spendSnapshot = await getDocs(spendQuery);

      // Fetch latest target
      const targetQuery = query(collection(db, "targets"), where("userId", "==", user.uid), limit(1));
      const targetSnapshot = await getDocs(targetQuery);

      if (!spendSnapshot.empty) {
        setRemainingAmount(spendSnapshot.docs[0].data().remainingAmount);
      }

      if (!targetSnapshot.empty) {
        setTargetAmount(targetSnapshot.docs[0].data().targetAmount);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const progress = targetAmount ? Math.min((remainingAmount / targetAmount) * 100, 100) : 0;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography variant="h6">Đang tải...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ p: 2 }}>
        Lỗi: {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Mục Tiêu Tài Chính
          </Typography>

          <Grid container spacing={3}>
            {/* Target Amount Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.primary.light,
                  color: theme.palette.primary.contrastText,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Mục tiêu
                </Typography>
                <Typography variant="h4">{targetAmount.toLocaleString("vi-VN")} ₫</Typography>
              </Paper>
            </Grid>

            {/* Remaining Amount Card */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  bgcolor: theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Số dư hiện tại
                </Typography>
                <Typography variant="h4">{remainingAmount.toLocaleString("vi-VN")} ₫</Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Progress Section */}
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Tiến độ</Typography>
              <Typography variant="body2" fontWeight="medium">
                {progress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 2,
              }}
            />

            {/* Progress Details */}
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Đã tiết kiệm
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {remainingAmount.toLocaleString("vi-VN")} ₫
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper sx={{ p: 2, bgcolor: theme.palette.grey[50] }}>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Còn thiếu
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {Math.max(0, targetAmount - remainingAmount).toLocaleString("vi-VN")} ₫
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default FinancialGoals;
