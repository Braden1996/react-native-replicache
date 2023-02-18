/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/explicit-function-return-type */

const { getDefaultConfig } = require("expo/metro-config");
const getWorkspaces = require("get-yarn-workspaces");
const path = require("path");

async function getMetroConfig(dirname) {
  const defaultConfig = await getDefaultConfig(dirname);
  const workspaces = getWorkspaces(dirname).filter(
    (pathItem) => !path.extname(pathItem)
  );
  const workspaceRoot = path.resolve(dirname, "../../..");

  return {
    ...defaultConfig,
    watchFolders: [
      dirname,
      path.resolve(workspaceRoot, "./node_modules"),
      ...workspaces,
    ],

    resolver: {
      nodeModulesPath: [
        path.join(__dirname, "./node_modules"),
        path.join(workspaceRoot, "./node_modules"),
        ...workspaces.map((dir) => path.resolve(dir, "node_modules")),
      ],
    },
  };
}

module.exports = getMetroConfig(__dirname);
