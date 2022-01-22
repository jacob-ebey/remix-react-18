import { Suspense } from "react";

import { useLoader } from "~/dataloader/lib";
import type { Profile } from "~/routes/api/profile";

function SuspendedProfileInfo({ getProfile }: { getProfile: () => Profile }) {
  let profile = getProfile();

  return (
    <pre>
      <code>{JSON.stringify(profile, null, 2)}</code>
    </pre>
  );
}

export default function Profile() {
  let profileLoader = useLoader<Profile>("routes/api/profile");

  return (
    <>
      <h1>Profile</h1>
      <Suspense fallback="Loading Profile....">
        <SuspendedProfileInfo getProfile={profileLoader.load} />
        <profileLoader.Component />
      </Suspense>
    </>
  );
}
