import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function CampaignsCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/campaigns', { name, description });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      navigate('/campaigns');
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to create campaign');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    mutate();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Campaigns
        </button>

        <h1 className="text-3xl font-bold tracking-tight mb-8">Create Campaign</h1>

        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Campaign Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              placeholder="e.g. Q4 Regional Outreach"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
              placeholder="What is the goal of this campaign?"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isPending || !name.trim()}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
