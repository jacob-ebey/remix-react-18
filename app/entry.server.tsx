import { PassThrough } from "stream";

// @ts-expect-error
import { renderToPipeableStream } from "react-dom/server";
import { RemixServer } from "remix";
import type { EntryContext } from "remix";

import { DataloaderProvider } from "./dataloader/lib";
import { createServerDataloader } from "./dataloader/server";

export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext
) {
  let dataloader = createServerDataloader(remixContext, request, {}, {});

  responseHeaders.set("Content-Type", "text/html");
  return renderToStringWithWritable(
    <DataloaderProvider dataloader={dataloader}>
      <RemixServer context={remixContext} url={request.url} />
    </DataloaderProvider>,
    {
      status: responseStatusCode,
      headers: responseHeaders,
    }
  );
}

function renderToStringWithWritable(
  element: any,
  init: ResponseInit,
  timeout = 2000
) {
  return new Promise<Response>((resolve, reject) => {
    const writable = new PassThrough();
    console.log("HERE!");
    let didError = false;
    const { pipe, abort } = renderToPipeableStream(element, {
      onCompleteShell() {
        console.log("HERE 2!");
        pipe(writable);

        if (didError) {
          init.status = 500;
          init.statusText = "Internal Server Error";
        }
        // Response is buffering the stream 🤬
        resolve(new Response(writable as any, init));
      },
      onError(err: Error) {
        console.error(err);
        didError = true;
      },
    });

    setTimeout(abort, timeout);
  });
}
