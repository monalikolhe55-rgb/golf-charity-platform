// The landing page - first thing visitors see.

import { Link } from 'react-router-dom';

function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-5xl font-extrabold mb-6">
            Play Golf. Support Charity. Win Big. ⛳
          </h1>
          <p className="text-lg text-primary-50 max-w-2xl mx-auto mb-8">
            Subscribe, log your golf scores, support a charity close to your heart,
            and get a chance to win monthly cash prizes — all while making a difference.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              to="/charities"
              className="bg-primary-800/40 border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-800/60 transition"
            >
              View Charities
            </Link>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { emoji: '💳', title: 'Subscribe', desc: 'Choose a monthly or yearly plan to get started.' },
            { emoji: '❤️', title: 'Pick a Charity', desc: 'Select a charity you care about to support.' },
            { emoji: '⛳', title: 'Log Scores', desc: 'Add your golf scores after every round you play.' },
            { emoji: '🏆', title: 'Win Prizes', desc: 'Match your scores with the monthly draw numbers!' },
          ].map((step) => (
            <div key={step.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="text-4xl mb-3">{step.emoji}</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">{step.title}</h3>
              <p className="text-gray-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Prize Breakdown */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Monthly Prize Pool: ₹1,00,000</h2>
          <p className="text-gray-500 mb-10">Split between winners based on how many numbers they match.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gold-400/40 p-6">
              <p className="text-3xl font-bold text-gold-500">40%</p>
              <p className="text-gray-600 mt-2">5 Number Match</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-3xl font-bold text-primary-600">35%</p>
              <p className="text-gray-600 mt-2">4 Number Match</p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-3xl font-bold text-primary-600">25%</p>
              <p className="text-gray-600 mt-2">3 Number Match</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
