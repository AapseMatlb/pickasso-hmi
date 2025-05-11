import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const initRobotStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const statuses = await ctx.db
      .query("robotStatus")
      .collect();
    
    if (statuses.length === 0) {
      await ctx.db.insert("robotStatus", {
        position: { x: 0, y: 0, z: 0 },
        state: "IDLE",
        battery: 100,
        errors: [],
        isConnected: true,
        currentDecision: "Waiting for commands",
        currentReason: "System initialized"
      });
    }
  }
});

export const updateRobotStatus = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const statuses = await ctx.db
      .query("robotStatus")
      .collect();
    
    if (statuses.length === 0) {
      await ctx.db.insert("robotStatus", args);
    } else {
      await ctx.db.patch(statuses[0]._id, args);
    }
  }
});

export const getRobotStatus = query({
  args: {},
  handler: async (ctx) => {
    const statuses = await ctx.db
      .query("robotStatus")
      .collect();
    return statuses[0] || null;
  }
});

export const getRecentCommands = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("commands")
      .withIndex("by_timestamp")
      .order("desc")
      .take(5);
  }
});

export const sendCommand = mutation({
  args: {
    type: v.string(),
    payload: v.any()
  },
  handler: async (ctx, args) => {
    let reason = "Command received";
    let success = true;

    // Simulate decision logic
    switch (args.type) {
      case "MOVE":
        reason = "Path is clear for movement";
        break;
      case "GRAB":
        reason = "Object detected and verified safe to grab";
        break;
      case "PLACE":
        reason = "Designated area is clear for placement";
        break;
      case "STOP":
        reason = "Emergency stop triggered";
        break;
      case "HOME":
        reason = "Returning to charging station";
        break;
      case "CALIBRATE":
        reason = "Initiating sensor calibration";
        break;
      case "RESET":
        reason = "Clearing error state";
        break;
    }

    await ctx.db.insert("commands", {
      ...args,
      status: "completed",
      timestamp: Date.now(),
      reason,
      success
    });

    // Get current status
    const currentStatus = await ctx.db
      .query("robotStatus")
      .first();

    if (currentStatus) {
      // Update robot status with current decision
      await ctx.db.patch(currentStatus._id, {
        state: args.type,
        currentDecision: args.type,
        currentReason: reason
      });
    }
  }
});
