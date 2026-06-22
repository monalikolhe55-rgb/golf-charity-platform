// Public-ish page (requires login since draws route is protected) showing all past draws
// and their winners. If the current user won, they can upload proof here.

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

function DrawResults() {
  const [draws, setDraws] = useState([]);
  const [selectedDraw, setSelectedDraw] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, isLoggedIn, isAdmin } = useAuth();

  useEffect(() => {
    api.get('/draws')
      .then((res) => {
        setDraws(res.data);
        if (res.data.length > 0) loadResults(res.data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  function loadResults(draw) {
    setSelectedDraw(draw);
    api.get(`/draws/${draw.id}/results`).then((res) => setResults(res.data));
  }

  async function handleProofUpload(drawResultId, file) {
    const formData = new FormData();
    formData.append('proof', file);

    try {
      await api.post(`/proofs/${drawResultId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Proof uploaded! Waiting for admin approval.');
    } catch (err) {
      alert(err.response?.data?.message || 'Upload failed.');
    }
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">Loading draw results...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Draw Results</h1>
      <p className="text-gray-500 mb-8">See the winning numbers and winners from past draws.</p>

      {draws.length === 0 ? (
        <Card><p className="text-gray-500">No draws have been run yet.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* List of draws on the left */}
          <Card className="md:col-span-1 h-fit">
            <h2 className="font-semibold text-gray-800 mb-3">Past Draws</h2>
            <ul className="space-y-2">
              {draws.map((d) => (
                <li key={d.id}>
                  <button
                    onClick={() => loadResults(d)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                      selectedDraw?.id === d.id ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    {new Date(d.draw_date).toLocaleDateString()}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Selected draw details on the right */}
          <div className="md:col-span-3 space-y-6">
            {selectedDraw && (
              <Card>
                <h2 className="font-semibold text-gray-800 mb-3">Winning Numbers</h2>
                <div className="flex gap-3">
                  {selectedDraw.winning_numbers.map((n, i) => (
                    <span key={i} className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-600 text-white font-bold">
                      {n}
                    </span>
                  ))}
                </div>
                {selectedDraw.jackpot_rolled_over && (
                  <p className="text-sm text-gold-500 mt-3">⚠️ No 5-match winner — jackpot rolled over!</p>
                )}
              </Card>
            )}

            <Card>
              <h2 className="font-semibold text-gray-800 mb-4">Winners</h2>
              {results.length === 0 ? (
                <p className="text-sm text-gray-500">No winners for this draw.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 border-b">
                        <th className="py-2 pr-4">Name</th>
                        <th className="py-2 pr-4">Matches</th>
                        <th className="py-2 pr-4">Prize</th>
                        {isLoggedIn && !isAdmin && <th className="py-2 pr-4">Proof</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((r) => (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-2 pr-4 text-gray-700">{r.user_name}</td>
                          <td className="py-2 pr-4 text-gray-700">{r.match_count} match</td>
                          <td className="py-2 pr-4 font-semibold text-primary-700">₹{Number(r.prize_amount).toLocaleString()}</td>
                          {isLoggedIn && !isAdmin && user?.id === r.user_id && (
                            <td className="py-2 pr-4">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => e.target.files[0] && handleProofUpload(r.id, e.target.files[0])}
                                className="text-xs"
                              />
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

export default DrawResults;
