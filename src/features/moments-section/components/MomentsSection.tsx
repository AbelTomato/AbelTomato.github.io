import { Card } from "@components/ui/card";
import { useMomentsData } from "../hooks/useMomentsData";
import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const momentsImages = import.meta.glob<{ default: string }>(
  "../assets/*.{jpeg,jpg,png,gif,webp}",
  { eager: true, query: "?url" },
);

interface SingleMomentCardProps {
  text: string;
  author: string;
  source: string;
  image: string;
}

function SingleMomentCard({
  text,
  author,
  source,
  image,
}: SingleMomentCardProps) {
  const imagePath = `../assets/${image}`;
  const resolvedImageSrc = momentsImages[imagePath]?.default || "";

  return (
    <Card className="group relative w-full max-w-3xl mx-auto overflow-hidden rounded-3xl h-64 md:h-80 shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-3xl border-none">
      <img
        src={resolvedImageSrc}
        alt={source}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent" />

      <div className="relative h-full p-6 md:p-8 flex flex-col justify-center max-w-2xl mx-auto">
        <div className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity">
          <svg
            className="w-8 h-8 text-blue-400"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21L14.017 18C14.017 16.8954 14.9124 16 16.017 16H19.017C20.1216 16 21.017 16.8954 21.017 18V21C21.017 22.1046 20.1216 23 19.017 23H16.017C14.9124 23 14.017 22.1046 14.017 21ZM3.01697 21L3.01697 18C3.01697 16.8954 3.9124 16 5.01697 16H8.01697C9.12154 16 10.017 16.8954 10.017 18V21C10.017 22.1046 9.12154 23 8.01697 23H5.01697C3.9124 23 3.01697 22.1046 3.01697 21ZM16.017 16C13.8079 16 12.017 14.2091 12.017 12V10C12.017 7.79086 13.8079 6 16.017 6H19.017C21.2261 6 23.017 7.79086 23.017 10V12C23.017 14.2091 21.2261 16 19.017 16H16.017ZM5.01697 16C2.80783 16 1.01697 14.2091 1.01697 12V10C1.01697 7.79086 2.80783 6 5.01697 6H8.01697C10.2261 6 12.017 7.79086 12.017 10V12C12.017 14.2091 10.2261 16 8.01697 16H5.01697Z" />{" "}
          </svg>
        </div>

        <p className="text-white text-xl md:text-2xl font-medium leading-relaxed italic mb-6">
          {text}
        </p>

        <div className="flex items-center gap-3 text-gray-300">
          <span className="font-bold text-blue-400">#{author}</span>
          <span className="opacity-60">《{source}》</span>
        </div>
      </div>
    </Card>
  );
}

function MomentsSectionContent() {
  const { data: moments, isLoading, error } = useMomentsData();

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center text-sm text-muted-foreground font-mono animate-pulse">
        Fetching Moments pulses...
      </div>
    );
  }

  if (error || !moments || !moments.length) {
    return (
      <div className="mx-auto max-w-md my-12 p-6 text-center border rounded-xl bg-destructive/5 border-destructive/20">
        <p className="font-semibold text-destructive mb-1">获取数据失败</p>
      </div>
    );
  }

  return (
    <div className="mt-16 space-y-10 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <span className="text-blue-500">#</span> Moments
      </h2>

      <hr className="mt-6 mx-auto w-24 border-t-2 border-blue-500 dark:border-blue-400" />
      <div className="flex flex-col gap-8">
        {moments?.map((m) => (
          <SingleMomentCard {...m} key={m.text} />
        ))}
      </div>
    </div>
  );
}

export default function MomentsSection() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <MomentsSectionContent />
    </QueryClientProvider>
  );
}
