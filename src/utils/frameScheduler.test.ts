import { afterEach, describe, expect, it, vi } from "vitest";
import { createFrameScheduler } from "./frameScheduler";

afterEach(() => vi.unstubAllGlobals());

describe("createFrameScheduler", () => {
  it("同一帧只更新一次，下一帧仍可调度", () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal("requestAnimationFrame", vi.fn((callback) => callbacks.push(callback)));
    const update = vi.fn();
    const scheduler = createFrameScheduler(update);
    scheduler.schedule();
    scheduler.schedule();
    expect(callbacks).toHaveLength(1);
    callbacks[0](0);
    expect(update).toHaveBeenCalledTimes(1);
    scheduler.schedule();
    expect(callbacks).toHaveLength(2);
  });

  it("卸载时取消待执行帧且允许重新调度，包括帧编号为零", () => {
    const request = vi.fn(() => 0);
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", request);
    vi.stubGlobal("cancelAnimationFrame", cancel);
    const scheduler = createFrameScheduler(vi.fn());
    scheduler.schedule();
    scheduler.cancel();
    scheduler.cancel();
    expect(cancel).toHaveBeenCalledExactlyOnceWith(0);
    scheduler.schedule();
    expect(request).toHaveBeenCalledTimes(2);
  });
});