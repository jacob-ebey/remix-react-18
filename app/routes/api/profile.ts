import { LoaderFunction } from "remix";

export type Profile = {
  name: string;
  age: number;
};

export let loader: LoaderFunction = async (): Promise<Profile> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return {
    name: "Jill",
    age: 27,
  };
};
