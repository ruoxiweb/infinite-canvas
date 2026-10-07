/// <reference types="vite/client" />

declare const __APP_VERSION__: string;
declare const __APP_RELEASES__: import("@/lib/release").ReleaseInfo[];

interface ImportMetaEnv {
    // Comma-separated local development plugin URLs, refetched on every startup without caching or persistence.
    readonly VITE_DEV_PLUGINS?: string;
    // Optional build-time analytics configuration, with one independent variable per provider.
    // GA4 measurement ID (G-XXXX)
    readonly VITE_ANALYTICS_GA4_ID?: string;
    // Baidu Analytics site ID
    readonly VITE_ANALYTICS_BAIDU_ID?: string;
    // Built-in team channel injected for signed-in Cloudflare Access users (see CLOUDFLARE.md).
    // Email domain (without @) whose signed-in users receive the team channel.
    readonly VITE_TEAM_EMAIL_DOMAIN?: string;
    // Base URL of the team channel; both this and VITE_TEAM_API_KEY must be set to enable injection.
    readonly VITE_TEAM_BASE_URL?: string;
    readonly VITE_TEAM_API_KEY?: string;
    // Optional display name for the team channel.
    readonly VITE_TEAM_CHANNEL_NAME?: string;
    // Optional comma-separated model names to preload into the team channel.
    readonly VITE_TEAM_MODELS?: string;
}
