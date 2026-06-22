// Lets logged-in users subscribe to a monthly or yearly plan, and shows their current status.

import { useState, useEffect } from 'react';
import api from '../api/axios';
import Card from '../components/Card';

function Subscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSubscription();
  }, []);

  function loadSubscription() {
    api.get('/subscriptions/me')
      .then((res) => setSubscription(res.data.subscription))
      .finally(() => setLoading(false));
  }

  async function handleSubscribe(planType) {
    setSubscribing(true);
    setMessage('');
    try {
      await api.post('/subscriptions', { plan_type: planType });
      setMessage(`Successfully subscribed to the ${planType} plan!`);
      loadSubscription();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Subscription failed.');
    } finally {
      setSubscribing(false);
    }
  }

  const isActive = subscription?.status === 'active';

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription Plans</h1>
      <p className="text-gray-500 mb-8">Subscribe to start logging scores and joining monthly draws.</p>

      {message && (
        <div className="bg-primary-50 text-primary-700 text-sm px-4 py-2 rounded-lg mb-6">{message}</div>
      )}

      {/* Current status */}
      {!loading && (
        <Card className="mb-8">
          <h2 className="font-semibold text-gray-800 mb-2">Current Status</h2>
          {subscription ? (
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  isActive ? 'bg-primary-100 text-primary-700' : 'bg-red-100 text-red-600'
                }`}
              >
                {isActive ? 'Active' : 'Expired'}
              </span>
              <span className="text-gray-500 text-sm capitalize">
                {subscription.plan_type} plan · expires {new Date(subscription.end_date).toLocaleDateString()}
              </span>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">You don't have a subscription yet.</p>
          )}
        </Card>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-xl font-bold text-gray-800">Monthly Plan</h3>
          <p className="text-3xl font-extrabold text-primary-600 my-3">₹499<span className="text-base text-gray-400 font-normal">/mo</span></p>
          <ul className="text-sm text-gray-500 space-y-2 mb-6">
            <li>✓ Add up to 5 scores</li>
            <li>✓ Join monthly draws</li>
            <li>✓ Support your chosen charity</li>
          </ul>
          <button
            onClick={() => handleSubscribe('monthly')}
            disabled={subscribing}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            Subscribe Monthly
          </button>
        </Card>

        <Card className="border-gold-400 border-2">
          <span className="bg-gold-400 text-xs font-bold text-white px-2 py-1 rounded-full">BEST VALUE</span>
          <h3 className="text-xl font-bold text-gray-800 mt-3">Yearly Plan</h3>
          <p className="text-3xl font-extrabold text-primary-600 my-3">₹4,999<span className="text-base text-gray-400 font-normal">/yr</span></p>
          <ul className="text-sm text-gray-500 space-y-2 mb-6">
            <li>✓ Add up to 5 scores</li>
            <li>✓ Join monthly draws all year</li>
            <li>✓ Support your chosen charity</li>
            <li>✓ Save compared to monthly</li>
          </ul>
          <button
            onClick={() => handleSubscribe('yearly')}
            disabled={subscribing}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-50"
          >
            Subscribe Yearly
          </button>
        </Card>
      </div>
    </div>
  );
}

export default Subscription;
