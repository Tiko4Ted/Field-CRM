import { useNavigate } from 'react-router-dom';
import { GraduationCap, Brain } from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-6 py-5 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
          <GraduationCap className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">FieldCRM</h1>
          <p className="text-xs text-muted-foreground font-medium">School Client Tracker</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-12 animate-page">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
            Welcome back
          </h2>
          <p className="mt-2 text-muted-foreground text-base max-w-md mx-auto">
            Track school visits, manage contacts, and stay on top of your client acquisition pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg">
          {/* Schools */}
          <button
            onClick={() => navigate('/schools')}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 text-left
                       hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5
                       transition-all duration-300 ease-out cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                            group-hover:bg-primary/15 transition-colors">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Schools</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Manage visited schools, contacts, and follow-ups.
            </p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center
                            group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Intelligence */}
          <button
            onClick={() => navigate('/intelligence')}
            className="group relative overflow-hidden rounded-2xl bg-card border border-border p-6 text-left
                       hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5
                       transition-all duration-300 ease-out cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4
                            group-hover:bg-primary/15 transition-colors">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">Intelligence</h3>
            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
              Analytics, insights, and acquisition reports.
            </p>
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center
                            group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}
