import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ChartComponent from './ChartComponent';

const DataExplorer = () => {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/datasets`);
      if (response.ok) {
        const data = await response.json();
        setDatasets(data);
        if (data.length > 0) {
          setSelectedDataset(data[0]);
          await fetchVisualizationData(data[0].collection);
        }
      }
    } catch (error) {
      console.error('Error fetching datasets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVisualizationData = async (collection) => {
    setLoading(true);
    try {
      const [vizResponse, insightsResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/visualize/${collection}`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/insights/${collection}`)
      ]);

      if (vizResponse.ok) {
        const vizData = await vizResponse.json();
        setVisualizationData(vizData);
        setChartType(vizData.chart_recommendations?.recommended || 'bar');
      }

      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json();
        setInsights(insightsData);
      }
    } catch (error) {
      console.error('Error fetching visualization data:', error);
      // Set default data to prevent infinite loading
      setVisualizationData({ data: [], chart_recommendations: { recommended: 'bar' } });
      setInsights({ insights: { insight: 'Unable to load insights at this time.' } });
    } finally {
      setLoading(false);
    }
  };

  const handleDatasetChange = (dataset) => {
    setSelectedDataset(dataset);
    fetchVisualizationData(dataset.collection);
  };

  const chartTypes = [
    { value: 'bar', label: 'Bar Chart', icon: '📊' },
    { value: 'line', label: 'Line Chart', icon: '📈' },
    { value: 'pie', label: 'Pie Chart', icon: '🥧' },
    { value: 'doughnut', label: 'Doughnut', icon: '🍩' }
  ];

  if (loading && !selectedDataset) {
    return (
      <div className="min-h-screen bg-slate-900 p-4 md:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="cosmic-orb mb-8"></div>
          <h2 className="text-2xl font-semibold mb-4">Loading Data Explorer...</h2>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Data Explorer
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Dive deep into your datasets with interactive visualizations and AI-powered insights
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Dataset Selection Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bento-card">
              <h2 className="text-lg font-semibold mb-4">Select Dataset</h2>
              <div className="space-y-2">
                {datasets.map((dataset) => (
                  <button
                    key={dataset.collection}
                    onClick={() => handleDatasetChange(dataset)}
                    className={`w-full text-left p-3 rounded-lg transition-all ${
                      selectedDataset?.collection === dataset.collection
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50'
                        : 'bg-slate-700/30 hover:bg-slate-600/30 border border-transparent'
                    }`}
                  >
                    <div className="font-medium text-sm">{dataset.name}</div>
                    <div className="text-xs text-slate-400 mt-1">
                      {dataset.record_count.toLocaleString()} records
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Type Selector */}
            <div className="bento-card mt-6">
              <h3 className="text-lg font-semibold mb-4">Chart Type</h3>
              <div className="grid grid-cols-2 gap-2">
                {chartTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setChartType(type.value)}
                    className={`p-3 rounded-lg text-sm transition-all ${
                      chartType === type.value
                        ? 'bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-500/50'
                        : 'bg-slate-700/30 hover:bg-slate-600/30 border border-transparent'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="font-medium">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            {selectedDataset && (
              <div className="space-y-6">
                {/* Dataset Info */}
                <div className="bento-card">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">{selectedDataset.name}</h2>
                    <span className="text-sm text-slate-400">
                      {selectedDataset.record_count.toLocaleString()} records
                    </span>
                  </div>
                  <p className="text-slate-300">{selectedDataset.description}</p>
                </div>

                {/* Visualization */}
                <div className="bento-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold">Visualization</h3>
                    {loading && (
                      <div className="loading-dots">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    )}
                  </div>
                  
                  {visualizationData && visualizationData.data ? (
                    <div className="h-96">
                      <ChartComponent
                        data={visualizationData.data}
                        chartType={chartType}
                        height={384}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-96 text-slate-400">
                      <div className="text-center">
                        <div className="text-4xl mb-4">📊</div>
                        <div>No visualization data available</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Insights */}
                {insights && (
                  <div className="bento-card">
                    <h3 className="text-xl font-semibold mb-4 flex items-center">
                      <span className="mr-2">🤖</span>
                      AI Insights
                    </h3>
                    
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                      <p className="text-slate-300">{insights.insights.insight}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-300 mb-2">Chart Type</h4>
                        <p className="text-sm text-slate-300 capitalize">
                          {insights.insights.chart_type || 'Bar Chart'}
                        </p>
                      </div>
                      
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-300 mb-2">Trend</h4>
                        <p className="text-sm text-slate-300 capitalize">
                          {insights.insights.trend || 'Stable'}
                        </p>
                      </div>
                      
                      <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                        <h4 className="font-semibold text-green-300 mb-2">Sample Size</h4>
                        <p className="text-sm text-slate-300">
                          {insights.sample_size} records analyzed
                        </p>
                      </div>
                    </div>

                    {insights.insights.key_metrics && insights.insights.key_metrics.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Key Metrics</h4>
                        <div className="flex flex-wrap gap-2">
                          {insights.insights.key_metrics.map((metric, index) => (
                            <span
                              key={index}
                              className="bg-cyan-900/20 text-cyan-300 px-3 py-1 rounded-full text-sm border border-cyan-500/30"
                            >
                              {metric}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {insights.insights.anomalies && insights.insights.anomalies.length > 0 && (
                      <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                        <h4 className="font-semibold text-red-300 mb-2">⚠️ Anomalies Detected</h4>
                        <ul className="text-sm text-red-200 space-y-1">
                          {insights.insights.anomalies.map((anomaly, index) => (
                            <li key={index}>• {anomaly}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;
