import InfiniteScrollComponent from "../../../components/InfiniteScrollComponent";
import { axiosInstance } from "../../../utils/axios";
import { UserCard } from "./Followers";

type Props = { username: string };

export default function Followings({ username }: Props) {
  const queryFn = (page: number) =>
    axiosInstance
      .get(`/user/following/${username}?page=${page}`)
      .then((res) => res.data);

  return (
    <InfiniteScrollComponent
      queryKey={["followings", username]}
      queryFn={queryFn}
      cols={1}
      virtual={false}
      gap={10}
      withPullToRefresh={false}
    >
      {(user, { index }, { data }) => (
        <UserCard user={user} username={username} type="followings" />
      )}
    </InfiniteScrollComponent>
  );
}
