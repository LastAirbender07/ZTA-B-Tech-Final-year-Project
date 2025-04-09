// fingerprintUtils.js

export async function generateDeviceFingerprint() {
    try {
        // Browser Information
        const browserInfo = {
            userAgent: navigator.userAgent || "unknown",
            screenResolution: `${window.screen.width || "unknown"}x${window.screen.height || "unknown"}`,
            colorDepth: window.screen.colorDepth || "unknown",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
            plugins: Array.from(navigator.plugins || []).map(plugin => plugin.name) || [],
            languages: navigator.languages || ["unknown"],
            cookiesEnabled: navigator.cookieEnabled !== undefined ? navigator.cookieEnabled : "unknown",
            doNotTrack: navigator.doNotTrack || "unknown",
            windowSize: `${window.innerWidth || "unknown"}x${window.innerHeight || "unknown"}`,
        };

        // Hardware Information
        const hardwareInfo = {
            hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
            deviceMemory: navigator.deviceMemory || "unknown",
            maxTouchPoints: navigator.maxTouchPoints || "unknown",
            touchSupport: "ontouchstart" in window,
        };

        // Graphics Information
        let canvasFingerprint = "unknown";
        let webglRenderer = "unknown";

        try {
            const canvas = document.createElement("canvas");
            const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
            const debugInfo = gl?.getExtension("WEBGL_debug_renderer_info");
            webglRenderer = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : "unknown";

            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.textBaseline = "top";
                ctx.font = "14px Arial";
                ctx.fillText("fingerprinting", 10, 10);
                canvasFingerprint = canvas.toDataURL();
            }
        } catch (error) {
            console.error("Error gathering graphics information:", error.message);
        }

        // Combine all information
        const fingerprintData = {
            ...browserInfo,
            ...hardwareInfo,
            webglRenderer,
            canvasFingerprint,
        };

        // Generate Unique Hash
        const fingerprintString = JSON.stringify(fingerprintData);
        const fingerprintHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(fingerprintString));
        const fingerprint = Array.from(new Uint8Array(fingerprintHash))
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");

        return { fingerprint, fingerprintData };
    } catch (error) {
        console.error("Error generating device fingerprint:", error.message);
        throw error;
    }
}
