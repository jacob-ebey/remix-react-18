import { hydrateRoot } from "react-dom";
import { RemixBrowser } from "remix";

import { createBrowserDataloader } from "./dataloader/browser";
import { DataloaderProvider } from "./dataloader/lib";

let dataloader = createBrowserDataloader();

hydrateRoot(
  document,
  <DataloaderProvider dataloader={dataloader}>
    <RemixBrowser />
  </DataloaderProvider>
);
