import { mutators } from "@react-native-replicache/example-shared";
import { createReplicacheExpoSQLiteExperimentalCreateKVStore } from "@react-native-replicache/react-native-expo-sqlite";
// import { createReplicacheReactNativeOpSQLiteExperimentalCreateKVStore } from "@react-native-replicache/react-native-op-sqlite";
import React from "react";
import EventSource from "react-native-sse";
import { Replicache, TEST_LICENSE_KEY } from "replicache";

export function useReplicache(listID: string) {
  // See https://doc.replicache.dev/licensing for how to get a license key.
  const licenseKey = TEST_LICENSE_KEY;
  if (!licenseKey) {
    throw new Error("Missing VITE_REPLICACHE_LICENSE_KEY");
  }

  const r = React.useMemo(
    () =>
      new Replicache({
        licenseKey,
        pushURL: `http://127.0.0.1:8080/api/replicache/push?spaceID=${listID}`,
        pullURL: `http://127.0.0.1:8080/api/replicache/pull?spaceID=${listID}`,
        experimentalCreateKVStore:
          createReplicacheExpoSQLiteExperimentalCreateKVStore,
        name: listID,
        mutators,
      }),
    [listID]
  );

  React.useEffect(() => {
    // Note: React Native doesn't support SSE; this is just a polyfill.
    // You probably want to setup a WebSocket connection via Pusher.
    const ev = new EventSource(
      `http://127.0.0.1:8080/api/replicache/poke?spaceID=${listID}`,
      {
        headers: {
          withCredentials: true,
        },
      }
    );

    ev.addEventListener("message", async (evt) => {
      if (evt.type !== "message") return;
      if (evt.data === "poke") {
        await r.pull();
      }
    });

    return () => {
      ev.close();
    };
  }, [listID]);

  return r;
}
