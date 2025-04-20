import { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { FollowerReport } from '../../types';
import { getFollowersReport, downloadCSVReport } from '../../services/reportService';
import LoadingSpinner from '../common/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ReportChart = () => {
  const [reportData, setReportData] = useState<FollowerReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await getFollowersReport();
        setReportData(data);
      } catch (error) {
        console.error('Error fetching report data:', error);
        setError('Failed to load report data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReportData();
  }, []);
  
  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      await downloadCSVReport();
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setError('Failed to download CSV. Please try again.');
    } finally {
      setDownloading(false);
    }
  };
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }
  
  const chartData = {
    labels: reportData.map(item => item.destination),
    datasets: [
      {
        label: 'Number of Followers',
        data: reportData.map(item => item.followersCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)', // primary-500 with opacity
        borderColor: 'rgb(37, 99, 235)', // primary-600
        borderWidth: 1,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Vacation Followers Report',
        font: {
          size: 18,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Followers',
        },
        ticks: {
          precision: 0, // Only show integers
        },
      },
      x: {
        title: {
          display: true,
          text: 'Vacation Destination',
        },
      },
    },
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Vacation Followers Report</h2>
        <button
          onClick={handleDownloadCSV}
          disabled={downloading}
          className={`px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-200 ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {downloading ? 'Downloading...' : 'Download CSV'}
        </button>
      </div>
      
      <div className="h-96">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ReportChart;