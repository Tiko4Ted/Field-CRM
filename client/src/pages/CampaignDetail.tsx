import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import { ArrowLeft, Users, Mail, Trash2, Shield, ShieldAlert, Loader2, Brain, School } from 'lucide-react';

interface CampaignMember {
  user: { id: string; name: string; email: string };
  role: string;
  status: string;
  joinedAt: string;
}

interface CampaignInvitation {
  id: string;
  email: string;
  status: string;
  createdAt: string;
}

interface CampaignData {
  id: string;
  name: string;
  description: string;
  members: CampaignMember[];
  invitations: CampaignInvitation[];
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');

  const { data: campaign, isLoading } = useQuery<CampaignData>({
    queryKey: ['campaign', id],
    queryFn: () => api.get(`/campaigns/${id}`).then(r => r.data),
  });

  const members = campaign?.members ?? [];
  const invitations = campaign?.invitations ?? [];

  const { mutate: inviteMember, isPending: isInviting } = useMutation({
    mutationFn: async (email: string) => {
      await api.post(`/campaigns/${id}/invitations`, { email });
    },
    onSuccess: () => {
      setInviteEmail('');
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || 'Failed to send invitation');
    },
  });

  const { mutate: removeMember } = useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/campaigns/${id}/members/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Campaign not found</p>
      </div>
    );
  }

  const currentUserRole = members.find(m => m.user.id === user?.id)?.role;
  const isOwner = currentUserRole === 'OWNER';

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 p-4">
      <div className="max-w-3xl mx-auto pt-8">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Campaigns
        </button>

        <div className="bg-card border border-border rounded-3xl p-8 mb-8 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{campaign.name}</h1>
              {campaign.description && (
                <p className="text-muted-foreground mt-2 text-lg">
                  {campaign.description}
                </p>
              )}
            </div>
            <div className={`px-3 py-1.5 text-sm font-semibold rounded-lg flex items-center gap-1.5
                            ${isOwner ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
              {isOwner ? <ShieldAlert className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
              {isOwner ? 'Owner' : 'Member'}
            </div>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => navigate(`/campaigns/${id}/intelligence`)}
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl 
                       bg-primary/5 border border-primary/20 hover:bg-primary/10 hover:border-primary/40
                       transition-all shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center 
                            group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">Intelligence</p>
              <p className="text-xs text-muted-foreground mt-0.5">Collect & manage school intel</p>
            </div>
          </button>

          <button
            onClick={() => navigate(`/campaigns/${id}/schools`)}
            className="group flex flex-col items-center justify-center gap-3 p-6 rounded-2xl
                       bg-emerald-500/5 border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40
                       transition-all shadow-sm"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center
                            group-hover:scale-110 transition-transform">
              <School className="w-7 h-7 text-emerald-500" />
            </div>
            <div className="text-center">
              <p className="font-bold text-foreground">Schools</p>
              <p className="text-xs text-muted-foreground mt-0.5">View visited & enrolled schools</p>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content (Team List) */}
          <div className="md:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Team Members
            </h2>
            
            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              {members.map((member) => (
                <div key={member.user.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {member.user.name}
                      {member.user.id === user?.id && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">You</span>}
                    </div>
                    <div className="text-sm text-muted-foreground">{member.user.email}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground capitalize">{member.role.toLowerCase()}</span>
                    {isOwner && member.user.id !== user?.id && (
                      <button
                        onClick={() => removeMember(member.user.id)}
                        className="text-destructive hover:bg-destructive/10 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {isOwner && invitations.filter(i => i.status === 'PENDING').length > 0 && (
              <>
                <h2 className="text-xl font-semibold flex items-center gap-2 mt-8">
                  <Mail className="w-5 h-5 text-primary" />
                  Pending Invitations
                </h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                  {invitations.filter(i => i.status === 'PENDING').map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-4 border-b border-border last:border-0">
                      <div className="text-sm font-medium">{inv.email}</div>
                      <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">Pending</div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sidebar (Invite Form) */}
          {isOwner && (
            <div className="md:col-span-1">
              <div className="bg-card border border-border rounded-2xl p-5 shadow-sm sticky top-4">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Invite Member
                </h3>
                
                {error && (
                  <div className="p-2.5 mb-4 text-xs text-destructive bg-destructive/10 rounded-xl">
                    {error}
                  </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); setError(''); inviteMember(inviteEmail); }} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <button
                    type="submit"
                    disabled={isInviting || !inviteEmail}
                    className="w-full bg-primary text-primary-foreground py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center"
                  >
                    {isInviting && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
                    Send Invite
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
