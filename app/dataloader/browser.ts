import type { Dataloader } from "./context";

export function createBrowserDataloader(): Dataloader {
  return {
    async load(id, internalId) {
      let cache = (window as any).__remix_dataloader || {};
      let cached = cache[internalId];
      if (cached) {
        if (typeof cached.value !== "undefined") {
          return new Response(JSON.stringify(cached.value));
        }

        if (typeof cached.error !== "undefined") {
          throw cached.error;
        }
      }

      let url = new URL(
        id.replace("root", "/").replace("routes/", "/"),
        window.location.href
      );
      url.searchParams.set("_data", id);

      return fetch(url.toString());
    },
  };
}
