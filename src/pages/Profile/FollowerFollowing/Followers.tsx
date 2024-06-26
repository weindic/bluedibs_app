import { Avatar, Button, Flex, Text, Title } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import InfiniteScrollComponent from "../../../components/InfiniteScrollComponent";
import { useAppSelector } from "../../../store/hooks";
import { unfollow } from "../../../store/slice/userSlice";
import { getFormattedSmallPrice } from "../../../utils";
import { axiosInstance } from "../../../utils/axios";
import { imgUrl } from "../../../utils/media";
import { queryClient } from "../../../utils/queryClient";
import { unFollowUser } from "../../User/api.user";

type Props = { username: string };

function Followers({ username }: Props) {
  const queryFn = (page: number) =>
    axiosInstance
      .get(`/user/followers/${username}?page=${page}`)
      .then((res) => res.data);

  return (
    <InfiniteScrollComponent
      queryKey={["followers", username]}
      queryFn={queryFn}
      cols={1}
      virtual={false}
      gap={10}
      withPullToRefresh={false}
    >
      {(user, { index }, { data }) => (
        <UserCard user={user} username={username} />
      )}
    </InfiniteScrollComponent>
  );
}

export function UserCard({
  user,
  type,
  username,
}: {
  user: Record<string, any>;
  type?: "followings";
  username: string;
}) {
  const history = useHistory();
  const currentUser = useAppSelector((state) => state.user);

  const dispatch = useDispatch();

  const unfollowMut = useMutation({
    mutationFn: unFollowUser,

    onSuccess() {
      dispatch(unfollow(user.id));
      queryClient.invalidateQueries(["feeds"]);
      queryClient.invalidateQueries(["suggestions"]);
      queryClient.invalidateQueries(["user", user.id]);

      queryClient.setQueryData(["followings", username], (prev: any) => {
        let clone: any = structuredClone(prev);
        let page = clone.pages[user.pageNumber];

        page.data = page.data.filter((us: any) => us.id !== user.id);

        return clone;
      });
    },
  });

  return (
    <Flex
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
      <Avatar src={imgUrl(user.avatarPath)} radius={10} size={40} />

      <Flex direction={"column"} w="100%">
        <Title order={6} fw={600}>
          {user?.username}
        </Title>

        <Text size="xs" color="dimmed" weight={400}>
          Share Price: ₹{getFormattedSmallPrice(user.price ?? 0)}
        </Text>
      </Flex>

      {type === "followings" &&
        (username === currentUser.username ? (
          <Button
            size="xs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              unfollowMut.mutate(user.id);
            }}
          >
            Unfollow
          </Button>
        ) : null)}
    </Flex>
  );
}

export default Followers;
