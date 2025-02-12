import { format } from 'date-fns';
import { deleteDoc, doc } from 'firebase/firestore';
import { TrashIcon } from 'lucide-react';
import React from 'react'
import { db } from '../../../../../firebase/client-config';
import { useSnackbar } from "notistack";

interface Expense {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
}

interface ExpensesListTableProps {
  expensesList: Expense[];
  refreshData: () => void;
}

const ExpensesListTable: React.FC<ExpensesListTableProps> = ({ expensesList, refreshData }) => {
    const { enqueueSnackbar } = useSnackbar();

  const deleteExpense = async (expenses: Expense) => {
    try {
      const expenseDocRef = doc(db, "expenses", expenses.id);
      await deleteDoc(expenseDocRef);
      enqueueSnackbar('Xóa thành công', {
        variant : "success",
        autoHideDuration : 1500
      })
      console.log(`Expense with id ${expenses.id} deleted successfully`);
      refreshData();
    } catch (error) {
      console.error("Error deleting expense: ", error);
    }
  };
  const formatCurrency = (amount: number): string => {
    return amount?.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };
  return (
    <div className="mt-3">
      <h2 className='font-bold text-lg'>Chi phí mới nhất</h2>
      <div className="grid grid-cols-4 bg-slate-200 p-2 mt-3">
        <h2 className="font-bold">Tên</h2>
        <h2 className="font-bold">Số tiền</h2>
        <h2 className="font-bold">Ngày</h2>
        <h2></h2>
      </div>
      {expensesList.map((expenses, index) => (
        <div key={index} className="grid grid-cols-4 p-2">
          <h2>{expenses.name}</h2>
          <h2>{formatCurrency(expenses.amount)}</h2>
          <h2>{format(new Date(expenses.createdAt), "dd/MM/yyyy HH:mm:ss")}</h2>
          <h2>
            <TrashIcon className="w-5 h-5 text-red-500 cursor-pointer" onClick={() => deleteExpense(expenses)} />
          </h2>
        </div>
      ))}
    </div>
  );
};

export default ExpensesListTable;