import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { getPriceForecast } from '../services/priceForecastService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceForecastChartProps {
  product: {
    _id: string;
    name: string;
    price: number;
    category?: string;
    brand?: string;
    description?: string;
    features?: string[];
    countInStock?: number;
  };
}

const PriceForecastChart: React.FC<PriceForecastChartProps> = ({ product }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<any>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        setLoading(true);
        const forecastData = await getPriceForecast(product);
        setForecast(forecastData);
      } catch (err) {
        console.error('Error fetching price forecast:', err);
        setError('Unable to load price forecast data');
      } finally {
        setLoading(false);
      }
    };

    fetchForecast();

    // Handle window resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [product]);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Price Forecast</h3>
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error || !forecast) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Price Forecast</h3>
        <p className="text-red-500">{error || 'Unable to generate price forecast'}</p>
      </div>
    );
  }

  // Format labels for the chart (month names)
  const labels = forecast.forecastedPrices.map((point: any) => {
    const date = new Date(point.date);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  });

  // Get price data for the chart
  const priceData = forecast.forecastedPrices.map((point: any) => point.price);

  // Include current price at the beginning
  const allLabels = ['Current', ...labels];
  const allPrices = [forecast.currentPrice, ...priceData];

  // Determine the max and min values to set y-axis range
  const maxPrice = Math.max(...allPrices) * 1.1; // 10% higher than max for padding
  const minPrice = Math.min(...allPrices) * 0.9; // 10% lower than min for padding

  // Format chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        min: minPrice,
        max: maxPrice,
        ticks: {
          callback: (value: number) => `$${value}`
        },
        title: {
          display: true,
          text: 'Price (USD)'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Month'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `Price: $${context.parsed.y.toFixed(2)}`
        }
      }
    }
  };

  // Format chart data
  const data = {
    labels: allLabels,
    datasets: [
      {
        label: 'Projected Price',
        data: allPrices,
        borderColor: 'rgb(79, 70, 229)',
        backgroundColor: 'rgba(79, 70, 229, 0.5)',
        borderWidth: 2,
        pointBackgroundColor: 'rgb(79, 70, 229)',
        tension: 0.3,
        fill: {
          target: 'origin',
          above: 'rgba(79, 70, 229, 0.1)'
        }
      }
    ]
  };

  // Find the best month to buy
  const bestMonth = new Date(forecast.bestTimeToBuy + '-01').toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  });

  // Calculate price difference and percentage
  const priceDiff = forecast.highestPrice - forecast.lowestPrice;
  const percentDiff = (priceDiff / forecast.highestPrice) * 100;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Price Forecast</h3>
        <span className="px-2 py-1 text-xs bg-indigo-100 text-indigo-800 rounded-full">
          AI Powered
        </span>
      </div>
      
      <div className="h-64 md:h-80">
        <Line options={options} data={data} />
      </div>
      
      <div className="mt-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded p-3 text-center">
            <p className="text-sm text-gray-500">Predicted Low</p>
            <p className="text-xl font-bold text-indigo-600">${forecast.lowestPrice.toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded p-3 text-center">
            <p className="text-sm text-gray-500">Predicted High</p>
            <p className="text-xl font-bold text-indigo-600">${forecast.highestPrice.toFixed(2)}</p>
          </div>
        </div>
        
        {priceDiff > 0 && (
          <div className="bg-indigo-50 rounded p-4">
            <h4 className="font-medium text-indigo-800 mb-2">Price Insights</h4>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Best time to buy:</span> {bestMonth}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              <span className="font-medium">Potential savings:</span> Up to ${priceDiff.toFixed(2)} ({percentDiff.toFixed(1)}%)
            </p>
            <p className="text-sm text-gray-700 mt-2">
              {forecast.priceInsight}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceForecastChart; 