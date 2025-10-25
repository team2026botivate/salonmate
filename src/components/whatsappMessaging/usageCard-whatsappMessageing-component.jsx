import { TrendingUp, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function UsageChart({ data }) {
  const [animatedHeights, setAnimatedHeights] = useState([]);

  const maxMessages = Math.max(...data.map((d) => d.messages), 1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedHeights(data.map((d) => (d.messages / maxMessages) * 100));
    }, 100);
    return () => clearTimeout(timer);
  }, [data, maxMessages]);

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center text-2xl font-bold text-gray-800">
          <TrendingUp className="mr-2 h-6 w-6 text-green-600" />
          Message Usage Trend
        </h2>
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="mr-2 h-4 w-4" />
          Last 7 days
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-12 text-center text-gray-500">No usage data available yet</div>
      ) : (
        <>
          <div className="mb-4 flex h-64 items-end justify-between space-x-2 md:space-x-4">
            {data.map((point, index) => (
              <div key={index} className="group flex flex-1 flex-col items-center">
                <div className="relative w-full">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <div className="rounded-lg bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white">
                      {point.messages} messages
                    </div>
                  </div>

                  <div
                    className="flex w-full items-end overflow-hidden rounded-t-lg bg-gray-100"
                    style={{ height: '100%' }}
                  >
                    <div
                      className="w-full cursor-pointer rounded-t-lg bg-gradient-to-t from-green-500 to-green-400 transition-all duration-700 ease-out hover:from-green-600 hover:to-green-500"
                      style={{
                        height: `${animatedHeights[index] || 0}%`,
                        minHeight: point.messages > 0 ? '8%' : '0',
                      }}
                    >
                      <div className="h-full w-full bg-gradient-to-t from-transparent to-white/20"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between space-x-2 border-t-2 border-gray-200 pt-2 md:space-x-4">
            {data.map((point, index) => (
              <div key={index} className="flex-1 text-center">
                <span className="block text-xs font-medium text-gray-600">
                  {new Date(point.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-4">
              <p className="mb-1 text-xs text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-800">
                {data.reduce((sum, d) => sum + d.messages, 0).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-4">
              <p className="mb-1 text-xs text-gray-600">Average</p>
              <p className="text-xl font-bold text-gray-800">
                {Math.round(
                  data.reduce((sum, d) => sum + d.messages, 0) / data.length
                ).toLocaleString()}
              </p>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-4">
              <p className="mb-1 text-xs text-gray-600">Peak</p>
              <p className="text-xl font-bold text-gray-800">
                {Math.max(...data.map((d) => d.messages)).toLocaleString()}
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
