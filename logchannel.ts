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

/**
 * Defines the interface for the LogChannel module.
 */
export interface ILogChannel {
    /**
     * Sets the active logging channels.
     * Only messages sent to these channels will be logged.
     * @param channels - A single channel name or an array of channel names to activate.
     *                   Empty strings or arrays containing only empty strings will result in no active channels.
     */
    setChannel: (channels: string | string[]) => void;
    /**
     * Logs messages to `console.log` if the specified channel is active.
     * @param channel - The channel name.
     * @param messages - The messages to log.
     */
    log: (channel: string, ...messages: unknown[]) => void;
    /**
     * Logs error messages to `console.error` if the specified channel is active.
     * The log output will be prefixed with `[CHANNEL:ERROR]`.
     * @param channel - The channel name.
     * @param messages - The error messages to log.
     */
    error: (channel: string, ...messages: unknown[]) => void;
    /**
     * Logs debug messages to `console.debug` if the specified channel is active.
     * The log output will be prefixed with `[CHANNEL:DEBUG]`.
     * @param channel - The channel name.
     * @param messages - The debug messages to log.
     */
    debug: (channel: string, ...messages: unknown[]) => void;
    /**
     * Gets the currently active channels.
     * @returns A copy of the active channels array.
     */
    getActiveChannels: () => string[];
}

export const LogChannel: ILogChannel = (() => {
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

    const setChannel = (channels: string | string[]) => {
        if (Array.isArray(channels)) {
            activeChannels = channels.map(ch => ch.trim()).filter(ch => ch !== "");
        } else {
            const trimmedChannel = channels.trim();
            activeChannels = trimmedChannel !== "" ? [trimmedChannel] : [];
        }
    };

    const _processLogEvent = (
        outputFn: (...data: any[]) => void,
        channel: string,
        messages: unknown[],
        logType?: "ERROR" | "DEBUG"
    ) => {
        if (messages.length > 0 && activeChannels.includes(channel)) {
            const prefix = logType
                ? `[${channel.toUpperCase()}:${logType}]`
                : `[${channel.toUpperCase()}]`;
            outputFn(prefix, ...messages);
        }
    };

    const log = (channel: string, ...messages: unknown[]) => {
        _processLogEvent(console.log, channel, messages);
    };

    const error = (channel: string, ...messages: unknown[]) => {
        _processLogEvent(console.error, channel, messages, "ERROR");
    };

    const debug = (channel: string, ...messages: unknown[]) => {
        _processLogEvent(console.debug, channel, messages, "DEBUG");
    };

    return {
        setChannel,
        log,
        error,
        debug,
        getActiveChannels: () => [...activeChannels]
    };
})();