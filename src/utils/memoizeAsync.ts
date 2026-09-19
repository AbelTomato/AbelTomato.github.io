/** 合并并发请求，失败后允许重试；调用方决定是否启用缓存。 */
export function memoizeAsync<T>(load: () => Promise<T>) {
  let pending: Promise<T> | undefined;
  return () => {
    pending ??= load().catch((error: unknown) => {
      pending = undefined;
      throw error;
    });
    return pending;
  };
}