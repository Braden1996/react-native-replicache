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

Here we provide a store implementation backed by [`expo-sqlite`](https://docs.expo.dev/versions/latest/sdk/sqlite/). However, we also offer [more bindings here](https://github.com/Braden1996/react-native-replicache). Be sure to see what best fits your project!

### Any additional considerations?

Some configuration is required to receive [poke](https://doc.replicache.dev/byob/poke) events from the server. In our example, [seen here](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/use-replicache.ts), we use a polyfill for Server Sent Events. These aren't built into React Native, but are really handy for a demo.

You most likely want to use web-sockets for this. This is relatively trivial with Pusher/Ably etc and similar to the web-app so we won't discuss that further here.

## How can I install this?

1. Install the following in your React Native project:
   - `yarn add expo-crypto expo-sqlite @react-native-replicache/react-native-expo-sqlite`
2. Ensure that you've polyfilled `crypto.getRandomValues` on the global namespace.
   - See [here for an example](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/crypto-polyfill.ts).
3. Pass in `createReplicacheExpoSQLiteKVStore` to Replicache's `kvStore` option.
   - See [here for an example](https://github.com/Braden1996/react-native-replicache/blob/master/packages/example/mobile-react-native/src/use-replicache.ts).
