// The User Dashboard - the main hub for a logged-in user.
// Shows profile, subscription status, charity, latest scores, and draw/winnings history.
// Also lets the user add a new score.

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Card';

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state for adding a new score
  const [score, setScore] = useState('');
  const [scoreDate, setScoreDate] = useState('');
  const [scoreMessage, setScoreMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  function loadDashboard() {
    api.get('/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }

  async function handleAddScore(e) {
    e.preventDefault();
    setScoreMessage('');
    setSubmitting(true);

    try {
      await api.post('/scores', { score: Number(score), score_date: scoreDate });
      setScoreMessage('Score added successfully!');
      setScore('');
      setScoreDate('');
      loadDashboard(); // refresh everything to show the new score
    } catch (err) {
      setScoreMessage(err.response?.data?.message || 'Failed to add score.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="max-w-6xl mx-auto px-4 py-16 text-center text-gray-500">Loading dashboard...</div>;
  }

  const { profile, subscription, scores, drawHistory } = data;
  const isActive = subscription?.status === 'active';

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">Profile</h2>
          <p className="text-sm text-gray-500">Name: <span className="text-gray-800">{profile.name}</span></p>
          <p className="text-sm text-gray-500 mt-1">Email: <span className="text-gray-800">{profile.email}</span></p>
          <p className="text-sm text-gray-500 mt-1">
            Joined: <span className="text-gray-800">{new Date(profile.created_at).toLocaleDateString()}</span>
          </p>
        </Card>

        {/* Subscription Card */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">Subscription</h2>
          {subscription ? (
            <>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${isActive ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-600'}`}>
                {isActive ? 'Active' : 'Expired'}
              </span>
              <p className="text-sm text-gray-500 mt-3 capitalize">{subscription.plan_type} plan</p>
              <p className="text-sm text-gray-500">Expires: {new Date(subscription.end_date).toLocaleDateString()}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No active subscription.</p>
          )}
        </Card>

        {/* Charity Card */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-3">Supporting</h2>
          {profile.charity_name ? (
            <>
              <p className="text-gray-800 font-medium">{profile.charity_name}</p>
              <p className="text-sm text-gray-500 mt-1">{profile.donation_percentage}% of winnings donated</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No charity selected yet.</p>
          )}
        </Card>
      </div>

      {/* Restriction notice for inactive users */}
      {!isActive && (
        <div className="bg-gold-400/10 border border-gold-400/40 text-gray-700 text-sm px-4 py-3 rounded-lg mb-8">
          Your subscription is inactive. Subscribe to start adding scores and join draws.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Add Score Form */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Add a Score</h2>

          {scoreMessage && (
            <div className="bg-primary-50 text-primary-700 text-sm px-3 py-2 rounded-lg mb-4">{scoreMessage}</div>
          )}

          <form onSubmit={handleAddScore} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Score (1–45)</label>
              <input
                type="number"
                min={1}
                max={45}
                required
                disabled={!isActive}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                required
                disabled={!isActive}
                value={scoreDate}
                onChange={(e) => setScoreDate(e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-50"
              />
            </div>
            <button
              type="submit"
              disabled={!isActive || submitting}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add Score'}
            </button>
            <p className="text-xs text-gray-400">Only your latest 5 scores are kept — older ones are removed automatically.</p>
          </form>
        </Card>

        {/* Score List */}
        <Card>
          <h2 className="font-semibold text-gray-800 mb-4">Latest Scores</h2>
          {scores.length === 0 ? (
            <p className="text-sm text-gray-500">No scores added yet.</p>
          ) : (
            <ul className="space-y-2">
              {scores.map((s) => (
                <li key={s.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-4 py-2">
                  <span className="text-gray-700 text-sm">{new Date(s.score_date).toLocaleDateString()}</span>
                  <span className="font-semibold text-primary-700">{s.score}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Draw History */}
      <Card className="mt-6">
        <h2 className="font-semibold text-gray-800 mb-4">Draw Participation & Winnings History</h2>
        {drawHistory.length === 0 ? (
          <p className="text-sm text-gray-500">You haven't won any draws yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="py-2 pr-4">Draw Date</th>
                  <th className="py-2 pr-4">Winning Numbers</th>
                  <th className="py-2 pr-4">Matches</th>
                  <th className="py-2 pr-4">Prize Won</th>
                </tr>
              </thead>
              <tbody>
                {drawHistory.map((d) => (
                  <tr key={d.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-700">{new Date(d.draw_date).toLocaleDateString()}</td>
                    <td className="py-2 pr-4 text-gray-700">{d.winning_numbers.join(', ')}</td>
                    <td className="py-2 pr-4 text-gray-700">{d.match_count} match</td>
                    <td className="py-2 pr-4 font-semibold text-primary-700">₹{Number(d.prize_amount).toLocaleString()}</td>
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

export default Dashboard;
