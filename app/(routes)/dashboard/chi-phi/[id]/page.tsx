"use client";
import React, { useCallback, useEffect, useState } from "react";
import { auth, db } from "../../../../../firebase/client-config";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import BudgetItem from "../../ngan-sach/_components/BudgetItem";
import AddExpense from "../_components/AddExpense";
import ExpensesListTable from "../_components/ExpensesListTable";
// import { Button } from "../../../../../components/ui/button";
import { Edit, PenBox, Trash } from "lucide-react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Alert from "@mui/material/Alert";
import EditBudget from "../_components/EditBudget";


function ExpensesScreen({ params }) {
  const [user, loading, error] = useAuthState(auth);
  const [budgetInfo, setBudgetInfo] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [expensesList, setExpensesList] = useState([]);
  const [open, setOpen] = useState(false);

  const refreshData = useCallback(async () => {
    if (user && params.id) {
      try {
        // Lấy thông tin ngân sách
        const budgetRef = doc(db, "budgets", params.id);
        const budgetSnap = await getDoc(budgetRef);

        if (budgetSnap.exists()) {
          const expensesRef = collection(db, "expenses");
          const q = query(expensesRef, where("budgetId", "==", params.id), orderBy("createdAt", "desc"));
          const expensesSnapshot = await getDocs(q);

          const expenses = expensesSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              amount: data.amount || 0,
            };
          });

          const totalSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
          const totalItem = expenses.length;

          const data = {
            ...budgetSnap.data(),
            id: budgetSnap.id,
            totalSpend,
            totalItem,
            expenses,
          };

          console.log("Budget refreshed with new data:", data);
          setBudgetInfo(data);
          setExpensesList(expenses); // Cập nhật danh sách chi phí
        }
      } catch (error) {
        console.error("Error refreshing budget:", error);
        setFetchError(error.message);
      }
    }
  }, [user, params.id]);
  console.log("expensesList", expensesList);
  console.log("budgetInfo", budgetInfo);
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const deleteBudget = async () => {
    try {
      const budgetRef = doc(db, "budgets", params.id);
      await deleteDoc(budgetRef);
      <Alert severity="success">Xóa thành công</Alert>;
      window.location.href = "/dashboard/budgets";
    } catch (error) {
      console.error("Error removing document: ", error);
    }
  }
  return (
    <div className="p-10">
      <h1 className="font-bold text-2xl flex justify-between items-center">
        Chi phí
        <div className="flex gap-2 items-center">
          <EditBudget budgetInfo={budgetInfo} refreshData={refreshData} />
          <Button className="flex gap-2" variant="contained" onClick={handleClickOpen}>
            <Trash /> Delete
          </Button>
          <Dialog open={open} onClose={handleClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
            <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.</DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} variant="outlined">
                Disagree
              </Button>
              <Button onClick={() => deleteBudget()} variant="contained" autoFocus>
                Agree
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 mt-6 gap-5">
        {budgetInfo ? <BudgetItem budget={budgetInfo} /> : <div className="h-[150px] w-full bg-slate-200 rounded-lg animate-pulse">Không tìm thấy ngân sách</div>}
        <AddExpense budgetId={params.id} user={user} onExpenseAdded={refreshData} />
      </div>
      <div className="">
        <ExpensesListTable expensesList={expensesList} refreshData={refreshData} />
      </div>
    </div>
  );
}

export default ExpensesScreen;
