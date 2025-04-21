import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Typography,
  IconButton,
} from "@mui/material";
import { format } from "date-fns";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase";
import { Category, CreditCard, AttachMoney, LocalGroceryStore } from "@mui/icons-material"; // Add icons

const AddTransaction = ({ onSave, onClose, selectedDate, editData }) => {
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const defaultExpenseCategories = ["Food", "Travel", "Shopping", "Bills", "Other"];
  const defaultIncomeCategories = ["Salary", "Freelance", "Investment", "Gift", "Other"];
  const paymentModes = ["Cash", "Card", "Bank Transfer", "UPI"];

  const [expenseCategories, setExpenseCategories] = useState([...defaultExpenseCategories]);
  const [incomeCategories, setIncomeCategories] = useState([...defaultIncomeCategories]);

  useEffect(() => {
    if (editData) {
      setType(editData.type || "expense");
      setCategory(editData.category || "");
      setPaymentMode(editData.paymentMode || "");
      setAmount(editData.amount || "");
      setNotes(editData.notes || "");
    }
  }, [editData]);

  const handleCategoryChange = (value) => {
    if (value === "add_new") {
      setShowCustomInput(true);
    } else {
      setCategory(value);
      setShowCustomInput(false);
    }
  };

  const handleAddCustomCategory = () => {
    if (!customCategory.trim()) return;
    if (type === "expense") {
      setExpenseCategories([...expenseCategories, customCategory]);
    } else {
      setIncomeCategories([...incomeCategories, customCategory]);
    }
    setCategory(customCategory);
    setCustomCategory("");
    setShowCustomInput(false);
  };

  const handleSubmit = async () => {
    if (!amount || !category || (type === "expense" && !paymentMode)) {
      alert("All required fields must be filled.");
      return;
    }
    if (Number(amount) <= 0) {
      alert("Amount must be greater than 0.");
      return;
    }

    const date = selectedDate
      ? format(selectedDate, "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");

    const userId = auth.currentUser?.uid;

    const data = {
      type,
      category,
      paymentMode: type === "expense" ? paymentMode : "",
      amount,
      notes,
      date,
      userId,
    };

    try {
      if (editData) {
        const docRef = doc(db, "transactions", editData.id);
        await updateDoc(docRef, data);
      } else {
        await addDoc(collection(db, "transactions"), data);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving transaction:", err);
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case "Food":
        return <AttachMoney />;
      case "Travel":
        return <LocalGroceryStore />;
      case "Shopping":
        return <Category />;
      case "Bills":
        return <CreditCard />;
      default:
        return <Category />;
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm" >
      <DialogTitle align="center">
        {editData ? "Edit" : "Add"} {type.toUpperCase()}
      </DialogTitle>

      <DialogContent style={{ backgroundImage: 'url(https://i.pinimg.com/736x/55/f5/a0/55f5a0b0c7f77a04bacf3e25a849b66f.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <Stack spacing={2}>

          {/* Toggle Buttons for Expense/Income */}
          <ToggleButtonGroup
            color="primary"
            exclusive
            value={type}
            onChange={(e, newType) => {
              if (newType !== null) setType(newType);
            }}
            fullWidth
          >
            <ToggleButton value="expense">Expense</ToggleButton>
            <ToggleButton value="income">Income</ToggleButton>
          </ToggleButtonGroup>

          {/* Category */}
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select Category</MenuItem>
            {(type === "expense" ? expenseCategories : incomeCategories).map((cat) => (
              <MenuItem key={cat} value={cat}>
                <IconButton edge="start" size="small">
                  {getCategoryIcon(cat)}
                </IconButton>
                {cat}
              </MenuItem>
            ))}
            <MenuItem value="add_new">➕ Add New Category</MenuItem>
          </TextField>

          {/* Custom Category Input */}
          {showCustomInput && (
            <Stack direction="row" spacing={1}>
              <TextField
                label="New Category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                fullWidth
              />
              <Button variant="contained" onClick={handleAddCustomCategory}>
                Add
              </Button>
            </Stack>
          )}

          {/* Payment Mode */}
          {type === "expense" && (
            <TextField
              select
              label="Payment Mode"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              fullWidth
            >
              <MenuItem value="">Select Payment Mode</MenuItem>
              {paymentModes.map((mode) => (
                <MenuItem key={mode} value={mode}>
                  <IconButton edge="start" size="small">
                    <CreditCard />
                  </IconButton>
                  {mode}
                </MenuItem>
              ))}
            </TextField>
          )}

          {/* Amount */}
          <TextField
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)) {
                setAmount(value);
              }
            }}
            fullWidth
          />

          {/* Notes */}
          <TextField
            label="Notes (Optional)"
            multiline
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between", padding: 2 }}>
        <Button variant="outlined" color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="contained" color="success" onClick={handleSubmit}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddTransaction;
