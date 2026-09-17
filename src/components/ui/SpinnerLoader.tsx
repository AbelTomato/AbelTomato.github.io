interface SpinnerLoaderProps {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * SVG 响应式加载动画组件
 * 特点:
 * - 纯 SVG 实现,完全适配容器尺寸
 * - 支持主题色自适应
 * - 支持无障碍访问
 */
export function SpinnerLoader({
  label = "正在加载...",
  size = "md",
  className = "",
}: SpinnerLoaderProps) {
  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 py-6 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      <svg
        className={`${sizeMap[size]} animate-spin text-primary`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="text-sm text-muted-foreground font-mono animate-pulse">
        {label}
      </span>
    </div>
  );
}
