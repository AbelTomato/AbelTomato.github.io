import { SpinnerLoader } from "./SpinnerLoader";

interface LoadingStatusProps {
  loadingSource: string;
}

export default function LoadingStatus({ loadingSource }: LoadingStatusProps) {
  return (
    <div className="flex h-100 items-center justify-center">
      <SpinnerLoader label={`正在加载 ${loadingSource} 数据...`} />
    </div>
  );
}
