import type { OutgoingHttpHeaders } from "http";

// @ts-expect-error
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "remix";
import type { EntryContext } from "remix";

import { Context } from "./context";
import { DataloaderProvider } from "./dataloader/lib";
import { createServerDataloader } from "./dataloader/server";

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  { res }: Context
) {
  let dataloader = createServerDataloader(remixContext, request, {}, {});

  responseHeaders.set("Content-Type", "text/html; charset=UTF-8");
  responseHeaders.set("Transfer-Encoding", "chunked");

  return new Promise<void>((resolve) => {
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(
      <DataloaderProvider dataloader={dataloader}>
        <RemixServer context={remixContext} url={request.url} />
      </DataloaderProvider>,
      {
        onCompleteShell() {
          let statusCode = didError ? 500 : responseStatusCode;
          let headers: Record<string, string | string[]> = {};
          for (const [key, value] of responseHeaders) {
            if (typeof headers[key] === "string") {
              headers[key] = [headers[key] as string, value];
            } else if (Array.isArray(headers[key])) {
              (headers[key] as string[]).push(value);
            } else {
              headers[key] = value;
            }
          }
          console.log(headers);
          res.writeHead(statusCode, headers);
          pipe(res);

          resolve();
        },
        onError(err: Error) {
          console.error(err);
          didError = true;
        },
      }
    );

    setTimeout(abort, 2000);
  });
}
