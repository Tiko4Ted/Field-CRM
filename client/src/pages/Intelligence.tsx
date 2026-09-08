import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, TrendingUp, Target } from 'lucide-react';

export default function Intelligence() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-xl flex items-center justify-center
                       hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Intelligence</h1>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 animate-page">
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Analytics, pipeline reports, and smart follow-up reminders are being built.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mt-8">
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <TrendingUp className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-muted-foreground">Conversion Rate</p>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border text-center">
              <Target className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-xs font-medium text-muted-foreground">Follow-ups Due</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
