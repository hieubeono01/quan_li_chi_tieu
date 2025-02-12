'use client';
import React, { useEffect, useState } from 'react'
import { Button } from "../../../../../components/ui/button";
import { PenBox } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../../../../../@/components/ui/dialog";
import EmojiPicker from 'emoji-picker-react';
import { auth, db } from "../../../../../firebase/client-config";
import { useAuthState } from "react-firebase-hooks/auth";
import { Input } from '../../../../../@/components/ui/input';
import { doc, updateDoc } from 'firebase/firestore';
import Alert from "@mui/material/Alert";
function EditBudget({ budgetInfo, refreshData  }) {
  const [emoji, setEmoji] = useState(budgetInfo?.icon);
  const [openEmoji, setOpenEmoji] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // Trạng thái điều khiển dialog
  const [name, setName] = useState();
  const [amount, setAmount] = useState();
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (budgetInfo?.icon) {
      setEmoji(budgetInfo?.icon);
      setName(budgetInfo?.name);
      setAmount(budgetInfo?.amount);

    }
  },[budgetInfo]);
  const onUpdateBudget = async () => {
    if (!budgetInfo.id) {
      console.error("Budget ID is missing");
      return;
    }

    const updatedBudget = {
      icon: emoji !== "" ? emoji : budgetInfo.icon,
      name: name !== "" ? name : budgetInfo.name,
      amount: amount !== "" ? amount : budgetInfo.amount,
    };
    Object.keys(updatedBudget).forEach((key) => {
      if (updatedBudget[key] === undefined) {
        delete updatedBudget[key];
      }
    });
    try {
      const budgetDocRef = doc(db, "budgets", budgetInfo.id);
      await updateDoc(budgetDocRef, updatedBudget);
      <Alert severity="success">Cập nhật thành công</Alert>;
      refreshData();
      setOpenDialog(false); // Đóng dialog sau khi cập nhật thành công
    } catch (error) {
      console.error("Error updating budget: ", error);
    }
  };
  return (
    <div>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <Button variant="contained" className="flex gap-2">
            {" "}
            <PenBox /> Edit
          </Button>
        </DialogTrigger>
        <DialogContent
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                             bg-white p-4 sm:p-6 rounded-lg shadow-lg 
                             w-full max-w-sm sm:max-w-md md:max-w-lg"
        >
          <DialogHeader>
            <DialogTitle className="text-center text-lg sm:text-xl font-bold">Cập nhật ví</DialogTitle>
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
                  <Input placeholder="Nhập tên ví của bạn" defaultValue={budgetInfo?.name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="mt-2">
                  <h2 className="text-black font-medium my-1">Số tiền ngân sách</h2>
                  <Input type="number" placeholder="Nhập số tiền ngân sách" defaultValue={budgetInfo?.amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <Button onClick={onUpdateBudget} className="mt-5 w-full">
                  Cập nhật
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EditBudget