import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import PrivateRoute from './components/PrivateRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Events from './pages/Events';
import EventDetails from './pages/EventDetails';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import MyEvents from './pages/MyEvents';
import MyTickets from './pages/MyTickets';
import TicketDetails from './pages/TicketDetails';
import Analytics from './pages/Analytics';
import PaymentVerify from './pages/PaymentVerify';
import PaymentSuccess from './pages/PaymentSuccess';
import TicketSuccess from './pages/TicketSuccess';
import VerifyTickets from './pages/VerifyTickets';
import InactivityWrapper from './components/InactivityWrapper';
import SupportChatbot from './components/SupportChatbot';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <InactivityWrapper>
              <div className="min-h-screen bg-cream-light dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:id" element={<EventDetails />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/ticket-success" element={<TicketSuccess />} />

                  {/* Protected Routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/events/create"
                    element={
                      <PrivateRoute requireCreator>
                        <CreateEvent />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/events/edit/:id"
                    element={
                      <PrivateRoute requireCreator>
                        <CreateEvent />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/my-events"
                    element={
                      <PrivateRoute requireCreator>
                        <MyEvents />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/my-tickets"
                    element={
                      <PrivateRoute requireEventee>
                        <MyTickets />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/tickets/:id"
                    element={
                      <PrivateRoute requireEventee>
                        <TicketDetails />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/analytics"
                    element={
                      <PrivateRoute requireCreator>
                        <Analytics />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/verify-tickets"
                    element={
                      <PrivateRoute requireCreator>
                        <VerifyTickets />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/payment/verify"
                    element={
                      <PrivateRoute requireEventee>
                        <PaymentVerify />
                      </PrivateRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
              <SupportChatbot />
            </InactivityWrapper>
          </AuthProvider>
        </ThemeProvider>
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </QueryClientProvider>
  );
};

export default App;
