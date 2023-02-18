/* eslint-disable import/order,import/first */
import { registerRootComponent } from "expo";

import { bootCryptoPolyfill } from "./crypto-polyfill";

bootCryptoPolyfill();

import { App } from "./app";

registerRootComponent(App);
