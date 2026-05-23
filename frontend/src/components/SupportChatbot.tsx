import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { SYSTEM_MESSAGES } from '../utils/systemMessages';

type MessageAuthor = 'bot' | 'user';

interface ChatAction {
  label: string;
  route?: string;
}

interface ChatMessage {
  id: number;
  author: MessageAuthor;
  text: string;
  actions?: ChatAction[];
}

const SupportChatbot: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isCreator } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      author: 'bot',
      text: SYSTEM_MESSAGES.supportChatIntro,
      actions: [
        { label: 'Browse Events', route: '/events' },
        { label: 'Forgot Password', route: '/forgot-password' }
      ]
    }
  ]);

  const suggestions = useMemo(
    () => [
      'How do I reset my password?',
      'How can I buy a ticket?',
      'Payment successful but no ticket yet',
      'How do I create an event?'
    ],
    []
  );

  const getBotReply = (query: string): Omit<ChatMessage, 'id' | 'author'> => {
    const normalized = query.toLowerCase();

    if (normalized.includes('password') || normalized.includes('login') || normalized.includes('account')) {
      return {
        text: 'To reset your password, open Forgot Password, enter your registered email, and use the reset link sent to your inbox.',
        actions: [
          { label: 'Forgot Password', route: '/forgot-password' },
          { label: 'Login', route: '/login' }
        ]
      };
    }

    if (normalized.includes('ticket') || normalized.includes('buy') || normalized.includes('purchase')) {
      return {
        text: 'To get a ticket, open an event, select your reminder preference, then complete checkout. Your ticket appears in My Tickets after successful verification.',
        actions: [
          { label: 'View Events', route: '/events' },
          { label: 'My Tickets', route: '/my-tickets' }
        ]
      };
    }

    if (normalized.includes('payment') || normalized.includes('verify') || normalized.includes('paystack')) {
      return {
        text: 'If payment succeeds and your ticket is delayed, wait a short moment and refresh your payment success page or check My Tickets. Duplicate verification is handled automatically.',
        actions: [
          { label: 'My Tickets', route: '/my-tickets' },
          { label: 'Dashboard', route: '/dashboard' }
        ]
      };
    }

    if (normalized.includes('create') || normalized.includes('host') || normalized.includes('event')) {
      if (!isAuthenticated) {
        return {
          text: 'To create events, register or login as a Creator account, then use the Create Event page.',
          actions: [
            { label: 'Register', route: '/register' },
            { label: 'Login', route: '/login' }
          ]
        };
      }

      if (!isCreator) {
        return {
          text: 'Your account is currently Eventee. Creator-only features require a Creator role.',
          actions: [{ label: 'Profile', route: '/profile' }]
        };
      }

      return {
        text: 'Great! You can create and manage events from your creator dashboard.',
        actions: [
          { label: 'Create Event', route: '/events/create' },
          { label: 'My Events', route: '/my-events' }
        ]
      };
    }

    return {
      text: 'I can help with account access, tickets, payments, and event creation. Try one of the quick prompts below.',
      actions: [
        { label: 'Events', route: '/events' },
        { label: 'Forgot Password', route: '/forgot-password' },
        { label: 'Dashboard', route: '/dashboard' }
      ]
    };
  };

  const appendMessage = (message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSend = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    appendMessage({ id: Date.now(), author: 'user', text });
    const reply = getBotReply(text);
    appendMessage({ id: Date.now() + 1, author: 'bot', ...reply });
    setInput('');
  };

  const handleAction = (action: ChatAction) => {
    if (action.route) {
      navigate(action.route);
      setIsOpen(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2rem)] max-w-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{SYSTEM_MESSAGES.supportChatTitle}</h3>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
              aria-label="Close support chat"
            >
              ✕
            </button>
          </div>

          <div className="h-80 overflow-y-auto px-3 py-3 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={message.author === 'user' ? 'text-right' : 'text-left'}>
                <div
                  className={
                    message.author === 'user'
                      ? 'inline-block rounded-lg bg-indigo-600 text-white px-3 py-2 text-sm'
                      : 'inline-block rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm'
                  }
                >
                  {message.text}
                </div>

                {message.author === 'bot' && message.actions && message.actions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {message.actions.map((action) => (
                      <button
                        key={`${message.id}-${action.label}`}
                        type="button"
                        onClick={() => handleAction(action)}
                        className="text-xs rounded-full border border-indigo-300 dark:border-indigo-500 px-3 py-1 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-gray-700"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-3 pb-3">
            <div className="mb-2 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => handleSend(suggestion)}
                  className="text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask customer support..."
                className="flex-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="rounded-md bg-indigo-600 text-white text-sm px-3 py-2 hover:bg-indigo-700"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-12 w-12 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700"
        aria-label="Open support chatbot"
      >
        💬
      </button>
    </div>
  );
};

export default SupportChatbot;
