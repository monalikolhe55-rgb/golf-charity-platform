// Charities tab: admin can add, edit, and delete charities.

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../Card';

const EMPTY_FORM = { name: '', description: '', donation_percentage: 10 };

function AdminCharities() {
  const [charities, setCharities] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null); // null = adding new, otherwise id of charity being edited
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCharities();
  }, []);

  function loadCharities() {
    api.get('/charities')
      .then((res) => setCharities(res.data))
      .finally(() => setLoading(false));
  }

  function startEdit(charity) {
    setEditingId(charity.id);
    setForm({
      name: charity.name,
      description: charity.description || '',
      donation_percentage: charity.donation_percentage,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/charities/${editingId}`, form);
      } else {
        await api.post('/charities', form);
      }
      cancelEdit();
      loadCharities();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save charity.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this charity? Users supporting it will be unassigned.')) return;
    try {
      await api.delete(`/charities/${id}`);
      loadCharities();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete charity.');
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading charities...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Add/Edit Form */}
      <Card className="md:col-span-1 h-fit">
        <h2 className="font-semibold text-gray-800 mb-4">{editingId ? 'Edit Charity' : 'Add Charity'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Donation %</label>
            <input
              type="number"
              min={0}
              max={100}
              required
              value={form.donation_percentage}
              onChange={(e) => setForm({ ...form, donation_percentage: Number(e.target.value) })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            />
          </div>
          <div className="flex gap-3">
            <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg">
              {editingId ? 'Save Changes' : 'Add Charity'}
            </button>
            {editingId && (
              <button type="button" onClick={cancelEdit} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg">
                Cancel
              </button>
            )}
          </div>
        </form>
      </Card>

      {/* Charity List */}
      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {charities.map((c) => (
          <Card key={c.id}>
            <h3 className="font-semibold text-gray-800">{c.name}</h3>
            <p className="text-sm text-gray-500 mt-1">{c.description}</p>
            <p className="text-sm text-primary-600 font-medium mt-2">{c.donation_percentage}% donated</p>
            <div className="flex gap-3 mt-4 text-sm">
              <button onClick={() => startEdit(c)} className="text-primary-600 hover:underline">Edit</button>
              <button onClick={() => handleDelete(c.id)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default AdminCharities;
