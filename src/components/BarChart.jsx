import React, { useEffect, useState } from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { collection, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/firebase.config";
import { format } from "date-fns";

const COLORS = [
  "#FF6384",
  "#36A2EB",
  "#FFCE56",
  "#4BC0C0",
  "#9966FF",
  "#FF9F40",
];

const PieChartComponent = ({ selectedDate }) => {
  const [chartData, setChartData] = useState([]);
  const [timeFilter, setTimeFilter] = useState("All");
  const [monthFilterDate, setMonthFilterDate] = useState(new Date());

  useEffect(() => {
    const fetchChartData = async () => {
      const userId = auth.currentUser?.uid;
      const querySnapshot = await getDocs(collection(db, "transactions"));
      const allData = querySnapshot.docs.map((doc) => doc.data());

      const filteredData = allData.filter((rec) => {
        const isSameUser = rec.userId === userId;
        const isExpense = rec.type === "expense";

        const recDate = new Date(rec.date);
        const selected = new Date(monthFilterDate);

        const isSameMonth =
          recDate.getMonth() === selected.getMonth() &&
          recDate.getFullYear() === selected.getFullYear();

        const includeByTime =
          timeFilter === "All" || (timeFilter === "Monthly" && isSameMonth);

        return isSameUser && isExpense && includeByTime;
      });

      const categoryTotals = {};
      filteredData.forEach((rec) => {
        const category = rec.category;
        if (!categoryTotals[category]) {
          categoryTotals[category] = 0;
        }
        categoryTotals[category] += parseFloat(rec.amount);
      });

      const result = Object.entries(categoryTotals).map(
        ([category, value], index) => ({
          id: index,
          label: category,
          value,
          color: COLORS[index % COLORS.length],
        })
      );

      setChartData(result);
    };

    fetchChartData();
  }, [timeFilter, monthFilterDate]);

  return (
    <div className="container mt-4">
      <h4 className="mb-3">Expenses Pie Chart</h4>

      <div className="mb-3 text-end">
        <select
          className="form-select w-auto d-inline-block"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Monthly">Monthly</option>
        </select>
      </div>

      {timeFilter === "Monthly" && (
        <div className="p-3 mb-4 rounded shadow bg-white text-center">
          <strong>Select Month:</strong>{" "}
          <input
            type="month"
            className="form-control w-auto d-inline-block"
            value={format(monthFilterDate, "yyyy-MM")}
            onChange={(e) => setMonthFilterDate(new Date(e.target.value))}
          />
        </div>
      )}

      {chartData.length > 0 ? (
        <PieChart
          series={[
            {
              data: chartData,
              arcLabel: (item) => `₹${item.value}`,
              arcLabelMinAngle: 35,
              arcLabelRadius: "60%",
              innerRadius: 40,
              outerRadius: 80,
              paddingAngle: 2,
            },
          ]}
          width={400}
          height={300}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fontWeight: "bold",
              fill: "#333",
            },
          }}
        />
      ) : (
        <div className="text-muted text-center">No expenses found</div>
      )}
    </div>
  );
};

export default PieChartComponent;
