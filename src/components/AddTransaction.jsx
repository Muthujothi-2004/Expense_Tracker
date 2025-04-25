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
  Box,
} from "@mui/material";
import { format } from "date-fns";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/firebase.config";
import {
  Category,
  CreditCard,
  AttachMoney,
  LocalGroceryStore,
} from "@mui/icons-material";
import {
  defaultExpenseCategories,
  defaultIncomeCategories,
  paymentModes,
} from "../config/config";

const AddTransaction = ({ onSave, onClose, selectedDate, editData }) => {
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [expenseCategories, setExpenseCategories] = useState([
    ...defaultExpenseCategories,
  ]);
  const [incomeCategories, setIncomeCategories] = useState([
    ...defaultIncomeCategories,
  ]);

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
      alert("An error occurred while saving your transaction. Please try again.");
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
    <div
    style={{
      // background: isHovered
      //   ? "linear-gradient(to right, rgb(15, 16, 41), #f8f9fa)"
      //   : "none",
      minHeight: "100vh",
      // transition: "0.4s ease",
      padding: "2rem",
    }}
  >
    <Dialog
      open
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false),
        sx: {
          borderRadius: 3,
          background: isHovered
          ? "white"
            // ? "linear-gradient(to right, rgb(166, 242, 197) ,rgb(12, 51, 29))"
            : "white",
          p: 3,
          color: "#fff",
          // transition: "0.5s ease",
          border: isHovered ? "4px solid #100f0f" : "none", 
        },
      }}
    >
  
        <DialogTitle align="center" sx={{ fontSize: "1.8rem", fontWeight: 600 }}>
          {editData ? "Edit" : "Add"} {type.toUpperCase()}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2, px: 2 }}>
            {/* Toggle Buttons */}
            <Box sx={{ px: 1 }}>
              <ToggleButtonGroup
                color="primary"
                exclusive
                value={type}
                onChange={(e, newType) => {
                  if (newType !== null) setType(newType);
                }}
                fullWidth
              >
                <ToggleButton value="expense" sx={{ fontSize: "1rem" }}>
                  Expense
                </ToggleButton>
                <ToggleButton value="income" sx={{ fontSize: "1rem" }}>
                  Income
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Category */}
            <Box sx={{ px: 1 }}>
              <TextField
                select
                label="Category"
                placeholder="Choose a category"
                value={category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                fullWidth
              >
                <MenuItem value="">Select Category</MenuItem>
                {(type === "expense" ? expenseCategories : incomeCategories).map(
                  (cat) => (
                    <MenuItem key={cat} value={cat}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {getCategoryIcon(cat)}
                        <span>{cat}</span>
                      </Stack>
                    </MenuItem>
                  )
                )}
                <MenuItem value="add_new">➕ Add New Category</MenuItem>
              </TextField>
            </Box>

            {/* Custom Category Input */}
            {showCustomInput && (
              <Box sx={{ px: 1 }}>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="New Category"
                    placeholder="Enter new category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    fullWidth
                  />
                  <Button variant="contained" onClick={handleAddCustomCategory}>
                    Add
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Payment Mode */}
            {type === "expense" && (
              <Box sx={{ px: 1 }}>
                <TextField
                  select
                  label="Payment Mode"
                  placeholder="Select how you paid"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  fullWidth
                >
                  <MenuItem value="">Select Payment Mode</MenuItem>
                  {paymentModes.map((mode) => (
                    <MenuItem key={mode} value={mode}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CreditCard fontSize="small" />
                        <span>{mode}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            )}

            {/* Amount */}
            <Box sx={{ px: 1 }}>
              <TextField
                label="Amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "" || (/^\d+$/.test(value) && Number(value) >= 0)) {
                    setAmount(value);
                  }
                }}
                fullWidth
              />
            </Box>

            {/* Notes */}
            <Box sx={{ px: 1 }}>
              <TextField
                label="Notes (Optional)"
                placeholder="Any extra notes..."
                multiline
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
              />
            </Box>
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
    </div>
  );
};

export default AddTransaction;
