import { IonIcon } from "@ionic/react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Flex,
  Group,
  Image,
  LoadingOverlay,
  Menu,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useElementSize } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, useAnimation } from "framer-motion";
import { heart } from "ionicons/icons";
import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useHistory, useParams } from "react-router-dom";

import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import QuestionAnswerRoundedIcon from "@mui/icons-material/QuestionAnswerRounded";
import ReplyRoundedIcon from "@mui/icons-material/ReplyRounded";

import { Share } from "@capacitor/share";
import { IconDots } from "@tabler/icons-react";
import { getFeed, likePost, unLikePost } from "../pages/Feed/feed.api";
import { getFeedsByUsername } from "../pages/ProfileFeeds/ProfileFeeds.api";
import { followUser, unFollowUser } from "../pages/User/api.user";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  follow,
  likePostUser,
  unLikePostUser,
  unfollow,
  updateUser,
} from "../store/slice/userSlice";
import { getFormattedSmallPrice, humanizeNum } from "../utils";
import { axiosInstance } from "../utils/axios";
import { imgUrl } from "../utils/media";
import { NotifyUser } from "../utils/notification";
import InfiniteScrollComponent from "./InfiniteScrollComponent";
import { deletePost } from "./Post/deletePost.api";
import VideoPlayer from "./VideoPlayer";
import { useGlobalState } from "../realtime/GlobalStateContext";
import { sendNotificationApi } from "../pages/Notification/notification.api";
import { updateNotifData } from "../pages/Auth/auth.api";

type IPostContext = {
  queue: React.MutableRefObject<HTMLVideoElement | null>[];
  setQueue: React.Dispatch<React.SetStateAction<IPostContext["queue"]>>;
};

export const postContext = createContext<IPostContext>({
  queue: [],
  setQueue: () => {},
});

function Feeds({
  username,
  index,
  initialData,
}: {
  username?: string;
  index?: number | null;
  initialData?: any;
}) {






  const [queue, setQueue] = useState<
    React.MutableRefObject<HTMLVideoElement | null>[]
  >([]);

  function playVideo() {
    if (!queue?.length) return;

    const refQueue = [...queue];

    let video = refQueue[0];

    if (!video) {
      return setQueue(refQueue.filter((ref) => !!ref.current));
    }

    try {
      let isPlaying = !!(
        video.current!.currentTime > 0 &&
        !video.current!.paused &&
        !video.current!.ended &&
        video.current!.readyState > 2
      );

      if (isPlaying) return;

      video.current?.play();
    } catch (error) {
      return setQueue((prev) => {
        refQueue.shift();
        return refQueue.filter((ref) => !!ref.current);
      });
    }
  }

  useEffect(() => {
    playVideo();
  }, [queue]);





  return (
    <postContext.Provider value={{ queue, setQueue }}>
      <InfiniteScrollComponent
        queryKey={["feeds", username].filter(Boolean)}
        queryFn={
          username ? (page) => getFeedsByUsername(username, page) : getFeed
        }
        startIndex={index}
        initialData={initialData}
      >
        {(data, virtualItem, { page }) => (
          <SinglePost
            data={{ ...data, pageNum: page }}
            virtualItem={virtualItem}
          />
        )}
      </InfiniteScrollComponent>
    </postContext.Provider>
  );
}

const aspectRatio = [1, 1];

function SinglePost({ data, virtualItem }: { data: any; virtualItem: any }) {
  const history = useHistory();


  const user = useAppSelector((state) => state.user);
  const [lastClick, setlastClick] = useState<{ time: Date; id: string } | null>(
    null
  );


  const { postId } = useParams<{ postId: string }>();


  const theme = useMantineTheme();
  const { userId } = data;

  const { ref, width } = useElementSize();

  const height = useMemo(
    () => (width / aspectRatio[0]) * aspectRatio[1],
    [width]
  );

  const queryClient = useQueryClient();

  const isLikedByCurrentUser = useMemo(
    () => user.PostLikedIDs?.includes(data.id),
    [user]
  );

  const followedByCurrentUser = useMemo(
    () => user.followingIDs?.includes(data.userId),
    [user]
  );

  const controls = useAnimation();
  const dispatch = useAppDispatch();

  const likePostMut = useMutation({
    mutationFn: likePost,
  });

  const unlikePostMut = useMutation({
    mutationFn: unLikePost,
  });

  const sharePost = async () => {
    console.log("hi");
    await Share.share({
      title: "Join Blue Dibs Now!",
      url: "hhttps://play.google.com/store/apps/details?id=io.bluedibs.com",
      dialogTitle: "BlueDibs",
    });
  };

  function toggleLikePost(postId: string, User: any, singleClick = false) {
    const liked = user.PostLikedIDs.includes(postId);
    const likeCounter = document.getElementById(`post-like-${postId}`);
    if (!likeCounter) return console.error("no counter found");
    let likes = parseInt(likeCounter?.innerText.split(" ")[0] || "0");
    if (liked) {
      dispatch(unLikePostUser(postId));
      likeCounter.textContent = String(humanizeNum(--likes));
      (singleClick || lastClick) && unlikePostMut.mutate(postId);


    } else {
      // NotifyUser(User.id, {
      //   message: `has liked your post`,
      //   relativeHref: `/app/user/${user.id}`,
      // });

      sendNotificationApi(user.id, User.id, postId, 'Has liked Your post', 'like')

      dispatch(likePostUser(postId));
      likeCounter.textContent = String(humanizeNum(++likes));
      (singleClick || lastClick) && likePostMut.mutate(postId);
    }
  }

  const likeTimer = (postId: string, User: any) => {
    if (!lastClick)
      return setlastClick((_) => ({ time: new Date(), id: postId }));
    else if (
      (new Date().getTime() - lastClick?.time?.getTime()) / 1000 < 0.3 &&
      postId == lastClick.id
    ) {
      toggleLikePost(postId, User);

      controls.start({
        scale: [0.8, 1, 0.8],
        opacity: [0, 1],
        transition: { duration: 0.2 },
      });
      setTimeout(() => {
        controls.start({ opacity: [1, 0] });
        setlastClick(null);
      }, 500);
      return;
    }
    return setlastClick((_) => ({ time: new Date(), id: postId }));
  };

  const deletePostMutation = useMutation({
    mutationFn: deletePost,
    mutationKey: ["delete-post", data?.id],
    onSuccess(_, variables, context) {
      queryClient.setQueryData(["feeds", user.username], (prev: any) => {
        let cloneData: any = structuredClone(prev);

        cloneData.pages.forEach((page: any) => {
          page.posts = page.posts.filter((post: any) => post.id !== data.id);
        });

        dispatch(updateUser({ posts: user.posts - 1 }));

        return cloneData;
      });

      queryClient.invalidateQueries(["feeds", user.username]);
    },
  });

  function invalidateQueriesAfterFollowUnfollow() {
    queryClient.invalidateQueries(["feeds"]);
    queryClient.invalidateQueries(["suggestions"]);
    queryClient.invalidateQueries(["user", userId]);
  }

  const followMut = useMutation({
    mutationFn: followUser,
    onSuccess({ data }) {
      NotifyUser(userId, {
        from: user.id,
        message: `${user.username} has followed you!`,
      });
      dispatch(follow(userId));
      invalidateQueriesAfterFollowUnfollow();
    },
  });

  const unfollowMut = useMutation({
    mutationFn: unFollowUser,
    onSuccess({ data }) {
      dispatch(unfollow(userId));
      invalidateQueriesAfterFollowUnfollow();
    },
  });


  useEffect(() => {

    checkPopular(userId);
  }, []);


  const [isPopular, setPopular] = useState(false)

  const checkPopular = async (userId: any) => {
    try {
      const response = await fetch('http://localhost:3000/popular-profile/status/' + userId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
  
      if (data?.userId === userId) {
        setPopular(true);
      }
  
      console.log('datadata', data);
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };
  


  useEffect(()=>{

    let locUser:any = localStorage.getItem('bluedibs:user');
    let lcU = JSON.parse(locUser);

    updateNotifData({oldId:lcU.firebaseId, lcU:user.id})

  },[])

 

  return (
    <Flex
      direction={"column"}
      pb={15}
      pt={10}
      sx={{
        top: 0,
        left: 0,
        width: "100%",

        [":not(:nth-of-type(1))"]: {
          borderTop: "1px solid #eaeaea",
        },
      }}
    >
      <LoadingOverlay visible={deletePostMutation.isLoading} />

      <Group px="xs" position="apart">
        <Flex
          sx={{ padding: "7px 0px" }}
          gap={"md"}
          align={"center"}
          onClick={() => history.push(`/app/user/${data.User.id}`)}
        >
          <Avatar src={imgUrl(data.User?.avatarPath)} radius={10} size={40} />

          <Flex direction={"column"} w="100%">
            <Title order={5} fw={600} fz={16}>
              {data.User?.username}
              {isPopular && <>
                  <span>  <img src="/tick.svg" style={{width:15, height:15}}/></span>
                  
                </>
                }
            </Title>

            <Text ff="Nunito Sans" size="xs" color="dimmed" weight={700}>
              Dibs Price: ₹{getFormattedSmallPrice(data.User?.price ?? 0)}
            </Text>
          </Flex>
        </Flex>

        <Group spacing={5}>
          <Menu shadow="md" width={120} withinPortal withArrow>
            <Menu.Target>
              <ActionIcon>
                <IconDots style={{ fontSize: 19 }} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              {data.User?.id !== user.id && (
                <Menu.Item
                  sx={(theme) => ({
                    color:
                      theme.colors[followedByCurrentUser ? "red" : "green"][7],
                    textAlign: "center",
                  })}
                  onClick={() => {
                    if (followedByCurrentUser)
                      return unfollowMut.mutate(userId);
                    followMut.mutate(userId);
                  }}
                >
                  {followedByCurrentUser ? "Unfollow" : "Follow"}
                </Menu.Item>
              )}

              {data.User?.id === user.id && (
                <Menu.Item
                  sx={(theme) => ({
                    color: theme.colors["red"][7],
                    textAlign: "center",
                  })}
                  onClick={() => deletePostMutation.mutate(data.id)}
                >
                  Delete Post
                </Menu.Item>
              )}
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>

      <div
        onClick={() => likeTimer(data.id, data.User)}
        style={{
          position: "relative",
          transformOrigin: "center",
          height: "calc(100% - 90px)",
          overflow: "hidden",
        }}
      >
        {lastClick?.id == data.id && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={controls}
            style={{
              zIndex: "9999",
              position: "absolute",
              top: "50%",
              left: "50%",
              margin: "-50px -50px",
            }}
          >
            <IonIcon
              icon={heart}
              style={{
                zIndex: "99999",
                fontSize: "100px",
                position: "absolute",
                color: "white",
              }}
            />
          </motion.div>
        )}

        <Box px="sm" pb="sm" pt="xs" h="100%">
          {data?.caption && data?.caption?.length ? (
            <Text
              size="sm"
              mb="xs"
              ff="Nunito Sans"
              px={5}
              sx={(theme) => ({
                color: theme.colors.gray[7],
              })}
            >
              {data.caption
                .split("\n")
                .join(" <br/> ")
                .split(" ")
                .map((item: string) => {
                  if (item.includes("@"))
                    return (
                      <Anchor
                        style={{ textDecoration: "none" }}
                        // href={"/app/user/" + item.replace("@", "")}
                        onClick={() => {
                          let username = item.replace("@", "");

                          if (username === user.username) {
                            return history.push("/app/profile");
                          }

                          axiosInstance
                            .get(`user/username/${username}`)
                            .then((res) => {
                              history.push("/app/user/" + res.data.id);
                            })
                            .catch(() => null);
                        }}
                      >
                        {item}{" "}
                      </Anchor>
                    );

                  if (item === "<br/>") return <br />;

                  return item + " ";
                })}
            </Text>
          ) : null}

          <Box
            sx={(theme) => ({
              borderRadius: theme.radius.md,
              overflow: "hidden",
              width: "100%",
              height,
            })}
            ref={ref}
          >
            {(data.mimetype ?? "image/*").startsWith("video") ? (
              <VideoPlayer src={data.path} height={height} />
            ) : (
              <Image
                style={{ backgroundColor: "black", objectFit: "cover" }}
                fit="cover"
                src={data.path}
                withPlaceholder
                styles={{
                  root: {
                    height: `${height}px !important`,
                  },
                  figure: { height: height },
                  imageWrapper: { height: height },
                  image: {
                    width: `100% !important`,
                    height: `${height}px !important`,
                  },
                }}
              />
            )}
          </Box>
        </Box>
      </div>

      <Flex
        style={{ padding: "4px 15px", background: "white" }}
        gap={"sm"}
        align={"center"}
      >
        <Badge
          color="red"
          size="lg"
          onClick={() => toggleLikePost(data.id, data.User, true)}
          styles={{
            inner: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              fontSize: 16,
            },

            root: {
              background: theme.colors.red[1],
            },
          }}
        >
          {isLikedByCurrentUser ? (
            <FavoriteRoundedIcon sx={{ fontSize: 19 }} />
          ) : (
            <FavoriteBorderRoundedIcon sx={{ fontSize: 19 }} />
          )}

          <span id={`post-like-${data.id}`}>
            {humanizeNum(data.UserLikedIDs?.length || 0)}
          </span>
        </Badge>

        <Badge
          color="indigo"
          size="lg"
          onClick={() => history.push(`/app/comments/${data.id}`, { data })}
          styles={{
            inner: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              fontSize: 16,
            },

            root: {
              background: theme.colors.indigo[1],
            },
          }}
        >
          <QuestionAnswerRoundedIcon sx={{ fontSize: 19 }} />
        </Badge>

        <Badge
          color="indigo"
          size="lg"
          styles={{
            inner: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              fontSize: 16,
            },

            root: {
              background: theme.colors.indigo[1],
            },
          }}
          onClick={() => sharePost()}
        >
          <ReplyRoundedIcon
            sx={{ fontSize: 19, transform: "rotateY(180deg)" }}
          />
        </Badge>

        {/* <Badge
          color="indigo"
          size="lg"
          styles={{
            inner: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              fontSize: 16,
            },

            root: {
              background: theme.colors.indigo[1],
            },
          }}
        >
          <CurrencyExchangeRoundedIcon sx={{ fontSize: 19 }} />
        </Badge> */}
      </Flex>
    </Flex>
  );
}

export default SinglePost;
