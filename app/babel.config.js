module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        "module-resolver",
        {
          root: ["."],
          extensions: [
            ".ios.js",
            ".android.js",
            ".ios.jsx",
            ".android.jsx",
            ".js",
            ".jsx",
            ".json",
            ".tsx",
            ".ts",
          ],
          alias: {
            // This needs to be mirrored in tsconfig.json
            "@": "./",
            "@components": "./components",
            "@constants": "./constants",
            "@store": "./store",
            "@types": "./types",
            "@utils": "./utils",
            "@graphql": "./graphql",
            "@screens": "./screens",
            "@assets": "./assets",
            "@services": "./services",
            "@hooks": "./hooks",
            // Add any other aliases you have in your tsconfig.json
          },
        },
      ],
      // Required for expo-router
      // Reanimated plugin has to be listed last
      "react-native-reanimated/plugin",
    ],
  };
};
