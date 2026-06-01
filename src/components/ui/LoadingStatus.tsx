interface LoadingStatusProps {
  loadingSource: string;
}

export default function ({ loadingSource }: LoadingStatusProps) {
  return (
    <div className="flex h-100 items-center justify-center text-sm text-muted-foreground font-mono animate-pulse">
      Loading {loadingSource} data...
    </div>
  );
}
