import type { Dataloader } from "./context";

export function createBrowserDataloader(): Dataloader {
  return {
    async load(id, internalId) {
      let cache = (window as any).__remix_dataloader || {};
      let cached = cache[internalId];
      if (cache) {
        if (typeof cached.data !== "undefined") {
          return cached.data;
        }

        throw cached.error;
      }

      let url = new URL(window.location.href);
      url.searchParams.set("_data", id);

      return fetch(url.toString());
    },
  };
}
