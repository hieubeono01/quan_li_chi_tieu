"use client";
import React, { useState } from "react";
import EmojiPicker from "emoji-picker-react";
import { db } from "../../../../../firebase/client-config";
import { collection, doc, setDoc } from "firebase/firestore";
import { auth } from "../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSnackbar } from "notistack";
import { Box, Button, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";

interface CreateBudgetProps {
  onBudgetCreated: (budget: any) => void;
  jarId: string;
}

function CreateBudget({ onBudgetCreated, jarId }: CreateBudgetProps) {
  const [emoji, setEmoji] = useState("😲");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [user, loading, error] = useAuthState(auth);
  const { enqueueSnackbar } = useSnackbar();

  const onCreateBudget = async () => {
    try {
      if (!user) {
        enqueueSnackbar("Bạn cần đăng nhập để tạo ví!", {
          variant: "warning",
          autoHideDuration: 1500,
        });
        return;
      }
      const budgetsRef = collection(db, "budgets");
      const newDocRef = doc(budgetsRef);
      const newId = newDocRef.id;

      // Thêm jarId vào budgetData
      const budgetData = {
        id: newId,
        name: name,
        amount: parseFloat(amount.toString()),
        createdBy: user.displayName || "Ẩn danh",
        createdByID: user.uid,
        icon: emoji,
        createdAt: new Date().toISOString(),
        jarId: jarId, // Thêm trường jarId
      };

      await setDoc(newDocRef, budgetData);
      console.log("Document successfully created with ID:", newId);
      enqueueSnackbar("Đã tạo ví mới!", {
        variant: "success",
        autoHideDuration: 1500,
      });

      // Cập nhật callback để bao gồm jarId
      if (onBudgetCreated) {
        onBudgetCreated({
          id: newId,
          name,
          amount: parseFloat(amount.toString()),
          icon: emoji,
          jarId, // Thêm jarId vào dữ liệu trả về
          createdByID: user.uid,
          createdBy: user.displayName || "Ẩn danh",
          createdAt: new Date().toISOString(),
        });
      }

      setName("");
      setAmount(0);
      setEmoji("😲");
      setOpenDialog(false);
    } catch (error) {
      console.error("Error creating budget:", error);
      enqueueSnackbar("Có lỗi xảy ra khi tạo ví!", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  };

  return (
    // Phần return giữ nguyên không thay đổi
    <div>
      <div
        className="p-5 border rounded-lg 
  hover:shadow-md cursor-pointer h-[170px] flex flex-col items-center justify-center bg-gray-100"
      >
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
          startIcon={<span>➕</span>} // Thêm icon phía trước
          sx={{
            backgroundColor: "#e0e0e0", // Màu xám
            color: "black", // Màu chữ
            "&:hover": {
              backgroundColor: "#bdbdbd", // Màu xám đậm hơn khi hover
            },
            padding: "10px 20px", // Căn chỉnh kích thước
            borderRadius: "8px", // Bo góc button
            fontSize: "16px", // Kích thước chữ
            fontWeight: "bold", // Tăng độ đậm
          }}
        >
          Tạo ví mới
        </Button>
      </div>
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" size="large" onClick={() => setOpenEmoji(!openEmoji)} sx={{ minWidth: "auto" }}>
              {emoji}
            </Button>

            {openEmoji && (
              <Box sx={{ position: "absolute", zIndex: 20 }}>
                <EmojiPicker
                  onEmojiClick={(e) => {
                    setEmoji(e.emoji);
                    setOpenEmoji(false);
                  }}
                />
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "black",
                  fontWeight: 500,
                  my: 1,
                }}
              >
                Đặt tên cho ví
              </Typography>
              <TextField fullWidth placeholder="Nhập tên ví của bạn" value={name} onChange={(e) => setName(e.target.value)} variant="outlined" />
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  color: "black",
                  fontWeight: 500,
                  my: 1,
                }}
              >
                Số tiền ngân sách
              </Typography>
              <TextField fullWidth type="number" placeholder="Nhập số tiền ngân sách" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} variant="outlined" />
            </Box>

            <Button variant="contained" disabled={!(name && amount)} onClick={onCreateBudget} fullWidth sx={{ mt: 3 }}>
              Tạo ví
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudget;
