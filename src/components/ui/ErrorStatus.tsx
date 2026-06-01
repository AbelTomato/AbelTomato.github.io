interface ErrorStatusProps {
  error: Error | null;
  fallbackMessage?: string;
}

export default function ({ error, fallbackMessage }: ErrorStatusProps) {
  return (
    <div className="mx-auto max-w-md my-12 p-6 text-center border rounded-xl bg-destructive/5 border-destructive/20">
      <p className="font-semibold text-destructive mb-1">Data Error</p>
      <p className="text-xs text-muted-foreground">
        {error?.message ||
          fallbackMessage ||
          "Please check the network connection."}
      </p>
    </div>
  );
}
