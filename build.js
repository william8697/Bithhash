const esbuild = require("esbuild");

esbuild.build({
    entryPoints: ["src/walletconnect.js"],
    bundle: true,
    outfile: "walletconnect.bundle.js",
    format: "iife",
    platform: "browser",
    target: ["es2020"],
    sourcemap: false,
    minify: false,
}).then(() => {
    console.log("✅ WalletConnect bundle built successfully!");
}).catch((err) => {
    console.error("❌ Build failed:", err);
    process.exit(1);
});