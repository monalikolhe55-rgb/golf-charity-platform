// Reports tab: shows platform-wide statistics for the admin.

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../Card';

function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports')
      .then((res) => setReport(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500 text-sm">Loading reports...</p>;
  if (!report) return <p className="text-gray-500 text-sm">Failed to load reports.</p>;

  const stats = [
    { label: 'Total Users', value: report.totalUsers },
    { label: 'Active Subscriptions', value: report.activeSubscriptions },
    { label: 'Total Prize Pool Issued', value: `₹${report.totalPrizePool.toLocaleString()}` },
    { label: 'Total Distributed to Winners', value: `₹${report.totalDistributed.toLocaleString()}` },
    { label: 'Total Draws Run', value: report.totalDraws },
    { label: 'Total Winners', value: report.totalWinners },
  ];

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Charity Contributions Table */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Charity Contributions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 border-b">
                <th className="py-2 pr-4">Charity</th>
                <th className="py-2 pr-4">Donation %</th>
                <th className="py-2 pr-4">Supporters' Total Winnings</th>
                <th className="py-2 pr-4">Donation Amount</th>
              </tr>
            </thead>
            <tbody>
              {report.charityContributions.map((c) => (
                <tr key={c.id} className="border-b last:border-0">
                  <td className="py-2 pr-4 text-gray-700">{c.name}</td>
                  <td className="py-2 pr-4 text-gray-700">{c.donation_percentage}%</td>
                  <td className="py-2 pr-4 text-gray-700">₹{Number(c.total_winnings_by_supporters).toLocaleString()}</td>
                  <td className="py-2 pr-4 font-semibold text-primary-700">₹{Number(c.donation_amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default AdminReports;
