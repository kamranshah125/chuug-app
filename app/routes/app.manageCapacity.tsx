import React, { useState } from "react";
import axios from "axios";

const ManageCapacity: React.FC = () => {
  // Backend routes (relative, Shopify handles auth via cookies)
  const backend = "/api/capacity";

  // --- Create State ---
  const [createCapacity, setCreateCapacity] = useState<number>(100);
  const [createDays, setCreateDays] = useState<number>(30);

  // --- Update State ---
  const [updateCapacity, setUpdateCapacity] = useState<number>(100);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // --- Fill Orders State ---
  const [usedIncrease, setUsedIncrease] = useState<number>(1);

  // --- Message ---
  const [message, setMessage] = useState<string>("");

  // Create New Capacity
  const handleCreateCapacity = async () => {
    setMessage("Creating capacity...");
    try {
      const res = await axios.post(`${backend}`, {
        totalCapacity: createCapacity,
        days: createDays,
      });
      setMessage(`✅ ${res.data.message}`);
    } catch (error: any) {
      console.error("Error creating capacity:", error);
      setMessage(`❌ ${error.response?.data?.error || "Failed to create capacity"}`);
    }
  };

  // Update Total Capacity
  const handleUpdateCapacity = async () => {
    setMessage("Updating total capacity...");
    try {
      const payload: any = { totalCapacity: updateCapacity };

      if (fromDate && toDate) {
        payload.fromDate = fromDate;
        payload.toDate = toDate;
      } else if (fromDate && !toDate) {
        payload.fromDate = fromDate;
      }

      const res = await axios.put(`${backend}`, payload);
      setMessage(`✅ ${res.data.message}`);
    } catch (error: any) {
      console.error("Error updating capacity:", error);
      setMessage(`❌ ${error.response?.data?.error || "Failed to update capacity"}`);
    }
  };

  // Fill Orders
  const handleFillOrders = async () => {
    setMessage("Filling orders...");
    try {
      const res = await axios.put(`${backend}`, { usedIncrease });
      setMessage(`✅ Order filled for ${res.data.updatedDate}`);
    } catch (error: any) {
      console.error("Error filling orders:", error);
      setMessage(`❌ ${error.response?.data?.message || "No available dispatch day"}`);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Manage Capacity</h1>

      {/* Status Message */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-xl text-white ${
            message.startsWith("✅")
              ? "bg-green-600"
              : message.startsWith("❌")
              ? "bg-red-600"
              : "bg-blue-600"
          }`}
        >
          {message}
        </div>
      )}

      {/* CREATE CAPACITY */}
      <div className="p-4 bg-white shadow rounded-2xl mb-6">
        <h3 className="font-semibold mb-4 text-gray-700">Create New Capacity</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col w-full sm:w-1/3">
            <label className="text-sm text-gray-600 mb-1">Total Capacity</label>
            <input
              type="number"
              className="border p-2 rounded-md"
              value={createCapacity}
              onChange={(e) => setCreateCapacity(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col w-full sm:w-1/3">
            <label className="text-sm text-gray-600 mb-1">Days (default 30)</label>
            <input
              type="number"
              className="border p-2 rounded-md"
              value={createDays}
              onChange={(e) => setCreateDays(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCreateCapacity}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      {/* UPDATE CAPACITY */}
      <div className="p-4 bg-white shadow rounded-2xl mb-6">
        <h3 className="font-semibold mb-4 text-gray-700">Update Total Capacity</h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">New Total Capacity</label>
            <input
              type="number"
              className="border p-2 rounded-md"
              value={updateCapacity}
              onChange={(e) => setUpdateCapacity(Number(e.target.value))}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">From Date</label>
            <input
              type="date"
              className="border p-2 rounded-md"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">To Date (optional)</label>
            <input
              type="date"
              className="border p-2 rounded-md"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleUpdateCapacity}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 w-full"
            >
              Update
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          <b>Tips:</b>
          <br />– Leave both dates empty → updates all future working days.
          <br />– Provide only <b>From Date</b> → updates that single date.
          <br />– Provide both → updates a range of dates.
        </p>
      </div>

      {/* FILL ORDERS */}
      <div className="p-4 bg-white shadow rounded-2xl">
        <h3 className="font-semibold mb-4 text-gray-700">Fill Orders</h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col w-full sm:w-1/3">
            <label className="text-sm text-gray-600 mb-1">Orders to Fill (default 1)</label>
            <input
              type="number"
              className="border p-2 rounded-md"
              value={usedIncrease}
              onChange={(e) => setUsedIncrease(Number(e.target.value))}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleFillOrders}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
              Fill Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageCapacity;
