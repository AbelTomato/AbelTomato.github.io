import { describe, expect, it } from "vitest";

import { commentStatusEnum } from "./schema";

describe("comment schema", () => {
  it("defines the supported status values", () => {
    expect(commentStatusEnum.enumValues).toEqual([
      "pending",
      "approved",
      "rejected",
      "deleted",
    ]);
  });
});