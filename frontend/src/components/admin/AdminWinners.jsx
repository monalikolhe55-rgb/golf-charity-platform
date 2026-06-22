// Winner Verification tab: admin reviews uploaded proof screenshots,
// approves/rejects them, and marks payments as paid.
// Status flow: Pending -> Approved -> Paid

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../Card';

function AdminWinners() {
  const [proofs, setProofs] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  function loadData() {
    Promise.all([api.get('/proofs'), api.get('/payments')])
      .then(([proofsRes, paymentsRes]) => {
        setProofs(proofsRes.data);
        setPayments(paymentsRes.data);
      })
      .finally(() => setLoading(false));
  }

  async function handleProofStatus(proofId, status) {
    try {
      await api.put(`/proofs/${proofId}/status`, { status });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update proof status.');
    }
  }

  async function handleMarkPaid(paymentId) {
    if (!confirm('Mark this payment as paid?')) return;
    try {
      await api.put(`/payments/${paymentId}/pay`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update payment.');
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Proof Verification */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Winner Proof Uploads</h2>
        {proofs.length === 0 ? (
          <p className="text-sm text-gray-500">No proofs uploaded yet.</p>
        ) : (
          <div className="space-y-4">
            {proofs.map((p) => (
              <div key={p.id} className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0 flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <img
                    src={`http://localhost:5000${p.proof_image_url}`}
                    alt="proof"
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{p.user_name}</p>
                    <p className="text-xs text-gray-500">{p.match_count} match · ₹{Number(p.prize_amount).toLocaleString()}</p>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        p.status === 'approved'
                          ? 'bg-primary-100 text-primary-700'
                          : p.status === 'rejected'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-gold-400/20 text-gold-500'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                </div>
                {p.status === 'pending' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProofStatus(p.id, 'approved')}
                      className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleProofStatus(p.id, 'rejected')}
                      className="bg-red-100 hover:bg-red-200 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Payment Status */}
      <Card>
        <h2 className="font-semibold text-gray-800 mb-4">Payments</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-gray-500">No payments yet. Payments appear here once a proof is approved.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b">
                  <th className="py-2 pr-4">User</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((pay) => (
                  <tr key={pay.id} className="border-b last:border-0">
                    <td className="py-2 pr-4 text-gray-700">{pay.user_name}</td>
                    <td className="py-2 pr-4 text-gray-700">₹{Number(pay.amount).toLocaleString()}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          pay.status === 'paid'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gold-400/20 text-gold-500'
                        }`}
                      >
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {pay.status !== 'paid' && (
                        <button
                          onClick={() => handleMarkPaid(pay.id)}
                          className="text-primary-600 hover:underline text-xs font-medium"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
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

export default AdminWinners;
