# React Native Replicache

Plug-in React native compatibility bindings for Replicache.

https://user-images.githubusercontent.com/5165963/219898954-f5e94045-69bf-4c33-84e8-7d152c6f2c32.mov

## Why is this needed?

By default, Replicache uses IndexedDB in the web-browser. This technology isn't available in React Native, but luckily Replicache is generic enough to allow us to provide our own local persistance provider.

## What's the strategy?

Currently, the strategy is to provide an implementation of Replicache's `ExperimentalCreateKVStore` backed by  [`react-native-quick-sqlite`](https://github.com/ospfranco/react-native-quick-sqlite).

Additionally, some configuration is required to received poke events from the server.

## How can I install this?

1. Install the following in your React Native project:
    - `yarn add @react-native-replicache/react-native-quick-sqlite react-native-quick-sqlite expo-crypto`
2. Ensure that you've polyfilled `crypto.getRandomValues` on the global namespace.
  - See [here for an example](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/crypto-polyfill.ts).
3. Pass `createReplicacheQuickSQLiteExperimentalCreateKVStore` into Replicache's `experimentalCreateKVStore` option.
  - See [here for an example](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/use-replicache.ts).

## What else will I need to do?

- Configure a poke mechanism.
  - You will likely want to use web-sockets for this, managed via Pusher/Ably/etc
  - In our example, [seen here](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/use-replicache.ts), we use a polyfill for Server Sent Events.
    - These aren't built into React Native, but are really handy for a demo.

## How can I experiment with this locally?

### Prerequisites:

- Environment capable of developing iOS/Android applications (iOS is likely preferred).
  - See https://dev-yakuza.posstree.com/en/react-native/install-on-mac/
    - or: https://reactnative.dev/docs/environment-setup
    - Note: Installing [Xcode](https://developer.apple.com/xcode/) from the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12) tends to be unusually slow and buggy.
      - Try the `Download -> Website` approach instead, [found here](https://developer.apple.com/xcode/).

1. Clone the repository: `git clone https://github.com/braden1996/react-native-replicache.git`
2. Install yarn dependencies from repo root: `yarn install`
3. Perform an initial build: `yarn build`
4. Install the example iOS app onto a simulator/emulator or connected physical device, e.g: `yarn workspace @react-native-replicache/example-mobile-react-native ios`
5. Once the above has installed onto your device, you can cancel the now running [Metro bundler](https://facebook.github.io/metro/) and simply start dev for all workspaces: `yarn run dev`.

### Tips

- [Flipper](https://fbflipper.com/) has been configured for use with the example app.
  - Download it to browser network requests etc


## Future Thoughts

- I'm debating switch underlying React Native <> SQLite binding.
  - Options are:
    - [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/)
    - [`react-native-sqlite-storage`](https://github.com/andpor/react-native-sqlite-storage)
