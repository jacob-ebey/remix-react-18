import { Suspense } from "react";
import { useLoaderData } from "remix";
import type { LoaderFunction } from "remix";

import { useLoader } from "~/dataloader/lib";
import type { Post } from "~/routes/api/posts";

type LoaderData = {
  username: string;
};

export let loader: LoaderFunction = () => {
  return {
    username: "Remix",
  };
};

function SuspendedProfileInfo({ getPosts }: { getPosts: () => Post[] }) {
  let posts = getPosts();

  return (
    <pre>
      <code>{JSON.stringify(posts, null, 2)}</code>
    </pre>
  );
}

export default function Profile() {
  let { username } = useLoaderData<LoaderData>();
  let postsLoader = useLoader<Post[]>("routes/api/posts");

  return (
    <>
      <h1>Profile: {username}</h1>
      <Suspense fallback="Loading Profile....">
        <SuspendedProfileInfo getPosts={postsLoader.load} />
        <postsLoader.Component />
      </Suspense>
    </>
  );
}
