const esbuild = require("esbuild");

esbuild
    .build({
        entryPoints: ["src/writeItem.ts"],
        outfile: "dist-esbuild/writeItem.js",
        bundle: true,
        platform: "node",
        target: "es2020",
        sourcemap: true,
        format: "cjs",
    })
    .then(() => console.log("Build successful!"))
    .catch((err) => {
        console.error("Build failed:", err);
        process.exit(1);
    });
