/** 合并同一帧内的重复更新，并允许页面卸载时取消。 */
export function createFrameScheduler(update: () => void) {
  let frame: number | undefined;
  return {
    schedule() {
      if (frame !== undefined) return;
      frame = requestAnimationFrame(() => {
        frame = undefined;
        update();
      });
    },
    cancel() {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
    },
  };
}