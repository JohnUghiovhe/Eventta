import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-rose-500 to-sky-500">
          <div className="hero-grid" />
          <div className="hero-orb hero-orb--one" />
          <div className="hero-orb hero-orb--two" />
          <div className="hero-orb hero-orb--three" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-28 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-left">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 text-white text-sm font-semibold tracking-wide hero-pill">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-300" />
                  Live events, instant tickets
                </div>

                <div className="mt-6">
                  <div className="relative inline-block">
                    <div className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight hero-title">
                      <span className="text-white">{SYSTEM_MESSAGES.appName}</span>
                      <span className="block bg-gradient-to-r from-yellow-200 via-white to-yellow-200 bg-clip-text text-transparent">
                        feels electric.
                      </span>
                    </div>
                    <div className="absolute inset-0 blur-xl opacity-30 bg-gradient-to-r from-yellow-200 via-amber-100 to-rose-200" />
                  </div>
                </div>

                <p className="mt-6 text-base sm:text-lg text-white/90 max-w-xl hero-description">
                  Discover concerts, conferences, sports, and culture with a booking flow that feels effortless. Build your event
                  life in one place with smart reminders, seamless payments, and instant sharing.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/events"
                    className="px-7 py-3 rounded-md bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-all shadow-lg"
                  >
                    Explore Events
                  </Link>
                  <Link
                    to="/register"
                    className="px-7 py-3 rounded-md border border-white/70 text-white font-semibold hover:bg-white hover:text-slate-900 transition-all"
                  >
                    Start Creating
                  </Link>
                </div>

                <div className="mt-10 grid grid-cols-3 gap-6 text-white/90">
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">2k+</p>
                    <p className="text-sm">Active events</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">98%</p>
                    <p className="text-sm">Check-in success</p>
                  </div>
                  <div>
                    <p className="text-2xl sm:text-3xl font-bold">24/7</p>
                    <p className="text-sm">Discovery flow</p>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="glass-card p-6 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80 text-sm">Featured Tonight</span>
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs">Live</span>
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-white">Skyline Beats Festival</h3>
                  <p className="mt-2 text-white/75 text-sm">Eko Atlantic, Lagos · 7:00 PM</p>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-white/15 p-4">
                      <p className="text-white/70 text-xs">Tickets left</p>
                      <p className="text-white text-xl font-bold">128</p>
                    </div>
                    <div className="rounded-lg bg-white/15 p-4">
                      <p className="text-white/70 text-xs">From</p>
                      <p className="text-white text-xl font-bold">N12,000</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-white/80" />
                      <div className="w-8 h-8 rounded-full bg-white/70" />
                      <div className="w-8 h-8 rounded-full bg-white/60" />
                    </div>
                    <p className="text-white/80 text-sm">420+ attendees interested</p>
                  </div>
                </div>

                <div className="absolute -bottom-8 -left-6 sm:-left-10 glass-card p-4 rounded-xl shadow-xl w-64 animate-float">
                  <p className="text-white/80 text-xs">Next in your city</p>
                  <p className="text-white font-semibold mt-1">Designers Meetup</p>
                  <p className="text-white/70 text-xs mt-1">Tomorrow · 6:30 PM</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 bg-slate-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-amber-600">{SYSTEM_MESSAGES.whyLabel}</p>
                <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                  Designed for organizers and fans who move fast
                </h2>
                <p className="mt-4 text-gray-600 dark:text-gray-300 max-w-xl">
                  Everything you need to plan, launch, and fill your events. One dashboard for creators, one wallet for attendees,
                  and a social layer built for sharing moments instantly.
                </p>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow-md">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Lightning setup</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Spin up an event in minutes with guided forms and templates.
                    </p>
                    <div className="reason-anim reason-delay-1">
                      <span className="reason-dot" />
                      <span className="reason-line" />
                      <span className="reason-tag">Live form hints</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow-md">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Smart reminders</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Attendees never miss a moment with automated reminders.
                    </p>
                    <div className="reason-anim reason-delay-2">
                      <span className="reason-dot" />
                      <span className="reason-line" />
                      <span className="reason-tag">Rolling schedule</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow-md">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Seamless payouts</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Track revenue and get payouts faster with transparent analytics.
                    </p>
                    <div className="reason-anim reason-delay-3">
                      <span className="reason-dot" />
                      <span className="reason-line" />
                      <span className="reason-tag">Instant snapshots</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-xl bg-white dark:bg-gray-800 shadow-md">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Share in a tap</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Branded links and social previews that pop everywhere.
                    </p>
                    <div className="reason-anim reason-delay-4">
                      <span className="reason-dot" />
                      <span className="reason-line" />
                      <span className="reason-tag">Auto-share cards</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Creator tools</p>
                  <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">Analytics that look like a playlist</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                    See ticket velocity, revenue, and check-in rates in one glance.
                  </p>
                  <div className="reason-anim reason-delay-2">
                    <span className="reason-dot" />
                    <span className="reason-line" />
                    <span className="reason-tag">Tempo tracking</span>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-100 via-rose-100 to-sky-100 shadow-lg">
                  <p className="text-xs uppercase tracking-wide text-slate-700">Attendee experience</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">Your pass is always in your pocket</h3>
                  <p className="mt-2 text-slate-700 text-sm">
                    QR tickets stay synced, even offline, so you never miss entry.
                  </p>
                  <div className="reason-anim reason-delay-3">
                    <span className="reason-dot" />
                    <span className="reason-line" />
                    <span className="reason-tag">Auto-sync tickets</span>
                  </div>
                </div>
                <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-lg">
                  <p className="text-xs uppercase tracking-wide text-gray-500">Security</p>
                  <h3 className="mt-3 text-xl font-semibold text-gray-900 dark:text-white">Verified check-ins</h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                    Anti-fraud scanning keeps venues smooth and guests confident.
                  </p>
                  <div className="reason-anim reason-delay-4">
                    <span className="reason-dot" />
                    <span className="reason-line" />
                    <span className="reason-tag">Secure scans</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-amber-500 via-rose-500 to-sky-500 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Ready to launch your next event?
            </h2>
            <p className="text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of creators building unforgettable experiences. Get started today and go live in minutes.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                to="/events"
                className="px-8 py-3 bg-white text-slate-900 font-semibold rounded-md hover:bg-slate-100 transition-all"
              >
                Browse Events
              </Link>
              <Link
                to="/register"
                className="px-8 py-3 bg-slate-900 text-white font-semibold rounded-md hover:bg-slate-800 transition-all"
              >
                Create Event
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
