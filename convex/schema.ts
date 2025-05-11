import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  robotStatus: defineTable({
    position: v.object({
      x: v.number(),
      y: v.number(),
      z: v.number()
    }),
    state: v.string(),
    battery: v.number(),
    errors: v.array(v.string()),
    isConnected: v.boolean(),
    currentDecision: v.optional(v.string()),
    currentReason: v.optional(v.string())
  }),
  commands: defineTable({
    type: v.string(),
    payload: v.any(),
    status: v.string(),
    timestamp: v.number(),
    reason: v.optional(v.string()),
    success: v.optional(v.boolean())
  }).index("by_timestamp", ["timestamp"])
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
