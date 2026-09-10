import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../lib/AuthContext';
import LoadingState from '../lib/LoadingState';
import { useSlowLoading } from '../lib/useSlowLoading';
import { Users, Plus, Shield, ShieldAlert, LogOut, GraduationCap, Brain } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
  createdAt: string;
}

interface CampaignMembership {
  campaign: Campaign;
  role: string;
  status: string;
}

export default function CampaignsList() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: memberships = [], isLoading } = useQuery<CampaignMembership[]>({
    queryKey: ['campaigns'],
    queryFn: () => api.get('/campaigns').then(r => r.data),
  });
  const isSlow = useSlowLoading(isLoading);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Campaigns</h1>
            <p className="text-muted-foreground mt-1 text-sm">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/campaigns/new')}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Campaign</span>
            </button>
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-card border border-border hover:bg-muted text-muted-foreground transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Personal Workspace */}
        <div className="mb-8">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Personal Workspace</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/schools')}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-card border border-border
                         hover:border-primary/30 hover:shadow-sm transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0
                              group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-sm">Schools</p>
                <p className="text-xs text-muted-foreground">Visited & enrolled</p>
              </div>
            </button>

            <button
              onClick={() => navigate('/intelligence')}
              className="group flex items-center gap-3 p-4 rounded-2xl bg-card border border-border
                         hover:border-primary/30 hover:shadow-sm transition-all text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0
                              group-hover:scale-110 transition-transform">
                <Brain className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">Intelligence</p>
                <p className="text-xs text-muted-foreground">Prospects & pipeline</p>
              </div>
            </button>
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Campaigns</p>
          <button
            onClick={() => navigate('/campaigns/new')}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" />
            New Campaign
          </button>
        </div>

        {isLoading ? (
          <LoadingState
            isSlow={isSlow}
            title="Loading campaigns..."
            slowDescription="Your database may be waking up. This usually only affects the first request."
          />
        ) : memberships.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-3xl mt-8 shadow-sm">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No campaigns yet</h2>
            <p className="text-muted-foreground mb-6 text-sm max-w-sm mx-auto">
              Create a campaign to start inviting team members and collecting intelligence together.
            </p>
            <button
              onClick={() => navigate('/campaigns/new')}
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-medium shadow-sm hover:opacity-90 transition-opacity"
            >
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {memberships.map(({ campaign, role }) => (
              <button
                key={campaign.id}
                onClick={() => navigate(`/campaigns/${campaign.id}`)}
                className="group w-full p-5 rounded-2xl bg-card border border-border text-left relative
                           hover:border-primary/30 hover:shadow-sm transition-all overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-colors" />
                
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
                      {campaign.name}
                    </h3>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {campaign.description}
                      </p>
                    )}
                  </div>
                  <div className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1.5 whitespace-nowrap
                                  ${role === 'OWNER' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {role === 'OWNER' ? <ShieldAlert className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                    {role}
                  </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span>View Team & Intelligence</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
