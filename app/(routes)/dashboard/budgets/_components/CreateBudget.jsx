"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../@/components/ui/dialog";
import EmojiPicker from "emoji-picker-react";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../@/components/ui/input";
import { db } from "../../../../../firebase/client-config";
import { collection, doc, setDoc } from "firebase/firestore"; // Import thêm doc và setDoc
import { auth } from "../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { useSnackbar } from "notistack";


function CreateBudget({ onBudgetCreated }) {
  const [emoji, setEmoji] = useState("😲");
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // Trạng thái điều khiển dialog
  const [name, setName] = useState("");
  const [amount, setAmount] = useState(0);
  const [user, loading, error] = useAuthState(auth);
  const { enqueueSnackbar } = useSnackbar();
  

  const onCreateBudget = async () => {
    try {
      if (!user) {
        enqueueSnackbar("Bạn cần đăng nhập để tạo ví!", {
          variant : "warning",
          autoHideDuration: 1500
        });
        return;
      }
      const budgetsRef = collection(db, "budgets");
      const newDocRef = doc(budgetsRef); // Tạo tham chiếu với ID ngẫu nhiên
      const newId = newDocRef.id; // Lấy ID của document

      // Dữ liệu kèm theo ID
      const budgetData = {
        id: newId, // Gán ID của document vào trường 'id'
        name: name,
        amount: parseFloat(amount), // Chuyển thành số thực
        createdBy: user.displayName || "Ẩn danh",
        createdByID: user.uid,
        icon: emoji,
        createdAt: new Date().toISOString(), // Thời gian tạo
      };

      // Thêm dữ liệu vào Firestore
      await setDoc(newDocRef, budgetData);
      console.log("Document successfully created with ID:", newId);
      enqueueSnackbar("Đã tạo ví mới!", {
        variant : "success",
        autoHideDuration : 1500
      });

      // Gọi callback để cập nhật danh sách
      if (onBudgetCreated) {
        onBudgetCreated({
          id: newId,
          name,
          amount: parseFloat(amount),
          icon: emoji,
        });
      }

      // Đặt lại trạng thái và đóng dialog
      setName("");
      setAmount(0);
      setEmoji("😲");
      setOpenDialog(false); // Đóng popup
    } catch (error) {
      console.error("Error creating budget:", error);
      enqueueSnackbar("Có lỗi xảy ra khi tạo ví!" , {
        variant : "error",
        autoHideDuration :1500
      });
    }
  };

  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div
            className="bg-slate-100 p-10 rounded-md 
              items-center flex flex-col border-2 border-dashed 
              cursor-pointer hover:shadow-md"
          >
            <h2 className="text-3xl">+</h2>
            <h2>Tạo ví mới</h2>
          </div>
        </DialogTrigger>
        <DialogContent
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     bg-white p-4 sm:p-6 rounded-lg shadow-lg 
                     w-full max-w-sm sm:max-w-md md:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl font-bold">Tạo ví mới</DialogTitle>
            <DialogDescription>
              <div className="mt-5">
                <Button variant="outline" size="lg" onClick={() => setOpenEmoji(!openEmoji)}>
                  {emoji}
                </Button>
                {openEmoji && (
                  <div className="absolute z-20">
                    <EmojiPicker
                      onEmojiClick={(e) => {
                        setEmoji(e.emoji);
                        setOpenEmoji(false);
                      }}
                    />
                  </div>
                )}
                <div className="mt-2">
                  <h2 className="text-black font-medium my-1">Đặt tên cho ví</h2>
                  <Input placeholder="Nhập tên ví của bạn" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mt-2">
                  <h2 className="text-black font-medium my-1">Số tiền ngân sách</h2>
                  <Input type="number" placeholder="Nhập số tiền ngân sách" value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <Button disabled={!(name && amount)} onClick={onCreateBudget} className="mt-5 w-full">
                  Tạo ví
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateBudget;
