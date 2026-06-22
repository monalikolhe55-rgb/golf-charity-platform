// Draws tab: admin can click "Run Draw" to generate winning numbers and find winners,
// and view the history of all past draws.

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../Card';

function AdminDraws() {
  const [draws, setDraws] = useState([]);
  const [running, setRunning] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDraws();
  }, []);

  function loadDraws() {
    api.get('/draws')
      .then((res) => setDraws(res.data))
      .finally(() => setLoading(false));
  }

  async function handleRunDraw() {
    if (!confirm('Run a new draw now? This will generate 5 random numbers and find winners.')) return;
    setRunning(true);
    setLastResult(null);
    try {
      const res = await api.post('/draws/run');
      setLastResult(res.data);
      loadDraws();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to run draw.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Run Draw Button */}
      <Card>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="font-semibold text-gray-800">Run a New Draw</h2>
            <p className="text-sm text-gray-500 mt-1">Generates 5 random numbers and matches them against all user scores.</p>
          </div>
          <button
            onClick={handleRunDraw}
            disabled={running}
            className="bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-lg transition disabled:opacity-50"
          >
            {running ? 'Running...' : 'Run Draw'}
          </button>
        </div>

        {lastResult && (
          <div className="mt-6 bg-primary-50 rounded-lg p-4">
            <p className="font-medium text-primary-700 mb-2">Draw Complete! Winning Numbers:</p>
            <div className="flex gap-2 mb-3">
              {lastResult.draw.winning_numbers.map((n, i) => (
                <span key={i} className="w-9 h-9 flex items-center justify-center rounded-full bg-primary-600 text-white text-sm font-bold">
                  {n}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              5-match winners: {lastResult.summary.fiveMatchWinners} · 4-match: {lastResult.summary.fourMatchWinners} · 3-match: {lastResult.summary.threeMatchWinners}
            </p>
            {lastResult.summary.jackpotRolledOver && (
              <p className="text-sm text-gold-500 mt-1">⚠️ No 5-match winner — jackpot rolled over.</p>
            )}
          </div>
        )}
      </Card>

      {/* Draw History */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Draw History</h2>
        {loading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : draws.length === 0 ? (
          <p className="text-sm text-gray-500">No draws have been run yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Winning Numbers</th>
                  <th className="py-2 pr-4">Prize Pool</th>
                  <th className="py-2 pr-4">Jackpot Rolled Over?</th>
                </tr>
              </thead>
              <tbody>
                {draws.map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-700">{new Date(d.draw_date).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-gray-700">{d.winning_numbers.join(', ')}</td>
                    <td className="py-2 pr-4 text-gray-700">₹{Number(d.prize_pool).toLocaleString()}</td>
                    <td className="py-2 pr-4 text-gray-700">{d.jackpot_rolled_over ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default AdminDraws;
