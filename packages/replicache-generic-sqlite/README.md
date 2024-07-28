# React Native Replicache - Generic SQLite

> Plug-in React Native compatibility bindings for [Replicache](https://replicache.dev/).

<https://user-images.githubusercontent.com/5165963/219898954-f5e94045-69bf-4c33-84e8-7d152c6f2c32.mov>

## Replicache version compatibility

- 1.0.0 : replicache <= 14.2.2
- 1.3.0 : replicache >= 15

## Why is this needed?

This package provides a generic SQLite implementation of [`kvStore`](https://doc.replicache.dev/api/interfaces/ReplicacheOptions#kvstoree) that is agnostic of the underlying SQLite binding. This abstraction enables us to easily support multiple SQLite bindings. It isn't coupled to React Native either, so could work on other platforms - but that remains to be explored.
