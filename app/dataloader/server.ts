import { json } from "remix";
import type { EntryContext } from "remix";

import { isResponse } from "@remix-run/server-runtime/responses";
import type { ServerBuild } from "@remix-run/server-runtime";
import type { Dataloader } from "./context";

export function createServerDataloader(
  build: EntryContext,
  request: Request,
  params: any,
  context: any
): Dataloader {
  return {
    async load(id) {
      let route = build.routeModules[id];
      if (!route) {
        throw new Error(`Route ${id} not found`);
      }

      let loader = (route as any).loader;
      if (!loader) {
        throw new Error(`Route ${id} has no loader`);
      }

      let result = await loader({ request, params, context });

      return isResponse(result) ? result : json(result);
    },
  };
}
