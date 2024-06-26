import { ActionIcon, Group, Title } from "@mantine/core";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import queryString from "query-string";
import { useHistory, useLocation, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import Feeds from "../../components/Feeds";

export function ProfileFeeds() {
  const { username } = useParams<{ username: string }>();
  const { search, state } = useLocation();
  const values = queryString.parse(search);
  const history = useHistory();

  return (
    <AppShell
      header={
        <Group>
          <ActionIcon onClick={() => history.goBack()} variant="light">
            <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
          </ActionIcon>

          <Title order={3} fz={20} weight={600}>
            Profile Feeds
          </Title>
        </Group>
      }
    >
      <Feeds
        index={values.post ? parseInt(String(values.post ?? 0)) : null}
        username={username}
        initialData={state?.data}
      />
    </AppShell>
  );
}
