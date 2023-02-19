declare const __DEV__: boolean;
const isProd = !__DEV__;

export const skipFreeze = isProd;
export const skipFrozenAsserts = isProd;
export const skipAssertJSONValue = isProd;
