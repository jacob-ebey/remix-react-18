import { useId, useMemo } from "react";
import { useLocation } from "remix";
import invariant from "@remix-run/react/invariant";
import jsesc from "jsesc";

import { useDataloader } from "./context";
export { DataloaderProvider } from "./context";

export function useLoader<T = any>(id: string) {
  let dataloader = useDataloader();
  let internalId = useId();
  let { key } = useLocation();

  let defered = useMemo(() => {
    invariant(
      dataloader,
      "useLoader must be provided with a DataloaderProvider"
    );

    let defered = { resolved: false } as {
      resolved: boolean;
      value?: T;
      error?: any;
      promise: Promise<void>;
    };
    defered.promise = dataloader
      .load(id, internalId)
      .then((response) => response.json())
      .then((value) => {
        defered.value = value;
        defered.resolved = true;
      })
      .catch((error) => {
        defered.error = error;
        defered.resolved = true;
      });
    return defered;
  }, [id, key]);

  return {
    Component() {
      if (!defered.resolved) throw defered.promise;

      if (typeof document === "undefined") {
        let serialized = jsesc(
          { error: defered.error, value: defered.value },
          { isScriptContext: true }
        );
        return (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.__remix_dataloader = window.__remix_dataloader||{};window.__remix_dataloader[${JSON.stringify(
                internalId
              )}] = ${serialized};`,
            }}
          />
        );
      }
      return (
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: " " }}
        />
      );
    },
    load(): T {
      if (typeof defered.value !== "undefined") {
        return defered.value;
      }
      if (typeof defered.error !== "undefined") {
        throw defered.error;
      }

      throw defered.promise;
    },
  };
}
