import { LogChannel } from "./logchannel.ts";

// --- Test Setup ---
// Ensure your .env file at c:\GIT\logchannel\.env contains:
// LOG_CHANNELS="default"
// Or, if no .env file or LOG_CHANNELS is empty, it will default to ["default"]

console.log("--- Initial State (from .env or default) ---");
console.log("Expected initial active channels (e.g., from .env LOG_CHANNELS=\"default\"): [\"default\"]");
console.log("Actual active channels:", LogChannel.getActiveChannels());

LogChannel.log("default", "This is a default channel message (should print if 'default' is active).");
LogChannel.log("init", "This is an 'init' channel message (should NOT print if 'init' is not active).");
LogChannel.log("specific_debug", "This is a 'specific_debug' channel message (should NOT print).");
LogChannel.error("default", "This is a default channel error (should print if 'default' is active).");
LogChannel.error("specific_error", "This is a 'specific_error' channel error (should NOT print).");
LogChannel.debug("default", "This is a default channel debug message (should print if 'default' is active via console.debug).");
LogChannel.debug("trace", "This is a 'trace' channel debug message (should NOT print).");

console.log("\n--- Activating 'user_ops', 'system_alerts', and 'default' channels ---");
LogChannel.setChannel(["user_ops", "system_alerts", "default"]);
console.log("Active channels:", LogChannel.getActiveChannels());

LogChannel.log("default", "Default log (still active).");
LogChannel.log("init", "'init' channel log (still INACTIVE, should NOT print).");
LogChannel.log("user_ops", "'user_ops' channel log (now ACTIVE).");
LogChannel.error("system_alerts", "'system_alerts' channel error (now ACTIVE).");
LogChannel.debug("user_ops", "'user_ops' channel debug (now ACTIVE).");
LogChannel.debug("default", "Default debug (still active).");

console.log("\n--- Activating only 'custom_service' channel ---");
LogChannel.setChannel("custom_service");
console.log("Active channels:", LogChannel.getActiveChannels());

LogChannel.log("default", "Default log (now INACTIVE, should NOT print).");
LogChannel.log("user_ops", "'user_ops' log (now INACTIVE, should NOT print).");
LogChannel.log("custom_service", "'custom_service' channel log (now ACTIVE).");
LogChannel.error("custom_service", "'custom_service' channel error (now ACTIVE).");
LogChannel.debug("custom_service", "'custom_service' channel debug (now ACTIVE).");

console.log("\n--- Testing logs with no additional messages (should NOT print anything) ---");
LogChannel.setChannel(["default", "special_event"]);
console.log("Active channels:", LogChannel.getActiveChannels());
LogChannel.log("default"); // No message content, should NOT print.
LogChannel.log("special_event"); // No message content, should NOT print.
LogChannel.log("inactive_channel"); // Inactive, and no message content, should NOT print.

console.log("\n--- Testing setting empty or whitespace channels ---");
LogChannel.setChannel("");
console.log("Active channels (after setChannel('')):", LogChannel.getActiveChannels()); // Expected: []
LogChannel.log("default", "Should NOT print, 'default' is not active.");

LogChannel.setChannel(["  ", "\t"]); // Channels with only whitespace
console.log("Active channels (after setChannel(['  ', '\\t'])):", LogChannel.getActiveChannels()); // Expected: []
LogChannel.log("default", "Should NOT print, 'default' is not active.");

LogChannel.setChannel("final_channel"); // Reactivate a channel for a final test
console.log("Active channels:", LogChannel.getActiveChannels());
LogChannel.log("final_channel", "Message for 'final_channel'.");
LogChannel.error("final_channel", "Error for 'final_channel'.");
LogChannel.debug("final_channel", "Debug for 'final_channel'.");

console.log("\n--- Test Complete ---");