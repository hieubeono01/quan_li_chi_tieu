"use client";
import React, { useState, useEffect } from "react";
import { Box, Card, CardContent, Typography, LinearProgress, Grid, Paper, useTheme, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { collection, getDocs, query, where, limit, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db, auth } from "../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";

const FinancialGoals = () => {
  const [user] = useAuthState(auth);
  const [targetAmount, setTargetAmount] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newTargetAmount, setNewTargetAmount] = useState(0);
  const [targetId, setTargetId] = useState(null); // Lưu ID của mục tiêu để sửa/xóa
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
      const spendQuery = query(collection(db, "spend"), where("userId", "==", user.uid));
      const spendSnapshot = await getDocs(spendQuery);

      // Fetch latest target
      const targetQuery = query(collection(db, "targets"), where("userId", "==", user.uid), limit(1));
      const targetSnapshot = await getDocs(targetQuery);

      let totalRemainingAmount = 0;

      // Calculate total remainingAmount from spend collection
      if (!spendSnapshot.empty) {
        spendSnapshot.forEach((doc) => {
          totalRemainingAmount += doc.data().remainingAmount;
        });
        setRemainingAmount(totalRemainingAmount);
      }

      if (!targetSnapshot.empty) {
        const targetData = targetSnapshot.docs[0].data();
        setTargetAmount(targetData.targetAmount);
        setTargetId(targetSnapshot.docs[0].id); // Lưu ID của mục tiêu
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setNewTargetAmount(targetAmount); // Hiển thị giá trị hiện tại trong dialog
    setEditDialogOpen(true);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleEditConfirm = async () => {
    if (!targetId) return;
    try {
      const targetRef = doc(db, "targets", targetId);
      await updateDoc(targetRef, { targetAmount: newTargetAmount });
      setTargetAmount(newTargetAmount); // Cập nhật lại giá trị hiển thị
      setEditDialogOpen(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!targetId) return;
    try {
      const targetRef = doc(db, "targets", targetId);
      await deleteDoc(targetRef);
      setTargetAmount(0); // Đặt lại mục tiêu về 0
      setTargetId(null); // Xóa ID mục tiêu
      setDeleteDialogOpen(false);
    } catch (err) {
      setError(err.message);
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
          <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Mục Tiêu Tài Chính
            </Typography>
            <Box>
              <IconButton onClick={handleEditClick} color="primary">
                <Edit />
              </IconButton>
              <IconButton onClick={handleDeleteClick} color="error">
                <Delete />
              </IconButton>
            </Box>
          </Box>

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
            <Box sx={{ display: "flex", justifyContent : "space-between", mb: 1 }}>
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

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Sửa Mục Tiêu</DialogTitle>
        <DialogContent>
          <TextField label="Mục tiêu mới" type="number" fullWidth value={newTargetAmount} onChange={(e) => setNewTargetAmount(Number(e.target.value))} sx={{ mt: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleEditConfirm} color="primary">
            Lưu
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xóa Mục Tiêu</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa mục tiêu này?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FinancialGoals;
