import { mutators } from "@react-native-replicache/example-shared";
// import { createReplicacheExpoSQLiteKVStore } from "@react-native-replicache/react-native-expo-sqlite";
import { createReplicacheReactNativeOPSQLiteKVStore } from "@react-native-replicache/react-native-op-sqlite";
import React from "react";
import EventSource from "react-native-sse";
import { Replicache, TEST_LICENSE_KEY, dropAllDatabases } from "replicache";

export function useReplicache(listID: string) {
  // See https://doc.replicache.dev/licensing for how to get a license key.
  const licenseKey = TEST_LICENSE_KEY;
  if (!licenseKey) {
    throw new Error("Missing VITE_REPLICACHE_LICENSE_KEY");
  }

  const rep = React.useMemo(
    () =>
      new Replicache({
        licenseKey,
        pushURL: `http://127.0.0.1:8080/api/replicache/push?spaceID=${listID}`,
        pullURL: `http://127.0.0.1:8080/api/replicache/pull?spaceID=${listID}`,
        kvStore: createReplicacheReactNativeOPSQLiteKVStore,
        name: listID,
        mutators,
      }),
    [listID],
  );

  const close = React.useCallback(async () => {
    await rep.close();
    await dropAllDatabases({
      kvStore: createReplicacheReactNativeOPSQLiteKVStore,
    });
  }, []);

  React.useEffect(() => {
    // Note: React Native doesn't support SSE; this is just a polyfill.
    // You probably want to setup a WebSocket connection via Pusher.
    const ev = new EventSource(
      `http://127.0.0.1:8080/api/replicache/poke?spaceID=${listID}`,
      {
        headers: {
          withCredentials: true,
        },
      },
    );

    ev.addEventListener("message", async (evt) => {
      if (evt.type !== "message") return;
      if (evt.data === "poke") {
        await rep.pull();
      }
    });

    return () => {
      ev.close();
    };
  }, [listID]);

  return { rep, close };
}
