'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StockHolding {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  change: number;
}

export default function PortfolioPage() {
  const [holdings, setHoldings] = useState<StockHolding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch from your backend API
    const fetchPortfolio = async () => {
      try {
        // Mock data - replace with actual API call
        const mockHoldings: StockHolding[] = [
          {
            symbol: 'AAPL',
            name: 'Apple Inc.',
            shares: 10,
            purchasePrice: 175.50,
            currentPrice: 188.25,
            change: 7.26,
          },
          {
            symbol: 'MSFT',
            name: 'Microsoft Corporation',
            shares: 5,
            purchasePrice: 320.75,
            currentPrice: 338.42,
            change: 5.51,
          },
          {
            symbol: 'GOOGL',
            name: 'Alphabet Inc.',
            shares: 3,
            purchasePrice: 135.20,
            currentPrice: 132.45,
            change: -2.03,
          },
          {
            symbol: 'AMZN',
            name: 'Amazon.com Inc.',
            shares: 8,
            purchasePrice: 145.30,
            currentPrice: 152.80,
            change: 5.16,
          },
          {
            symbol: 'TSLA',
            name: 'Tesla, Inc.',
            shares: 4,
            purchasePrice: 210.50,
            currentPrice: 198.75,
            change: -5.58,
          },
        ];

        // Calculate total value and gain
        let value = 0;
        let cost = 0;
        
        mockHoldings.forEach(stock => {
          value += stock.currentPrice * stock.shares;
          cost += stock.purchasePrice * stock.shares;
        });
        
        const gain = value - cost;
        const gainPercentage = (gain / cost) * 100;

        // Simulate API delay
        setTimeout(() => {
          setHoldings(mockHoldings);
          setTotalValue(value);
          setTotalGain(gainPercentage);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching portfolio:', error);
        setIsLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">My Portfolio</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Portfolio Value</h2>
          <p className="text-3xl font-bold text-blue-600">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <div className={`mt-2 flex items-center ${totalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span className="text-lg font-semibold">
              {totalGain >= 0 ? '+' : ''}{totalGain.toFixed(2)}%
            </span>
            <svg 
              className="w-5 h-5 ml-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d={totalGain >= 0 ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
              />
            </svg>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/trade"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Buy Stocks
            </Link>
            <Link
              href="/watchlist"
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              View Watchlist
            </Link>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Your Holdings</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shares</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Change</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {holdings.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{stock.symbol}</div>
                        <div className="text-sm text-gray-500">{stock.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{stock.shares}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${stock.purchasePrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${stock.currentPrice.toFixed(2)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${stock.change >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(stock.currentPrice * stock.shares).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
