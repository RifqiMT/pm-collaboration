const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);
const coreRoot = path.resolve(projectRoot, "../../packages/core");

config.watchFolders = [coreRoot];
config.resolver.extraNodeModules = {
  "@cadence/core": coreRoot,
};
config.resolver.nodeModulesPaths = [path.resolve(projectRoot, "node_modules")];

module.exports = config;
