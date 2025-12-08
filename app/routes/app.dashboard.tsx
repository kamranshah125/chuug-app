import { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from "chart.js";
import { authenticate } from "../shopify.server";
import { useAppBridge } from "@shopify/app-bridge-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type CapacityData = {
  date: string;
  totalCapacity: number;
  usedCapacity: number;
};

export const loader = async ({ request }: { request: Request }) => {
  await authenticate.admin(request);
  return null;
};

export default function DashboardPage() {
  const backend = "/api/report";
  const shopify = useAppBridge();

  const [data, setData] = useState<CapacityData[]>([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);

  // const fetchReport = async () => {
  //   try {
  //     setLoading(true);
  //     const params: Record<string, string> = {};
  //     if (fromDate) params.startDate = fromDate;
  //     if (toDate) params.endDate = toDate;

  //     const res = await axios.get(backend, { params });
  //     setData(res.data.data || []);
  //   } catch (error) {
  //     console.error("Error fetching report:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const fetchReport = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;

      const res = await axios.get(backend, { params });

      // Map the API response to match your frontend data structure
      const mappedData = (res.data.report || []).map((item: any) => ({
        date: item.date,
        totalCapacity: item.total, // map 'total' to 'totalCapacity'
        usedCapacity: item.used, // map 'used' to 'usedCapacity'
      }));

      setData(mappedData);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    fetchReport();
  }, []);

  const totalCapacities = data.reduce((sum, d) => sum + d.totalCapacity, 0);
  const usedCapacities = data.reduce((sum, d) => sum + d.usedCapacity, 0);
  const remainingCapacities = totalCapacities - usedCapacities;

 const chartData = {
  labels: data.map((d) => {
    const date = new Date(d.date);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }),
  datasets: [
    {
      label: "Total Capacity",
      data: data.map((d) => d.totalCapacity),
      borderColor: "rgba(59,130,246,1)",
      backgroundColor: "rgba(59,130,246,0.2)",
      tension: 0.3,
      fill: true,
    },
    {
      label: "Used Capacity",
      data: data.map((d) => d.usedCapacity),
      borderColor: "rgba(239,68,68,1)",
      backgroundColor: "rgba(239,68,68,0.2)",
      tension: 0.3,
      fill: true,
    },
  ],
};

 const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false, // This is crucial!
  plugins: {
    legend: { 
      position: 'top' as const,
      display: true
    },
    title: { 
      display: true, 
      text: 'Capacity Overview' 
    },
  },
  scales: {
    x: {
      display: true,
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      display: true,
      title: {
        display: true,
        text: 'Capacity'
      },
      beginAtZero: true
    }
  }
};

  return (
    <s-page heading="Dashboard">
      <s-section heading="Capacity Overview">
        <s-box padding="base" background="subdued">
          <div className="flex gap-3 mb-4">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border p-2 rounded-md"
            />
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border p-2 rounded-md"
            />
            <s-button onClick={fetchReport}>Apply Filter</s-button>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <s-card>
              <s-text>Total Capacity   </s-text>
              <s-text>{totalCapacities}</s-text>
            </s-card>
            <s-card>
              <s-text>Used Capacity   </s-text>
              <s-text>{usedCapacities}</s-text>
            </s-card>
            <s-card>
              <s-text>Remaining Capacity   </s-text>
              <s-text>{remainingCapacities}</s-text>
            </s-card>
          </div>

          {loading ? (
            <s-text>Loading report...</s-text>
          ) : data.length > 0 ? (
            <div style={{ height: "400px", width: "100%" }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <s-text>No data available for selected range.</s-text>
          )}
        </s-box>
      </s-section>
    </s-page>
  );
}
