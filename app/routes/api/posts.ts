import { LoaderFunction } from "remix";

export type Post = {
  id: string;
  title: string;
};

export let loader: LoaderFunction = async (): Promise<Post[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  let results: Post[] = [];

  for (let i = 0; i < 10; i++) {
    results.push({
      id: `${i}`,
      title: `Post ${i}`,
    });
  }

  return results;
};
