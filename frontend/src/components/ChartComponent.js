import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const ChartComponent = ({ data, chartType = 'bar', height = 300 }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return null;

    // Extract keys from first data item (excluding common non-numeric fields)
    const firstItem = data[0];
    const excludeKeys = ['_id', 'id', 'name', 'title', 'description', 'category', 'type'];
    
    const numericKeys = Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      return typeof value === 'number' && !excludeKeys.includes(key);
    });

    const stringKeys = Object.keys(firstItem).filter(key => {
      const value = firstItem[key];
      return typeof value === 'string' && !excludeKeys.includes(key);
    });

    // Use first string field as labels, first numeric field as data
    const labelKey = stringKeys[0] || Object.keys(firstItem)[0];
    const dataKey = numericKeys[0] || Object.keys(firstItem).find(k => k !== labelKey);

    if (!dataKey) return null;

    const labels = data.map(item => 
      item[labelKey]?.toString().substring(0, 20) || `Item ${data.indexOf(item) + 1}`
    );
    
    const values = data.map(item => {
      const value = item[dataKey];
      return typeof value === 'number' ? value : 0;
    });

    // Color schemes for different chart types
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(34, 211, 238, 0.8)',   // Cyan
      'rgba(16, 185, 129, 0.8)',   // Green
      'rgba(245, 158, 11, 0.8)',   // Yellow
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(168, 85, 247, 0.8)',   // Violet
    ];

    const borderColors = colors.map(color => color.replace('0.8', '1'));

    if (chartType === 'pie' || chartType === 'doughnut') {
      return {
        labels: labels.slice(0, 8), // Limit for readability
        datasets: [{
          label: dataKey.replace('_', ' ').toUpperCase(),
          data: values.slice(0, 8),
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2,
        }]
      };
    }

    return {
      labels,
      datasets: [{
        label: dataKey.replace('_', ' ').toUpperCase(),
        data: values,
        backgroundColor: chartType === 'line' ? 'rgba(59, 130, 246, 0.1)' : colors[0],
        borderColor: borderColors[0],
        borderWidth: 2,
        fill: chartType === 'line',
        tension: chartType === 'line' ? 0.4 : undefined,
      }]
    };
  }, [data, chartType]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#F1F5F9',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#F1F5F9',
        bodyColor: '#F1F5F9',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
      }
    },
    scales: chartType !== 'pie' && chartType !== 'doughnut' ? {
      x: {
        ticks: {
          color: '#94A3B8',
          font: {
            size: 10
          },
          maxRotation: 45,
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        }
      },
      y: {
        ticks: {
          color: '#94A3B8',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
        }
      }
    } : undefined,
  }), [chartType]);

  if (!chartData) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400">
        <div className="text-center">
          <div className="text-2xl mb-2">📊</div>
          <div className="text-sm">No data available for visualization</div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={options} />;
      case 'pie':
        return <Pie data={chartData} options={options} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={options} />;
      case 'bar':
      default:
        return <Bar data={chartData} options={options} />;
    }
  };

  return (
    <div className="w-full" style={{ height: `${height}px` }}>
      {renderChart()}
    </div>
  );
};

export default ChartComponent;
