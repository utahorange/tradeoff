'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// More detailed sample data for the portfolio
const sampleData = [
  { date: '2024-01-01', value: 10000 },
  { date: '2024-01-08', value: 10200 },
  { date: '2024-01-15', value: 10100 },
  { date: '2024-01-22', value: 10300 },
  { date: '2024-01-29', value: 10400 },
  { date: '2024-02-05', value: 10500 },
  { date: '2024-02-12', value: 10600 },
  { date: '2024-02-19', value: 10700 },
  { date: '2024-02-26', value: 10800 },
  { date: '2024-03-04', value: 10900 },
  { date: '2024-03-11', value: 11000 },
  { date: '2024-03-18', value: 10900 },
  { date: '2024-03-25', value: 10800 },
  { date: '2024-04-01', value: 10900 },
  { date: '2024-04-08', value: 11100 },
  { date: '2024-04-15', value: 11200 },
  { date: '2024-04-22', value: 11300 },
  { date: '2024-04-29', value: 11400 },
  { date: '2024-05-06', value: 11500 },
  { date: '2024-05-13', value: 11600 },
  { date: '2024-05-20', value: 11700 },
  { date: '2024-05-27', value: 11800 },
  { date: '2024-06-03', value: 11900 },
  { date: '2024-06-10', value: 12000 },
];

export default function Home() {
  const [timeRange, setTimeRange] = useState('6M');
  const [currentValue, setCurrentValue] = useState(sampleData[sampleData.length - 1].value);
  const [previousValue, setPreviousValue] = useState(sampleData[sampleData.length - 2].value);

  const calculatePercentageChange = (current: number, previous: number) => {
    return ((current - previous) / previous) * 100;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Portfolio Dashboard</h1>
        
        {/* Time range selector */}
        <div className="mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {['1M', '3M', '6M', '1Y', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  timeRange === range
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Portfolio Value Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-2">Portfolio Value</h2>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(currentValue)}</p>
          <p className={`text-sm ${currentValue >= previousValue ? 'text-green-600' : 'text-red-600'}`}>
            {currentValue >= previousValue ? '+' : ''}
            {calculatePercentageChange(currentValue, previousValue).toFixed(2)}% from previous value
          </p>
        </div>

        {/* Portfolio Graph */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Performance</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={sampleData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
                onMouseMove={(e) => {
                  if (e.activePayload) {
                    const currentData = e.activePayload[0].payload;
                    setCurrentValue(currentData.value);
                    const currentIndex = sampleData.findIndex(d => d.date === currentData.date);
                    if (currentIndex > 0) {
                      setPreviousValue(sampleData[currentIndex - 1].value);
                    }
                  }
                }}
                onMouseLeave={() => {
                  setCurrentValue(sampleData[sampleData.length - 1].value);
                  setPreviousValue(sampleData[sampleData.length - 2].value);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                  tickCount={6}
                />
                <YAxis 
                  tickFormatter={(value) => formatCurrency(value)}
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Portfolio Value']}
                  labelFormatter={formatDate}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #f0f0f0',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                  activeDot={{ r: 4 }}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
