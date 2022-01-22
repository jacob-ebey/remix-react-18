import { createContext, useContext } from "react";
import type { FC } from "react";

export interface Dataloader {
  load(id: string, internalId: string): Promise<Response>;
}

let context = createContext<Dataloader | undefined>(undefined);

export let DataloaderProvider: FC<{ dataloader: Dataloader }> = ({
  children,
  dataloader,
}) => {
  return <context.Provider value={dataloader}>{children}</context.Provider>;
};

export let useDataloader = () => useContext(context);
