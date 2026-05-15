import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { auth } from "../firebase";
import { getShops } from "../services/api";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import "../styles/adminDashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [shops, setShops] = useState([]);
  const [stats, setStats] = useState({ totalShops: 0, totalVendors: 0 });
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const shopData = await getShops();
        setShops(shopData);

        const vendorSet = new Set(shopData.map((s) => s.vendorEmail));
        setStats({ totalShops: shopData.length, totalVendors: vendorSet.size });

        // Category distribution
        const catCounts = {};
        shopData.forEach((s) => {
          const cat = s.products || "Other";
          catCounts[cat] = (catCounts[cat] || 0) + 1;
        });

        // Top 5 shops by rating
        const topShops = [...shopData]
          .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
          .slice(0, 5);

        // Shops per vendor
        const vendorCounts = {};
        shopData.forEach((s) => {
          vendorCounts[s.vendorEmail] = (vendorCounts[s.vendorEmail] || 0) + 1;
        });

        const avgRating =
          shopData.length > 0
            ? (shopData.reduce((acc, s) => acc + (s.averageRating || 0), 0) / shopData.length).toFixed(1)
            : "N/A";

        const topCategory = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
        const shopsPerVendor = vendorSet.size > 0
          ? (shopData.length / vendorSet.size).toFixed(1)
          : "N/A";

        setAnalyticsData({ catCounts, topShops, vendorCounts, avgRating, topCategory, shopsPerVendor });
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, []);

  const COLORS = ["#378ADD", "#1D9E75", "#D85A30", "#D4537E", "#BA7517", "#534AB7"];

  const categoryChart = analyticsData
    ? {
        labels: Object.keys(analyticsData.catCounts),
        datasets: [{
          data: Object.values(analyticsData.catCounts),
          backgroundColor: COLORS.slice(0, Object.keys(analyticsData.catCounts).length),
          borderWidth: 2,
          borderColor: "#fff",
        }],
      }
    : null;

  const topShopsChart = analyticsData
    ? {
        labels: analyticsData.topShops.map((s) => s.name),
        datasets: [{
          data: analyticsData.topShops.map((s) => s.averageRating || 0),
          backgroundColor: "#378ADD",
          borderRadius: 4,
          borderSkipped: false,
        }],
      }
    : null;

  const vendorChart = analyticsData
    ? {
        labels: Object.keys(analyticsData.vendorCounts).map((e) => e.split("@")[0]),
        datasets: [{
          label: "Shops",
          data: Object.values(analyticsData.vendorCounts),
          backgroundColor: "#1D9E75",
          borderRadius: 4,
          borderSkipped: false,
        }],
      }
    : null;

  return (
    <motion.div
      className="admin-container"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <h1 className="admin-title">🧑‍💼 Admin Dashboard</h1>
      <p className="admin-subtitle">
        Welcome, <b>{auth.currentUser?.email}</b>
      </p>

      {/* Statistics Section */}
      <div className="admin-stats">
        <div className="stat-card">
          <h3>Total Shops</h3>
          <p>{stats.totalShops}</p>
        </div>
        <div className="stat-card">
          <h3>Total Vendors</h3>
          <p>{stats.totalVendors}</p>
        </div>
      </div>

      {/* Registered Shops Table */}
      <div className="admin-section">
        <h2>📍 Registered Shops</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Shop Name</th>
              <th>Vendor Email</th>
              <th>Category</th>
              <th>Address</th>
              <th>Rating</th>
            </tr>
          </thead>
          <tbody>
            {shops.length > 0 ? (
              shops.map((shop, i) => (
                <tr key={i}>
                  <td>{shop.name}</td>
                  <td>{shop.vendorEmail}</td>
                  <td>{shop.products || "N/A"}</td>
                  <td>{shop.address}</td>
                  <td>{shop.averageRating?.toFixed(1) || 0}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5">No shops found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Analytics Section */}
      <div className="admin-chart">
        <h2>📊 Analytics</h2>

        {!analyticsData ? (
          <p>Loading analytics...</p>
        ) : (
          <>
            {/* Summary KPI row */}
            <div className="analytics-stats">
              <div className="stat-card">
                <h3>Avg Rating</h3>
                <p>{analyticsData.avgRating} ★</p>
              </div>
              <div className="stat-card">
                <h3>Top Category</h3>
                <p>{analyticsData.topCategory}</p>
              </div>
              <div className="stat-card">
                <h3>Shops / Vendor</h3>
                <p>{analyticsData.shopsPerVendor}</p>
              </div>
            </div>

            {/* Charts row */}
            <div className="analytics-charts-grid">
              {/* Category Donut */}
              <div className="chart-card">
                <h3>Shops by Category</h3>
                <div style={{ height: 240 }}>
                  <Doughnut
                    data={categoryChart}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      cutout: "62%",
                      plugins: {
                        legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 12 } } },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Top Shops Horizontal Bar */}
              <div className="chart-card">
                <h3>Top 5 Shops by Rating</h3>
                <div style={{ height: 240 }}>
                  <Bar
                    data={topShopsChart}
                    options={{
                      indexAxis: "y",
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: {
                        x: { min: 3, max: 5, ticks: { font: { size: 11 } } },
                        y: { grid: { display: false }, ticks: { font: { size: 12 } } },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Vendor bar */}
            <div className="chart-card" style={{ marginTop: 16 }}>
              <h3>Shops per Vendor</h3>
              <div style={{ height: 220 }}>
                <Bar
                  data={vendorChart}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { size: 12 } } },
                      y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}