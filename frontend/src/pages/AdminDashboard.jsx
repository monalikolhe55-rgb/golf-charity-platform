// The Admin Dashboard - one page with tabs for each admin function:
// Users, Charities, Draws, Winner Verification, and Reports.
// Kept as a single page with tabs to keep navigation simple for a beginner project.

import { useState } from 'react';
import AdminUsers from '../components/admin/AdminUsers';
import AdminCharities from '../components/admin/AdminCharities';
import AdminDraws from '../components/admin/AdminDraws';
import AdminWinners from '../components/admin/AdminWinners';
import AdminReports from '../components/admin/AdminReports';

const TABS = [
  { key: 'reports', label: 'Reports' },
  { key: 'users', label: 'Users' },
  { key: 'charities', label: 'Charities' },
  { key: 'draws', label: 'Draws' },
  { key: 'winners', label: 'Winner Verification' },
];

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('reports');

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
              activeTab === tab.key
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      {activeTab === 'reports' && <AdminReports />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'charities' && <AdminCharities />}
      {activeTab === 'draws' && <AdminDraws />}
      {activeTab === 'winners' && <AdminWinners />}
    </div>
  );
}

export default AdminDashboard;
