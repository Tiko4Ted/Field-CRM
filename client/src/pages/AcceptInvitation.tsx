import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid invitation link.');
      return;
    }

    const acceptInvite = async () => {
      try {
        await api.post('/campaigns/invitations/accept', { token });
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Failed to accept invitation. It may have expired or already been accepted.');
      }
    };

    acceptInvite();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-card border border-border p-8 rounded-2xl shadow-xl text-center">
        {status === 'loading' && (
          <div className="py-8">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-semibold">Joining Campaign...</h1>
            <p className="text-muted-foreground mt-2 text-sm">Please wait while we verify your invitation.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Invitation Accepted!</h1>
            <p className="text-muted-foreground mb-8 text-sm">You have successfully joined the campaign team.</p>
            <button
              onClick={() => navigate('/campaigns')}
              className="bg-primary text-primary-foreground px-8 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              Go to My Campaigns
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="py-8 animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Oops!</h1>
            <p className="text-muted-foreground mb-8 text-sm">{message}</p>
            <button
              onClick={() => navigate('/campaigns')}
              className="bg-card border border-border text-foreground px-8 py-2.5 rounded-xl font-medium hover:bg-muted transition-colors"
            >
              Return Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
