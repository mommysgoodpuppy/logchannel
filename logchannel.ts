/**
 * LogChannel provides a simple mechanism for conditional logging based on active channels.
 * It allows defining multiple logging channels and activating only specific ones,
 * so that log messages are only output if their corresponding channel is active.
 *
 * @remarks
 * Initial active channels can be set via the `LOG_CHANNELS` environment variable
 * (comma-separated string, e.g., "default,api,worker"). If the environment
 * variable is not set, or if it's empty after parsing, it defaults to `["default"]`.
 *
 * To log a message, you must provide a channel name as the first argument.
 *
 * @example
 * ```typescript
 * // Set initial channels via environment variable (e.g., in your shell or Deno run command)
 * // LOG_CHANNELS="default,api" deno run your_script.ts
 *
 * import { LogChannel } from "./logchannel.ts";
 *
 * // To dynamically change active channels:
 * LogChannel.setChannel(["api", "worker"]); // Activates "api" and "worker"
 *
 * LogChannel.log("default", "This goes to the default channel if 'default' is active."); // Explicitly use "default"
 * LogChannel.log("api", "This is an API message."); // Only logs if "api" channel is active
 * LogChannel.error("error_channel", "An error occurred in error_channel.");
 * LogChannel.debug("debug_info", "Detailed debug information for 'debug_info' channel.");
 *
 * // If you call LogChannel.log("inactive_channel", "message"), nothing will be printed
 * // if "inactive_channel" is not in the activeChannels list.
 * ```
 */
export const LogChannel = (() => {
    let activeChannels: string[];

    // Initialize activeChannels from environment variable or set a default
    const initChannels = () => {
        try {
            const channelsFromEnv = Deno.env.get("LOG_CHANNELS");
            if (channelsFromEnv && channelsFromEnv.trim() !== "") {
                activeChannels = channelsFromEnv
                    .split(',')
                    .map(ch => ch.trim())
                    .filter(ch => ch !== ""); // Remove empty strings resulting from trim
                if (activeChannels.length === 0) {
                    // If LOG_CHANNELS was set but resulted in an empty list (e.g., " , ")
                    activeChannels = ["default"];
                }
            } else {
                // LOG_CHANNELS is not set or is an empty string
                activeChannels = ["default"];
            }
        } catch (_e) {
            // Deno.env.get might not be available or permissions might be missing.
            activeChannels = ["default"];
        }
    };

    initChannels(); // Initialize channels when the module is loaded

    /**
     * Sets the active logging channels.
     * Only messages sent to these channels will be logged.
     * @param {(string|string[])} channels - A single channel name or an array of channel names to activate.
     *                                     Empty strings or arrays containing only empty strings will result in no active channels.
     */
    const setChannel = (channels: string | string[]) => {
        if (Array.isArray(channels)) {
            activeChannels = channels.map(ch => ch.trim()).filter(ch => ch !== "");
        } else {
            const trimmedChannel = channels.trim();
            activeChannels = trimmedChannel !== "" ? [trimmedChannel] : [];
        }
    };

    /**
     * Internal helper to process log, error, and debug messages.
     * @param outputFn - The console function to use (console.log, console.error, or console.debug).
     * @param channel - The channel name for this log message.
     * @param messages - The messages to log.
     * @param logType - Optional. The type of log (e.g., "ERROR", "DEBUG") to include in the prefix.
     */
    const _processLogEvent = (
        outputFn: (...data: any[]) => void,
        channel: string,
        messages: unknown[],
        logType?: "ERROR" | "DEBUG"
    ) => {
        // Log only if the channel is active and there are actual messages to log.
        if (messages.length > 0 && activeChannels.includes(channel)) {
            const prefix = logType
                ? `[${channel.toUpperCase()}:${logType}]`
                : `[${channel.toUpperCase()}]`;
            outputFn(prefix, ...messages);
        }
    };

    /**
     * Logs messages to `console.log` if the specified channel is active.
     *
     * @param {string} channel - The channel name.
     * @param {...unknown[]} messages - The messages to log.
     *
     * @example
     * LogChannel.setChannel("api");
     * LogChannel.log("api", "User logged in", { userId: 123 }); // Logs "[API] User logged in { userId: 123 }"
     * LogChannel.log("default", "This won't print unless 'default' is also active.");
     */
    const log = (channel: string, ...messages: unknown[]) => {
        _processLogEvent(console.log, channel, messages); // No logType for standard log
    };

    /**
     * Logs error messages to `console.error` if the specified channel is active.
     * The log output will be prefixed with `[CHANNEL:ERROR]`.
     *
     * @param {string} channel - The channel name.
     * @param {...unknown[]} messages - The error messages to log.
     *
     * @example
     * LogChannel.setChannel("critical");
     * LogChannel.error("critical", "Database connection failed!"); // Logs "[CRITICAL:ERROR] Database connection failed!" via console.error
     */
    const error = (channel: string, ...messages: unknown[]) => {
        _processLogEvent(console.error, channel, messages, "ERROR");
    };

    /**
     * Logs debug messages to `console.debug` if the specified channel is active.
     * The log output will be prefixed with `[CHANNEL:DEBUG]`.
     *
     * @param {string} channel - The channel name.
     * @param {...unknown[]} messages - The debug messages to log.
     *
     * @example
     * LogChannel.setChannel("network_trace");
     * LogChannel.debug("network_trace", "Packet received:", { size: 1024 }); // Logs "[NETWORK_TRACE:DEBUG] Packet received: { size: 1024 }" via console.debug
     */
    const debug = (channel: string, ...messages: unknown[]) => {
        _processLogEvent(console.debug, channel, messages, "DEBUG");
    };

    return {
        setChannel,
        log,
        error,
        debug,
        /**
         * Gets the currently active channels.
         * @returns {string[]} A copy of the active channels array.
         */
        getActiveChannels: () => [...activeChannels] // Return a copy to prevent external modification
    };
})();