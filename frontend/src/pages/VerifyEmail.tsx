import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import PageHeader from '../components/PageHeader';
import { authService } from '../services/auth.service';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>(SYSTEM_MESSAGES.verificationSuccessMessage);
  const verifyAttemptRef = useRef<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');

    if (verifyAttemptRef.current === token) {
      return;
    }

    verifyAttemptRef.current = token;

    const verify = async () => {
      try {
        if (!token) {
          throw new Error(SYSTEM_MESSAGES.verificationTokenMissing);
        }

        const response = await authService.verifyEmail({ token });
        const successMessage = response.message || SYSTEM_MESSAGES.verificationSuccessMessage;
        setMessage(successMessage);

        window.setTimeout(() => {
          navigate('/dashboard?verified=true', { replace: true });
        }, 800);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || error.message || SYSTEM_MESSAGES.verificationFailureMessage;
        setMessage(errorMessage);
        toast.error(errorMessage);
        window.setTimeout(() => {
          navigate('/login', { replace: true });
        }, 1500);
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-cream-light dark:bg-gray-900 flex flex-col">
      <Navbar />
      <div className="flex-1">
        <PageHeader
          title="Verifying your email"
          subtitle="Please wait while we confirm your account."
          badge="Authentication"
        />
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          {loading ? (
            <LoadingSpinner message="Checking your verification link..." />
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20 p-6 text-emerald-900 dark:text-emerald-100">
              <h2 className="text-2xl font-bold">Email verified</h2>
              <p className="mt-2">{message}</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default VerifyEmail;