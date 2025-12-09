import React, { useState, useEffect } from "react";
import axios from "axios";

const CapacityReportTable: React.FC = () => {
  const backend = "/api/report";
  const todayStr = new Date().toISOString().split("T")[0];

  const [report, setReport] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const { data } = await axios.get(backend, { params });

      // Backend sends { success: true, report: [...] }
      const formattedReport = (data.report || []).map((item: any) => ({
        ...item,
        totalCapacity: item.total,
        usedCapacity: item.used,
        remainingCapacity: item.total - item.used,
      }));

      setReport(formattedReport);

      // Optional summary
      const totalDays = formattedReport.length;
      const totalCapacity = formattedReport.reduce(
        (acc:any, cur:any) => acc + cur.totalCapacity,
        0
      );
      const usedCapacity = formattedReport.reduce((acc:any, cur:any) => acc + cur.usedCapacity, 0);
      const remainingCapacity = totalCapacity - usedCapacity;

      setSummary({ totalDays, totalCapacity, usedCapacity, remainingCapacity });
    } catch (err) {
      console.error("Error fetching capacity report:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Capacity Report</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchReport}
          className="mt-6 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Apply Filter
        </button>
      </div>

      {/* Summary */}
      {summary && (
        <div className="mb-6 rounded-lg border bg-gray-50 p-4 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold text-gray-700">Summary</h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600">Total Days</p>
              <p className="font-semibold">{summary.totalDays}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Capacity</p>
              <p className="font-semibold">{summary.totalCapacity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Used Capacity</p>
              <p className="font-semibold text-blue-600">{summary.usedCapacity}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Remaining Capacity</p>
              <p className="font-semibold text-green-600">{summary.remainingCapacity}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border shadow-sm bg-white">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Total Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Used Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                Remaining
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : report.length > 0 ? (
              report.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800">{item.date.split("T")[0]}</td>
                  <td className="px-6 py-4 text-sm text-gray-800">{item.totalCapacity}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-medium">{item.usedCapacity}</td>
                  <td className="px-6 py-4 text-sm text-green-600 font-medium">{item.remainingCapacity}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500 italic">
                  No records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CapacityReportTable;
