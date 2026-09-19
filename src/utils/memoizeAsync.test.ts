import { describe, expect, it, vi } from "vitest";
import { memoizeAsync } from "./memoizeAsync";

describe("memoizeAsync", () => {
  it("并发和后续调用只执行一次统计", async () => {
    const load = vi.fn(async () => ({ total: 42 }));
    const get = memoizeAsync(load);
    const [first, second] = await Promise.all([get(), get()]);
    expect(first).toBe(second);
    expect(await get()).toBe(first);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("失败不污染缓存，后续调用重试", async () => {
    const load = vi.fn<() => Promise<number>>()
      .mockRejectedValueOnce(new Error("content unavailable"))
      .mockResolvedValueOnce(12);
    const get = memoizeAsync(load);
    await expect(get()).rejects.toThrow("content unavailable");
    await expect(get()).resolves.toBe(12);
    expect(load).toHaveBeenCalledTimes(2);
  });
});