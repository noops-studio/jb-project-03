import React, { useState, useEffect } from "react";
import API from "../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

interface ReportData {
  destination: string;
  followersCount: number;
}

const Reports: React.FC = () => {
  const [data, setData] = useState<ReportData[]>([]);

  useEffect(() => {
    // Fetch report data (JSON)
    API.get("/vacations/report").then(res => {
      setData(res.data);
    }).catch(err => {
      console.error("Failed to fetch report data:", err);
    });
  }, []);

  const downloadCsv = async () => {
    try {
      const response = await API.get("/vacations/report/csv", { responseType: "blob" });
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vacations_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("CSV download failed:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Vacation Followers Report</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="destination" angle={-15} textAnchor="end" height={80} interval={0} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="followersCount" name="Followers" fill="#3498db" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <p className="text-center text-gray-700">No data available.</p>
      )}
      <div className="text-center mt-4">
        <button onClick={downloadCsv} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Download CSV
        </button>
      </div>
    </div>
  );
};

export default Reports;
