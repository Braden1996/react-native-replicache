# React Native Replicache

> Plug-in React Native compatibility bindings for [Replicache](https://replicache.dev/).

<https://user-images.githubusercontent.com/5165963/219898954-f5e94045-69bf-4c33-84e8-7d152c6f2c32.mov>

## Replicache version compatibility

- 1.0.0 : replicache <= 14.2.2
- 1.3.0 : replicache >= 15

## Why is this needed?

Replicache enables us to build applications that are performant, offline-capable and collaborative. By default, it uses [IndexedDB](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for client-side persistance. Unfortunately, this technology is not available in React Native and is only supported in web-browsers.

Thankfully, Replicache allows us to provide our own transactional data-store via [`kvStore`](https://doc.replicache.dev/api/interfaces/ReplicacheOptions#kvstoree). The goal of this project is to provide some implementations of such a store, along with some guidance in getting up and running with Replicache in React Native.

## What are the strategies?

React Native has relatively good support for SQLite - which provides the [strict serializable](https://jepsen.io/consistency/models/strict-serializable) transactions that we require.

In particular, we provide the choice between three SQLite bindings:

1. [`@react-native-replicache/react-native-expo-sqlite`](https://github.com/Braden1996/react-native-replicache/tree/master/packages/react-native-expo-sqlite)
   - Backed by [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/)
   - Supported in [Expo Go](https://expo.dev/client).
2. [`@react-native-replicache/react-native-op-sqlite`](https://github.com/Braden1996/react-native-replicache/tree/master/packages/react-native-op-sqlite)
   - Backed by [`react-native-op-sqlite`](https://github.com/OP-Engineering/op-sqlite)
   - Better performance.

### Any additional considerations?

Some configuration is required to receive [poke](https://doc.replicache.dev/byob/poke) events from the server. In our example, [seen here](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/use-replicache.ts), we use a polyfill for Server Sent Events. These aren't built into React Native, but are really handy for a demo.

You most likely want to use web-sockets for this. This is relatively trivial with Pusher/Ably etc and similar to the web-app so we won't discuss that further here.

## How can I install this?

1. Install the following in your React Native project:
   - `yarn add expo-crypto`
   - Decide which SQLite binding is for you and install one of the following:
     - `yarn add @op-engineering/op-sqlite @react-native-replicache/react-native-op-sqlite`
     - `yarn add expo-sqlite @react-native-replicache/expo-sqlite`
2. Ensure that you've polyfilled `crypto.getRandomValues` on the global namespace.
   - See [here for an example](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/crypto-polyfill.ts).
3. Pass in your chosen SQLite binding's React Native Replicache binding into Replicache's `kvStore` option.
   - This will be one of the following, depending on the binding you chose:
     - `createReplicacheOPSQLiteKVStore`
     - `createReplicacheExpoSQLiteKVStore`
   - See [here for an example](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/use-replicache.ts).

## How can I experiment with this locally?

### Prerequisites

- Environment capable of developing iOS/Android applications (iOS is likely preferred).
  - See [How to install React Native on Mac](https://dev-yakuza.posstree.com/en/react-native/install-on-mac/)
    - or: [Setting up the development environment](https://reactnative.dev/docs/environment-setup)
  - Note: Installing [Xcode](https://developer.apple.com/xcode/) from the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12) tends to be unusually slow and buggy.
    - Try download it from the [Apple website](https://developer.apple.com/xcode/) instead.

### Instructions

1. Clone the repository: `git clone https://github.com/braden1996/react-native-replicache.git`
2. Install yarn dependencies from repo root: `yarn install`
3. Perform an initial build: `yarn build`
4. Install the example iOS app onto a simulator/emulator or connected physical device, e.g: `yarn workspace @react-native-replicache/example-mobile-react-native ios`
5. Once the above has installed onto your device, you can cancel the now running [Metro bundler](https://facebook.github.io/metro/) and simply start dev for all workspaces: `yarn run dev`.

### Tips

- [Flipper](https://fbflipper.com/) has been configured for use with the example app.
  - Download it to browser network requests etc
