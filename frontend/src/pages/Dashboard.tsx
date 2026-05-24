import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const Dashboard: React.FC = () => {
  // Dashboard page component
  const { user, isCreator } = useAuth();
  const [searchParams] = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);

  useEffect(() => {
    // Check if coming from successful payment
    if (searchParams.get('paymentSuccess') === 'true') {
      setShowPaymentSuccess(true);
      toast.success(`🎉 ${SYSTEM_MESSAGES.dashboardPaymentSuccessToast}`);
      // Clear the query parameter from URL
      window.history.replaceState({}, document.title, '/dashboard');
    }

    if (searchParams.get('verified') === 'true') {
      setShowVerificationSuccess(true);
      toast.success(`✅ ${SYSTEM_MESSAGES.dashboardVerificationToast}`);
      window.history.replaceState({}, document.title, '/dashboard');
    }
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen bg-cream-light dark:bg-gray-900">
      <Navbar />
      <div className="flex-1">
        <section className="dashboard-hero">
          <div className="dashboard-grid" />
          <div className="dashboard-orb dashboard-orb--one" />
          <div className="dashboard-orb dashboard-orb--two" />
          <div className="dashboard-orb dashboard-orb--three" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 relative z-10">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-1">
                <p className="text-sm uppercase tracking-wide text-white/80">Dashboard</p>
                <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="mt-4 text-white/85 max-w-xl">
                  {isCreator
                    ? 'Launch faster, track performance in real time, and keep attendees engaged.'
                    : 'Stay on top of your tickets, reminders, and the next event on your list.'}
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  {isCreator ? (
                    <>
                      <Link to="/events/create" className="dash-button dash-button--light">
                        Create Event
                      </Link>
                      <Link to="/analytics" className="dash-button dash-button--ghost">
                        View Analytics
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link to="/events" className="dash-button dash-button--light">
                        Discover Events
                      </Link>
                      <Link to="/my-tickets" className="dash-button dash-button--ghost">
                        My Tickets
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="dashboard-glass p-6 rounded-2xl w-full lg:w-[320px]">
                <p className="text-white/80 text-xs uppercase tracking-wide">Today</p>
                <h2 className="mt-2 text-xl font-semibold text-white">Your snapshot</h2>
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="dashboard-mini">
                    <p className="text-xs text-white/70">Views</p>
                    <p className="text-lg font-bold text-white">4.2k</p>
                  </div>
                  <div className="dashboard-mini">
                    <p className="text-xs text-white/70">Tickets</p>
                    <p className="text-lg font-bold text-white">128</p>
                  </div>
                  <div className="dashboard-mini">
                    <p className="text-xs text-white/70">Checks</p>
                    <p className="text-lg font-bold text-white">92%</p>
                  </div>
                </div>
                <div className="mt-4 dashboard-progress">
                  <div className="dashboard-progress__fill" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          {showPaymentSuccess && (
            <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-700 rounded-lg">
              <p className="text-green-800 dark:text-green-200">
                ✅ Your ticket has been issued successfully! Go to "My Tickets" to view your purchased ticket.
              </p>
            </div>
          )}

          {showVerificationSuccess && (
            <div className="mb-6 p-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-700 rounded-lg">
              <p className="text-blue-800 dark:text-blue-200">
                ✅ {SYSTEM_MESSAGES.dashboardVerificationBanner}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isCreator ? (
              <>
                <Link to="/events/create" className="dash-card dash-card--pulse">
                  <div className="dash-icon dash-icon--amber">➕</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Create Event</h2>
                  <p className="text-gray-600 dark:text-gray-400">Create a new event and start selling tickets</p>
                </Link>

                <Link to="/my-events" className="dash-card">
                  <div className="dash-icon dash-icon--sky">📋</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My Events</h2>
                  <p className="text-gray-600 dark:text-gray-400">View and manage your created events</p>
                </Link>

                <Link to="/verify-tickets" className="dash-card">
                  <div className="dash-icon dash-icon--emerald">✅</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verify Tickets</h2>
                  <p className="text-gray-600 dark:text-gray-400">Scan QR codes and verify your event tickets</p>
                </Link>
              </>
            ) : (
              <>
                <Link to="/events" className="dash-card dash-card--pulse">
                  <div className="dash-icon dash-icon--amber">🎉</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Browse Events</h2>
                  <p className="text-gray-600 dark:text-gray-400">Discover amazing events happening near you</p>
                </Link>

                <Link to="/my-tickets" className="dash-card">
                  <div className="dash-icon dash-icon--violet">🎫</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">My Tickets</h2>
                  <p className="text-gray-600 dark:text-gray-400">View your purchased tickets and QR codes</p>
                </Link>

                <Link to="/events" className="dash-card">
                  <div className="dash-icon dash-icon--rose">✨</div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">New this week</h2>
                  <p className="text-gray-600 dark:text-gray-400">See trending events curated for you</p>
                </Link>
              </>
            )}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="dash-card dash-card--highlight">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quick Stats</h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isCreator
                ? 'Visit Analytics to see your event performance metrics'
                : 'Visit My Tickets to see all your upcoming events'}
            </p>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
