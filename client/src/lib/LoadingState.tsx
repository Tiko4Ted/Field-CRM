import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  isSlow?: boolean;
  title?: string;
  slowTitle?: string;
  slowDescription?: string;
}

export default function LoadingState({
  isSlow = false,
  title = 'Loading...',
  slowTitle = 'Starting database...',
  slowDescription = 'The first request can take a little longer while the database wakes up.',
}: LoadingStateProps) {
  return (
    <div className="min-h-[240px] flex flex-col items-center justify-center text-center px-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
      <p className="text-sm font-semibold text-foreground">{isSlow ? slowTitle : title}</p>
      {isSlow && (
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          {slowDescription}
        </p>
      )}
    </div>
  );
}
