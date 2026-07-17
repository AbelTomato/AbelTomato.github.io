import { Card } from "@components/ui/card";
import { Tilt } from "@components/core/Tilt";
import { HamsterLoader } from "@components/ui/HamsterLoader";
import { useMomentsData } from "../hooks/useMomentsData";
import { useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Quote } from "lucide-react";

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
    <Tilt rotationFactor={8} className="w-full">
      <Card className="group relative h-64 w-full overflow-hidden rounded-xl border-none shadow-lg transition-all duration-500 hover:-translate-y-1 md:h-72">
        <img
          src={resolvedImageSrc}
          alt={source}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition-[transform,filter] duration-1000 group-hover:scale-105 group-hover:blur-[2px]"
        />

        <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent" />

        <div className="relative mx-auto flex h-full max-w-2xl flex-col justify-center p-6 md:p-8">
          <Quote className="mb-4 size-8 text-blue-400 opacity-50 transition-opacity group-hover:opacity-100" aria-hidden="true" />

          <p className="mb-6 text-xl font-medium leading-relaxed italic text-white md:text-2xl">
            {text}
          </p>

          <div className="flex items-center gap-3 text-gray-300">
            <span className="font-bold text-blue-400">#{author}</span>
            <span className="opacity-60">《{source}》</span>
          </div>
        </div>
      </Card>
    </Tilt>
  );
}

function MomentsSectionContent() {
  const { data: moments, isLoading, error } = useMomentsData();

  if (isLoading) {
    return (
      <div className="flex h-100 items-center justify-center">
        <HamsterLoader label="正在加载瞬间..." />
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
    <div className="space-y-5">
      <h2 className="flex items-center gap-2 text-2xl font-bold">
        <span className="text-blue-500">#</span> Moments
      </h2>

      <hr className="w-16 border-t-2 border-blue-500 dark:border-blue-400" />
      <div className="flex flex-col gap-6">
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
