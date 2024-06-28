import { Avatar, Button, Flex, Group, Stack, Title } from "@mantine/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import AppShell from "../../../components/AppShell";
import { useAppSelector } from "../../../store/hooks";
import {
  follow,
  setUser,
  unfollow,
  updateUser,
} from "../../../store/slice/userSlice";
import { imgUrl } from "../../../utils/media";
import { getSuggestedUsers } from "../../Search/search.api";
import { followUser, unFollowUser } from "../../User/api.user";
import { HeaderComponent } from "../../../components/Header";
import { getUserDetails } from "../../main.api";
import { IonFooter, useIonRouter } from "@ionic/react";
import usePinnedUserQuery from "../../../hooks/usePinnedUserQuery";
import { personAdd } from "ionicons/icons";
import { updateNotifData } from "../auth.api";

type Props = {};

function SetupFollowing({}: Props) {
  const user = useAppSelector((state) => state.user);
  const history = useHistory();
  const router = useIonRouter();
  const dispatch = useDispatch();
  const pinnedUserQuery = usePinnedUserQuery();

  const suggestionsQuery = useQuery({
    queryKey: ["suggestions"],
    queryFn: getSuggestedUsers,
  });

  const getUserQuery = useMutation({
    mutationKey: ["user"],
    mutationFn: getUserDetails,

  async  onSuccess(user) {
      dispatch(updateUser(user));
      
  
         history.replace("/");
    },
  });

  function goToMain() {
    getUserQuery.mutate();
  }


  

  return (
    <AppShell
      header={
        <HeaderComponent
          title="Complete Profile"
          withBackButton={false}
          rightSection={
            <Button
          
              size="xs"
              variant="white"
              onClick={goToMain}
              loading={getUserQuery.isLoading}
              disabled={user?.followingIDs?.length < 3}
            >
              Skip
            </Button>
          }
        />
      }
    >
      <div
        style={{
          position: "relative",
          height: "100%",
          paddingBottom: 50,
          overflow: "scroll",
          marginBottom:80,

        }}
      >
        <h5 style={{padding:10}}>
          Follow some users to get started
        </h5>

        <Stack mt="xl" px="md">
          {pinnedUserQuery.data?.map((user: any) => (
            <SuggestionCard user={user} key={user.id} />
          ))}
          {suggestionsQuery.data?.map((user: any) => (
            <SuggestionCard user={user} key={user.id} />
          ))}
        </Stack>

      

      
      </div>

      <IonFooter style={{padding:15, background:'#fff', position:'fixed', bottom:0, width:'100%', left:0}}>
        <Button
          disabled={!user.followingIDs?.length}
          fullWidth
          radius={50}
    
          onClick={goToMain}
          loading={getUserQuery.isLoading}
        >
          Continue to App
        </Button>
        </IonFooter>
    </AppShell>

    
  );
}

function SuggestionCard({ user: suggestionUser }: { user: any }) {
  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();

  const userId = suggestionUser?.id;

  const isFollowing = user?.followingIDs?.includes(userId);

  const followMut = useMutation({
    mutationFn: followUser,
    onSuccess({ data }) {
      dispatch(follow(userId));
    },
  });

  const unfollowMut = useMutation({
    mutationFn: unFollowUser,
    onSuccess({ data }) {
      dispatch(unfollow(userId));
    },
  });

  const userFollowUnfollow = () => {
    if (isFollowing) unfollowMut.mutate(userId);
    else followMut.mutate(userId);
  };

  return (
    <Group
      align={"center"}
      sx={(theme) => ({
        background: theme.colors.gray[1],
        borderRadius: theme.radius.md,
        padding: 8,
      })}
      position="apart"
      noWrap
    >
      <Flex align="center" h="100%" w="calc(100% - 115px)">
        <Avatar
          style={{ marginRight: 10, borderRadius: "50%" }}
          src={imgUrl(suggestionUser.avatarPath)}
        />

        <Title order={5} truncate="end">
          {suggestionUser.username}
          {suggestionUser?.popular===true && <>
                  <span>  <img src="public/tick.svg" style={{width:15, height:15}}/></span>
                  
                </>
                }
        </Title>
      </Flex>

      <Button
      radius={50}
      style={{background:'#28016b'}}
        size="xs"
        onClick={userFollowUnfollow}
        loading={followMut.isLoading || unfollowMut.isLoading}
      >
        {isFollowing ? "Unfollow" : "Follow"}
      </Button>
    </Group>
  );
}

export default SetupFollowing;
