import { Box, SegmentedControl } from "@mantine/core";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import AppShell from "../../../components/AppShell";
import { HeaderComponent } from "../../../components/Header";
import Followers from "./Followers";
import Followings from "./Followings";

type Props = {};

const FollowerFollowing = (props: Props) => {
  const [tab, setTab] = useState<"followers" | "following">(
    (new URL(location.href).searchParams.get("type") as any) ?? "followers"
  );

  const history = useHistory();

  useEffect(() => {
    history.replace({
      pathname: window.location.pathname,
      search: `?type=${tab}`,
    });
  }, [tab]);

  const params = useParams();

  return (
    <AppShell
      header={<HeaderComponent title={`${params.username}'s ${tab} list`} />}
    >
      <Box p="md">
        <SegmentedControl
          mb="md"
          value={tab}
          color="blue"
          onChange={setTab as any}
          data={[
            { label: "Following", value: "following" },
            { label: "Followers", value: "followers" },
          ]}
          fullWidth
          size="md"
        />

        {tab === "followers" && <Followers username={params.username} />}
        {tab === "following" && <Followings username={params.username} />}
      </Box>
    </AppShell>
  );
};

export default FollowerFollowing;
