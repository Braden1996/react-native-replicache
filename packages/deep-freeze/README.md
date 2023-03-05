# Deep Freeze

## Why is this needed?

This package includes some snippets taken from Replicache's internals. It provides a mechanism for us to enforce immutability on the data that comes out of our Replicache store, by giving us stricter types along with some checks when in development mode. In production, it does nothing meaningful.
