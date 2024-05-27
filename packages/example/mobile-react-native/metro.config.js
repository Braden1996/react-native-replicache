/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { getDefaultConfig } = require("expo/metro-config");
const getWorkspaces = require("get-yarn-workspaces");
const path = require("node:path");

/**
 * @param {import('expo/metro-config').MetroConfig} config
 * @param {string} dirname
 */
function mutateConfigForMonorepo(config, dirname) {
  const workspaces = getWorkspaces(dirname).filter(
    (pathItem) => !path.extname(pathItem),
  );
  const workspaceRoot = path.resolve(dirname, "..");

  config.resolver.watchFolders = [
    dirname,
    path.resolve(dirname, "../node_modules"),
    ...workspaces,
  ];

  config.resolver.nodeModulesPaths = [
    path.join(dirname, "./node_modules"),
    path.join(workspaceRoot, "./node_modules"),
    ...workspaces.map((directory) => path.resolve(directory, "node_modules")),
  ];
}

function getMetroConfig(dirname) {
  const config = getDefaultConfig(dirname);

  mutateConfigForMonorepo(config, dirname);

  return config;
}

module.exports = getMetroConfig(__dirname);
