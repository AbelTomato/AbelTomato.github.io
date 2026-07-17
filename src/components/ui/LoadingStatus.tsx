import { HamsterLoader } from "./HamsterLoader";

interface LoadingStatusProps {
  loadingSource: string;
}

export default function ({ loadingSource }: LoadingStatusProps) {
  return (
    <div className="flex h-100 items-center justify-center">
      <HamsterLoader label={`正在加载 ${loadingSource} 数据...`} />
    </div>
  );
}
