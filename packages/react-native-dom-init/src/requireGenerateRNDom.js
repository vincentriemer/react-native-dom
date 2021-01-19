export const requireGenerateRNDom = () => {
  const requirePath = require.resolve('react-native-dom/generateDom', {
    paths: [process.cwd()],
  });
  return require(requirePath);
}