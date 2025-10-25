import { CreditCard, TrendingUp, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function TransactionHistory({ transactions }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl md:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="flex items-center text-2xl font-bold text-gray-800">
          <TrendingUp className="mr-2 h-6 w-6 text-green-600" />
          Transaction History
        </h2>
        <span className="text-sm text-gray-500">{transactions.length} records</span>
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Amount</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Messages Added
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">
                Payment Method
              </th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No transactions yet
                </td>
              </tr>
            ) : (
              transactions.map((transaction) => (
                <tr
                  key={transaction.id}
                  className="border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                      {new Date(transaction.transaction_date).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center font-semibold text-gray-800">
                      ₹{transaction.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center font-medium text-green-600">
                      +{transaction.messages_added.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center text-sm text-gray-600 capitalize">
                      <CreditCard className="mr-2 h-4 w-4 text-gray-400" />
                      {transaction.payment_method}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadge(transaction.transaction_status)}`}
                      >
                        {getStatusIcon(transaction.transaction_status)}
                        <span className="ml-1 capitalize">{transaction.transaction_status}</span>
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 md:hidden">
        {transactions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">No transactions yet</div>
        ) : (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="rounded-xl border border-gray-200 bg-gradient-to-r from-gray-50 to-white p-4 transition-all duration-200 hover:shadow-md"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  {new Date(transaction.transaction_date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusBadge(transaction.transaction_status)}`}
                >
                  {getStatusIcon(transaction.transaction_status)}
                  <span className="ml-1 capitalize">{transaction.transaction_status}</span>
                </span>
              </div>

              <div className="mb-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-800">
                  ₹{transaction.amount.toFixed(2)}
                </span>
                <span className="font-semibold text-green-600">
                  +{transaction.messages_added.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center text-sm text-gray-500 capitalize">
                <CreditCard className="mr-2 h-4 w-4" />
                {transaction.payment_method}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
