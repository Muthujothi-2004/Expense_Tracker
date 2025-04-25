import React, { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import {
  FaArrowLeft,
  FaArrowRight,
  FaPlus,
  FaChartBar,
  FaUser,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { db, auth } from "../firebase/firebase.config";
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import AddTransaction from "./AddTransaction";
import BarChart from "./BarChart";
import { useNavigate } from "react-router-dom";
import { Modal, Button } from 'react-bootstrap';
import Swal from "sweetalert2";

const Dashboard = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [records, setRecords] = useState([]);
  const [expense, setExpense] = useState(0);
  const [income, setIncome] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [userName, setUserName] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editedAmount, setEditedAmount] = useState("");
  const [editedCategory, setEditedCategory] = useState("");
  const [editedPaymentMode, setEditedPaymentMode] = useState("");

  const navigate = useNavigate();
  const formattedDate = format(currentDate, "yyyy-MM-dd");

  const paperRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchUserName = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserName(userDoc.data().name);
          setNewName(userDoc.data().name);
        }
      }
    };
    fetchUserName();
  }, []);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    setLoading(true);
    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      where("date", "==", formattedDate)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setRecords(data);

      let totalExpense = 0;
      let totalIncome = 0;

      data.forEach((rec) => {
        if (rec.type === "expense") {
          totalExpense += parseFloat(rec.amount);
        } else {
          totalIncome += parseFloat(rec.amount);
        }
      });

      setExpense(totalExpense);
      setIncome(totalIncome);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [formattedDate]);

  const handlePrev = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
  };

  const handleNext = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setCurrentDate(nextDate);
  };

  const handleAddTransaction = () => {
    setShowForm(false);
  };

  const handleClickOutside = (event) => {
    if (paperRef.current && !paperRef.current.contains(event.target)) {
      setShowProfile(false);
    }
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowEditModal(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await deleteDoc(doc(db, "transactions", id));
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setEditedAmount(transaction.amount);
    setEditedCategory(transaction.category);
    setEditedPaymentMode(transaction.paymentMode || "");
  };

  const handleUpdateTransaction = async () => {
    if (editingTransaction) {
      const transactionRef = doc(db, "transactions", editingTransaction.id);
      await updateDoc(transactionRef, {
        amount: parseFloat(editedAmount),
        category: editedCategory,
        paymentMode:
          editingTransaction.type === "income" ? "" : editedPaymentMode,
      });
      setEditingTransaction(null);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "url('https://production-tcf.imgix.net/app/uploads/2018/10/18161243/GettyImages-881358614-e1539893628948.jpg')",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          filter: "blur(4px) brightness(1.2)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          backdropFilter: "blur(2px)",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderRadius: "12px",
          padding: "20px",
          minHeight: "100vh",
        }}
      >
        <div
          className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-4 rounded-3 shadow bg-white"
          style={{
            border: "2px solid #0d6efd",
            background: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(6px)",
            borderRadius: "15px",
          }}
        >
          <div>
            <h1
              className="fw-bold mb-1 text-primary"
              style={{ cursor: "pointer", fontSize: "2rem" }}
              onClick={() => navigate("/dashboard")}
            >
              Trackify
            </h1>
            <small className="text-muted" style={{ fontSize: "1rem" }}>
              Welcome, <span className="fw-semibold">{userName}</span>
            </small>
          </div>

          <div className="d-flex flex-wrap align-items-center gap-2 mt-3 mt-md-0">
            <button
              className="btn btn-outline-primary rounded-pill px-3"
              onClick={handlePrev}
              title="Previous Day"
            >
              <FaArrowLeft />
            </button>

            <div
              className="px-3 py-2 bg-light border rounded-pill text-dark fw-semibold"
              style={{
                minWidth: "160px",
                textAlign: "center",
                fontSize: "1rem",
              }}
            >
              {format(currentDate, "MMM dd, yyyy")}
            </div>

            <button
              className="btn btn-outline-primary rounded-pill px-3"
              onClick={handleNext}
              title="Next Day"
            >
              <FaArrowRight />
            </button>

            <button
              className="btn btn-outline-success rounded-pill px-3"
              onClick={() => setShowChart(!showChart)}
              title="Toggle Chart"
            >
              <FaChartBar />
            </button>

            <button
              className="btn btn-outline-secondary rounded-pill px-3"
              onClick={() => setShowProfile(true)}
              title="Profile"
            >
              <FaUser />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="row text-center mb-4">
            <div className="col-md-4 mb-3">
              <div className="p-3 shadow-sm rounded bg-white border-start border-danger border-4">
                <h6 className="text-muted mb-1">EXPENSE</h6>
                <p className="text-danger fs-5 mb-0">₹{expense.toFixed(2)}</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 shadow-sm rounded bg-white border-start border-success border-4">
                <h6 className="text-muted mb-1">INCOME</h6>
                <p className="text-success fs-5 mb-0">₹{income.toFixed(2)}</p>
              </div>
            </div>
            <div className="col-md-4 mb-3">
              <div className="p-3 shadow-sm rounded bg-white border-start border-dark border-4">
                <h6 className="text-muted mb-1">BALANCE</h6>
                <p className="fw-bold fs-5 mb-0">
                  ₹{(income - expense).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <h5 className="mb-3">{format(currentDate, "MMM dd, EEEE")}</h5>

        {!showChart && (
          <>
            {loading ? (
              <div className="text-center text-muted">Loading...</div>
            ) : records.length === 0 ? (
              <div className="text-muted text-center">
                No records for this date
              </div>
            ) : (
              records.map((rec) => (
                <div
                  key={rec.id}
                  className="d-flex justify-content-between align-items-center bg-white p-3 mb-3 rounded shadow-sm"
                >
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex justify-content-center align-items-center rounded me-3"
                      style={{
                        width: 50,
                        height: 50,
                        backgroundColor: "#f0f0f0",
                      }}
                    >
                      <img
                        src={`/icons/${
                          rec.category.charAt(0).toUpperCase() +
                          rec.category.slice(1).toLowerCase()
                        }.png`}
                        alt={rec.category}
                        width="40"
                        height="40"
                      />
                    </div>
                    <div>
                      <div className="fw-semibold fs-6 text-capitalize">
                        {rec.category}
                      </div>
                      <div className="text-muted small">
                        {rec.paymentMode || "—"}
                      </div>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <div
                      className={`fw-bold me-3 fs-6 ${
                        rec.type === "expense" ? "text-danger" : "text-success"
                      }`}
                    >
                      {rec.type === "expense" ? "-" : "+"}₹
                      {parseFloat(rec.amount).toFixed(2)}
                    </div>
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(rec)}
                      title="Edit"
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(rec.id)}
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {showChart && <BarChart selectedDate={currentDate} />}

        <button
          className="btn btn-success rounded-circle position-fixed bottom-0 end-0 m-4 p-3 shadow"
          onClick={() => setShowForm(true)}
        >
          <FaPlus />
        </button>

        {showForm && (
          <AddTransaction
            onClose={() => setShowForm(false)}
            onSave={handleAddTransaction}
            selectedDate={currentDate}
          />
        )}

        {showProfile && (
          <div
            ref={paperRef}
            className="position-fixed top-0 end-0 mt-4 me-4 bg-white p-3 border rounded shadow"
            style={{ zIndex: 1050, width: "300px", height: "250px" }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">User Profile</h6>
              <button
                className="btn-close"
                onClick={() => setShowProfile(false)}
              ></button>
            </div>
            <button
              className="btn btn-outline-primary w-100 mb-2"
              onClick={() => setShowEditModal(true)}
            >
              Edit Profile
            </button>
            <button
              className="btn btn-danger w-100"
              onClick={() => {
                Swal.fire({
                  title: "Are you sure you want to logout?",
                  icon: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#d33", 
                  cancelButtonColor: "#3085d6", 
                  confirmButtonText: "Yes, logout",
                  cancelButtonText: "Cancel",
                }).then((result) => {
                  if (result.isConfirmed) {
                    auth.signOut();
                    navigate("/");
                  }
                });
              }}
            >
              Logout
            </button>
          </div>
        )}
        <Modal
          show={showEditModal}
          onHide={() => setShowEditModal(false)}
          backdrop="static"
          keyboard={false}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Edit Name</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <input
              type="text"
              className="form-control"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={async () => {
                const user = auth.currentUser;
                if (user) {
                  const userRef = doc(db, "users", user.uid);
                  await updateDoc(userRef, { name: newName });
                  setUserName(newName);
                  setShowEditModal(false);
                  setShowProfile(false);
                }
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>

        {editingTransaction && (
          <>
            <div
              className="position-fixed top-0 start-0 w-100 h-100 bg-dark"
              style={{ opacity: 0.5, zIndex: 1055 }}
            ></div>
            <div
              className="position-fixed top-50 start-50 translate-middle bg-white p-4 rounded shadow"
              style={{ zIndex: 1060, width: "300px" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">Edit Transaction</h6>
                <button
                  className="btn-close"
                  onClick={() => setEditingTransaction(null)}
                ></button>
              </div>
              <input
                type="number"
                className="form-control mb-2"
                placeholder="Amount"
                value={editedAmount}
                onChange={(e) => setEditedAmount(e.target.value)}
              />
              <select
                className="form-select mb-2"
                value={editedCategory}
                onChange={(e) => setEditedCategory(e.target.value)}
              >
                <option value="">Select Category</option>
                <option value="food">Food</option>
                <option value="travel">Travel</option>
                <option value="shopping">Shopping</option>
                <option value="salary">Salary</option>
                <option value="gift">Gift</option>
              </select>
              {editingTransaction.type === "expense" && (
                <select
                  className="form-select mb-3"
                  value={editedPaymentMode}
                  onChange={(e) => setEditedPaymentMode(e.target.value)}
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="UPI">UPI</option>
                </select>
              )}
              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-success"
                  onClick={handleUpdateTransaction}
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
