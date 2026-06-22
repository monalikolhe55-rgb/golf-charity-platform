// Shows all available charities. If the user is logged in, they can select/change their charity.

import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

function Charities() {
  const [charities, setCharities] = useState([]);
  const [message, setMessage] = useState('');
  const { isLoggedIn, isAdmin, user } = useAuth();

  useEffect(() => {
    loadCharities();
  }, []);

  function loadCharities() {
    api.get('/charities').then((res) => setCharities(res.data));
  }

  async function handleSelect(charityId) {
    try {
      await api.put('/charities/select', { charity_id: charityId });
      setMessage('Charity updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update charity.');
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Charity Partners</h1>
      <p className="text-gray-500 mb-8">Choose the cause you'd like your winnings to support.</p>

      {message && (
        <div className="bg-primary-50 text-primary-700 text-sm px-4 py-2 rounded-lg mb-6">{message}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {charities.map((charity) => (
          <Card key={charity.id} className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-800">{charity.name}</h3>
            <p className="text-gray-500 text-sm mt-2 flex-1">{charity.description}</p>
            <p className="text-sm text-primary-600 font-medium mt-4">
              {charity.donation_percentage}% of winnings donated
            </p>

            {isLoggedIn && !isAdmin && (
              <button
                onClick={() => handleSelect(charity.id)}
                disabled={user?.charity_id === charity.id}
                className="mt-4 w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium py-2 rounded-lg transition"
              >
                {user?.charity_id === charity.id ? 'Currently Supporting' : 'Support this Charity'}
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

export default Charities;
