const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

// Get the project root directory
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

// Create the default Metro config
const config = getDefaultConfig(projectRoot);

// Enable watchFolders for monorepo support if needed
config.watchFolders = [projectRoot];

// Add path aliases to the Metro resolver
config.resolver = {
  ...config.resolver,
  // Define aliases for your project's paths
  alias: {
    "@": __dirname,
    "@components": path.resolve(__dirname, "components"),
    "@constants": path.resolve(__dirname, "constants"),
    "@store": path.resolve(__dirname, "store"),
    "@types": path.resolve(__dirname, "types"),
    "@utils": path.resolve(__dirname, "utils"),
    "@graphql": path.resolve(__dirname, "graphql"),
    "@screens": path.resolve(__dirname, "screens"),
    "@assets": path.resolve(__dirname, "assets"),
    "@services": path.resolve(__dirname, "services"),
    "@hooks": path.resolve(__dirname, "hooks"),
  },
  // Use extraNodeModules specifically for overriding node modules
  extraNodeModules: {
    "@bundlr-network/client": path.resolve(
      __dirname,
      "node_modules/@bundlr-network/client/build/web/esm/index.js"
    ),
  },
  // Add file extensions to resolve
  sourceExts: [...config.resolver.sourceExts, "mjs", "cjs"],
};

// Apply NativeWind configuration
module.exports = withNativeWind(config, { input: "./global.css" });
