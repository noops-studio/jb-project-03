import React, { useState, useEffect } from "react";
import API from "../api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

interface ReportData {
  destination: string;
  followersCount: number;
}

const Reports: React.FC = () => {
  const [data, setData] = useState<ReportData[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch report data (JSON)
    setLoading(true);
    setError(null);
    
    API.get("/vacations/report")
      .then(res => {
        console.log("Report data received:", res.data);
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch report data:", err);
        
        // Extract error message
        let errorMsg = "Failed to load report data";
        if (err.response) {
          errorMsg = `Error ${err.response.status}: ${err.response.data?.message || 'Unknown error'}`;
          console.error("Response details:", err.response.data);
        }
        
        setError(errorMsg);
        setLoading(false);
      });
  }, []);

  const [csvLoading, setCsvLoading] = useState(false);
  const [csvError, setCsvError] = useState<string | null>(null);

  const downloadCsv = async () => {
    try {
      setCsvLoading(true);
      setCsvError(null);
      console.log("Requesting CSV report...");
      
      const response = await API.get("/vacations/report/csv", { 
        responseType: "blob",
        timeout: 10000 // 10 second timeout
      });
      
      console.log("CSV response received:", response.status);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vacations_report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Cleanup
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      setCsvLoading(false);
    } catch (err: any) {
      console.error("CSV download failed:", err);
      
      let errorMsg = "Failed to download CSV";
      if (err.response) {
        errorMsg = `Error ${err.response.status}: ${err.response.data?.message || 'Unknown error'}`;
      } else if (err.message) {
        errorMsg = `Error: ${err.message}`;
      }
      
      setCsvError(errorMsg);
      setCsvLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Vacation Followers Report</h2>
      
      {loading ? (
        <div className="text-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading report data...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : data.length > 0 ? (
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
        <p className="text-center text-gray-700">No data available. Try adding followers to vacations first.</p>
      )}
      
      <div className="text-center mt-4">
        {csvError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">CSV Error: </strong>
            <span className="block sm:inline">{csvError}</span>
          </div>
        )}
        
        <button 
          onClick={downloadCsv} 
          disabled={loading || !!error || data.length === 0 || csvLoading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {csvLoading ? (
            <>
              <span className="inline-block mr-2 h-4 w-4 rounded-full border-t-2 border-white animate-spin"></span>
              Downloading...
            </>
          ) : "Download CSV"}
        </button>
      </div>
    </div>
  );
};

export default Reports;
