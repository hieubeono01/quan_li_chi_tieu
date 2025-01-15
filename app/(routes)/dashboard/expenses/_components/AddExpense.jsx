import React, { useState } from "react";
import { Input } from "../../../../../@/components/ui/input";
import { Button } from "../../../../../components/ui/button";
import { collection, addDoc, doc } from "firebase/firestore"; // Thêm import doc
import { db } from "../../../../../firebase/client-config";
import { set } from "zod";
import { Loader } from "lucide-react";
import { useSnackbar } from "notistack";

function AddExpense({ budgetId, user , onExpenseAdded }) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();


  const addNewExpense = async () => {
    setLoading(true);
    try {
      if (!user) {
        enqueueSnackbar("Bạn phải đăng nhập", {
          variant: "error",
          autoHideDuration: 1500,
        });
        return;
      }

      const expensesRef = collection(db, "expenses");

      // Tạo dữ liệu expense
      const expenseData = {
        name: name,
        amount: parseFloat(amount),
        createdBy: user.displayName || "Ẩn danh",
        budgetId: budgetId,
        createdAt: new Date().toISOString(),
      };

      // Thêm dữ liệu vào Firestore
      await addDoc(expensesRef, expenseData);

      // Reset form
      setName("");
      setAmount(0);

      enqueueSnackbar("Tạo chi phí thành công!", {
        variant: "success",
        autoHideDuration: 1500,
      });
      // Đảm bảo gọi onExpenseAdded để cập nhật lại dữ liệu
      if (onExpenseAdded) {
        setLoading(false);
        await onExpenseAdded();
      }
      setLoading(false);
    } catch (error) {
      console.error("Error creating expenses:", error);
      enqueueSnackbar("Có lỗi xảy ra khi tạo chi phí!", {
        variant: "error",
        autoHideDuration: 1500,
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Tạo chi phí</h2>

      <div>
        <label className="block mb-2">Đặt tên cho chi phí</label>
        <Input type="text" value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <div>
        <label className="block mb-2">Số tiền</label>
        <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>

      <Button disabled={!name || !amount} onClick={()=>addNewExpense()} className="w-full">
        {loading ? <Loader className="animate-spin"/> : "Tạo chi phí mới"}
      </Button>
    </div>
  );
}

export default AddExpense;
