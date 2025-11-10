module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // This is the animation plugin we need to add
      "react-native-reanimated/plugin",
    ],
  };
};
