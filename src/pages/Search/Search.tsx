import { IonAvatar, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import {
  Avatar,
  Box,
  Flex,
  Loader,
  Popover,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import SearchRounded from "@mui/icons-material/SearchRounded";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import AppShell from "../../components/AppShell";
import { config } from "../../config";
import { getFormattedSmallPrice } from "../../utils";
import { imgUrl } from "../../utils/media";
import { queryClient } from "../../utils/queryClient";
import { getSuggestedUsers, searchUsername } from "./search.api";
import { headset, searchOutline } from "ionicons/icons";
import usePinnedUserQuery from "../../hooks/usePinnedUserQuery";

export function Search() {
  const history = useHistory();
  const [search, setSearchQuery] = useState("");
  const [isPopoverOpened, setPopoverOpened] = useState(false);
  const [debounced] = useDebouncedValue(search, 500, { leading: true });
  const pinnedUserQuery = usePinnedUserQuery();

  const searchQuery = useQuery({
    queryKey: ["search", search ?? ""],
    queryFn: () => searchUsername(search ?? ""),
    refetchOnWindowFocus: false,
    enabled: false,
  });

  const suggestionsQuery = useQuery({
    queryKey: ["suggestions"],
    queryFn: getSuggestedUsers,
  });

  useEffect(() => {
    if (search?.length) {
      searchQuery.refetch();
    } else {
      queryClient.setQueryData(["search"], () => []);
    }
  }, [debounced]);

  useEffect(() => {
    if (queryClient.getQueriesData(["search"])) {
      queryClient.setQueryData(["search"], () => []);
    }

    setPopoverOpened(true);
  }, [history.location]);

  return (
    <AppShell
      header={
        <Popover
          withinPortal
          withArrow
          styles={{ dropdown: { width: "90vw !important" } }}
          opened={isPopoverOpened && !!search.length}
          onClose={() => setPopoverOpened(false)}
        >
          <Popover.Target>
            <TextInput
              placeholder="Search by username"
              onFocus={() => setPopoverOpened(true)}
              onBlur={() => setPopoverOpened(false)}
              value={search}
              onInput={(event) => {
                if (!debounced.length && event.currentTarget.value?.length) {
                  searchQuery.refetch();
                }

                setSearchQuery(event.currentTarget.value ?? "");
                event.currentTarget.value && setPopoverOpened(true);
              }}
              icon={<IonIcon icon={searchOutline} />}
            />
          </Popover.Target>

          <Popover.Dropdown>
            {searchQuery.isFetching && <Loader m={10} />}

            {!searchQuery.data?.length && !searchQuery.isFetching && (
              <Text size="sm" color="dimmed">
                No results found
              </Text>
            )}

            <ScrollArea.Autosize type="always" style={{ maxHeight: "30vh" }}>
              <IonList>
                {Array.isArray(searchQuery.data) &&
                  searchQuery.data.map((user) => (
                    <IonItem
                      onClick={() => {
                        setPopoverOpened(false);
                        setSearchQuery("");

                        history.push(`/app/user/${user.id}`);
                      }}
                    >
                    <IonAvatar  className="conAv" style={{width:42, height:40}}>
                    <img src={user?.avatarPath!==null? user?.avatarPath: '/avatar.png'} 
                    onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src="/avatar.png";

                    }}/>
                    </IonAvatar>
                      <IonLabel style={{paddingLeft:10}}>{user.username} {user?.popular}

                      {user?.popular===true && <>
                  <span>  <img src="/tick.svg" style={{width:15, height:15}}/></span>
                        
                      </>
                      }
                      </IonLabel>
                    </IonItem>
                  ))}
              </IonList>
            </ScrollArea.Autosize>
          </Popover.Dropdown>
        </Popover>
      }
    >
      <Box pt="xl" pb="sm">
        <Box px={"md"} mb={"xl"}>
          <Title order={3} mb={"sm"}>
            You May Like
          </Title>
        </Box>

        <Stack spacing={"xs"} px={"md"}>
          {suggestionsQuery.isLoading && (
            <Flex w="100%" h="100px" justify={"center"} my="xl">
              <Loader />
            </Flex>
          )}

          {pinnedUserQuery.data?.map((user) => (
            <Flex
              key={user.username}
              sx={(theme) => ({
                padding: "7px 10px",
                background: theme.colors.gray[0],
                border: `1px solid ${theme.colors.gray[2]}`,
                borderRadius: theme.radius.md,
              })}
              gap={"md"}
              align={"center"}
              onClick={() => history.push(`/app/user/${user.id}`)}
            >
                    <IonAvatar  className="conAv" style={{width:48, height:40}}>
                    <img src={user?.avatarPath!==null? user?.avatarPath: '/avatar.png'} 
                    onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src="/avatar.png";

                    }}/>
                    </IonAvatar>

              <Flex direction={"column"} w="100%">
                <Title order={6} fw={600}>
                  {user?.username}
                  {user?.popular===true && <>
                  <span>  <img src="/tick.svg" style={{width:15, height:15}}/></span>
                        
                      </>
                      }
                </Title>

                <Text size="xs" color="dimmed" weight={400}>
                  Dibs Price: ₹{getFormattedSmallPrice(user.price ?? 0)}
                </Text>
              </Flex>
            </Flex>
          ))}

          {suggestionsQuery.data?.map((user) => (
            <Flex
              key={user.username}
              sx={(theme) => ({
                padding: "7px 10px",
                background: theme.colors.gray[0],
                border: `1px solid ${theme.colors.gray[2]}`,
                borderRadius: theme.radius.md,
              })}
              gap={"md"}
              align={"center"}
              onClick={() => history.push(`/app/user/${user.id}`)}
            >
                  <IonAvatar  className="conAv" style={{width:47, height:40}}>
                    <img src={user?.avatarPath!==null? user?.avatarPath: '/avatar.png'} 
                    onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src="/avatar.png";

                    }}/>
                    </IonAvatar>
                    
              

              <Flex direction={"column"} w="100%">
                <Title order={6} fw={600}>
                  {user?.username}

                  {user?.popular===true && <>
                  <span>  <img src="/tick.svg" style={{width:15, height:15}}/></span>
                        
                      </>
                      }
                </Title>

                <Text size="xs" color="dimmed" weight={400}>
                  Dibs Price: ₹{getFormattedSmallPrice(user.price ?? 0)}
                </Text>
              </Flex>
            </Flex>
          ))}
        </Stack>
      </Box>
    </AppShell>
  );
}
