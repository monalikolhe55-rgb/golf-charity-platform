// Users tab: admin can view, edit, and delete users.

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Card from '../Card';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null); // user object currently being edited
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  function loadUsers() {
    api.get('/admin/users')
      .then((res) => setUsers(res.data))
      .finally(() => setLoading(false));
  }

  async function handleDelete(userId) {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  }

  async function handleSaveEdit(e) {
    e.preventDefault();
    try {
      await api.put(`/admin/users/${editingUser.id}`, {
        name: editingUser.name,
        email: editingUser.email,
      });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user.');
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading users...</p>;

  return (
    <Card>
      <h2 className="font-semibold text-gray-800 mb-4">All Users ({users.length})</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 border-b">
              <th className="py-2 pr-4">Name</th>
              <th className="py-2 pr-4">Email</th>
              <th className="py-2 pr-4">Charity</th>
              <th className="py-2 pr-4">Joined</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0">
                <td className="py-2 pr-4 text-gray-700">{u.name}</td>
                <td className="py-2 pr-4 text-gray-700">{u.email}</td>
                <td className="py-2 pr-4 text-gray-700">{u.charity_name || '—'}</td>
                <td className="py-2 pr-4 text-gray-700">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="py-2 pr-4 space-x-3">
                  <button onClick={() => setEditingUser(u)} className="text-primary-600 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-gray-800 mb-4">Edit User</h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2"
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Card>
  );
}

export default AdminUsers;
