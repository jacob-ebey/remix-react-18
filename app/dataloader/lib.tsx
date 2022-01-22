import { useId, useMemo } from "react";
import invariant from "@remix-run/react/invariant";
import jsesc from "jsesc";

import { useDataloader } from "./context";
export { DataloaderProvider } from "./context";

export function useLoader<T = any>(id: string) {
  let dataloader = useDataloader();
  let internalId = useId();

  let defered = useMemo(() => {
    invariant(
      dataloader,
      "useLoader must be provided with a DataloaderProvider"
    );

    let defered = {} as {
      value?: T;
      error?: any;
      promise: Promise<void>;
    };
    defered.promise = dataloader
      .load(id, internalId)
      .then((response) => response.json())
      .then((value) => {
        defered.value = value;
      })
      .catch((error) => {
        defered.error = error;
      });
    return defered;
  }, [id]);

  return {
    Component() {
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
      return null;
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
