import { IonIcon } from "@ionic/react";
import {
  ActionIcon,
  Anchor,
  Avatar,
  Flex,
  Group,
  Menu,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import { useMutation, useQuery } from "@tanstack/react-query";
import { send } from "ionicons/icons";
import { useRef } from "react";
import { useHistory, useLocation, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import { useAppSelector } from "../../store/hooks";
import { imgUrl } from "../../utils/media";
import { queryClient } from "../../utils/queryClient";
import { addComment, deleteComment, getAllComments } from "./comments.api";
import { axiosInstance } from "../../utils/axios";
import { IconDots } from "@tabler/icons-react";
import { sendNotificationApi } from "../Notification/notification.api";

export function CommentsPage() {
  const user = useAppSelector((state) => state.user);
  const { postId } = useParams<{ postId: string }>();
  const commentInputBoxRef = useRef<HTMLInputElement>(null);
  const history = useHistory();
  const { state } = useLocation();
  const dataPost = state?.data;
  const getCommentsQueries = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => getAllComments(postId),
    placeholderData: [],
  });

  const addCommentMut = useMutation({
    mutationFn: async () => {
      if (!commentInputBoxRef.current) return;
      const resp = await addComment(postId, commentInputBoxRef.current?.value);
      commentInputBoxRef.current.value = "";
      return resp;
    },
    onSuccess({ data }: any) {
      queryClient.setQueryData(
        ["comments", postId],
        [...getCommentsQueries.data, data]
      );

      console.log('commm', dataPost)

      sendNotificationApi(user.id, dataPost.userId, postId, 'Has commented on Your post', 'comment')
    },
  });

  const deleteCommentMut = useMutation({
    mutationFn: async (id: string) => deleteComment(id),

    onSuccess({ data }: any) {
      queryClient.setQueryData(["comments", postId], (prev: any) => {
        return prev.filter((comm: Record<string, any>) => comm.id !== data.id);
      });
    },
  });

  console.log(getCommentsQueries.data);

  return (
    <AppShell
      header={
        <Group>
          <ActionIcon onClick={() => history.goBack()} variant="light">
            <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
          </ActionIcon>

          <Title order={3} fz={20} weight={600} mr={"auto"}>
            Comments
          </Title>
        </Group>
      }
    >
      <Flex direction={"column"} h="100%">
        <Flex
          p={"sm"}
          direction={"column"}
          gap={"sm"}
          style={{ overflow: "auto", overflowX: "clip", height: "100%" }}
        >
          {(getCommentsQueries.data ?? []).map(
            (comment: { User: any; content: string; id: string }) => (
              <Group
                position="apart"
                pr={"sm"}
                pb={10}
                sx={(theme) => ({
                  ":not(:nth-last-of-type(1))": {
                    borderBottom: `1px solid ${theme.colors.gray[2]}`,
                  },
                })}
              >
                <Flex gap={"md"}>
                  <Avatar
                    src={imgUrl(comment.User?.avatarPath)}
                    style={{ borderRadius: "50%" }}
                  />
                  <Flex direction={"column"}>
                    <Title order={6} weight={600} style={{ lineHeight: 1 }}>
                      {comment.User?.username}
                    </Title>

                    <Text
                      style={{
                        wordBreak: "break-all",
                        color: "rgba(0, 0, 0, 0.7)",
                      }}
                      size={"sm"}
                      mt={4}
                      fw={400}
                      ff={"'Nunito Sans', sans-serif"}
                    >
                      {(() => {
                        return (
                          <>
                            {comment.content.split(" ").map((item) => {
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
                                          history.push(
                                            "/app/user/" + res.data.id
                                          );
                                        })
                                        .catch(() => null);
                                    }}
                                  >
                                    {item}{" "}
                                  </Anchor>
                                );
                              else return item + " ";
                            })}
                          </>
                        );
                      })()}{" "}
                    </Text>
                    {comment.User.id != user.id && (
                      <Anchor
                        onClick={() => {
                          if (commentInputBoxRef.current) {
                            commentInputBoxRef.current.value = `@${comment.User.username}  `;
                          }
                        }}
                        size={"xs"}
                        style={{ textDecoration: "none" }}
                      >
                        Reply
                      </Anchor>
                    )}
                  </Flex>
                </Flex>

                {comment.User.username === user.username && (
                  <Menu shadow="md" width={120} withinPortal withArrow>
                    <Menu.Target>
                      <ActionIcon>
                        <IconDots style={{ fontSize: 19 }} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item
                        sx={(theme) => ({
                          color: theme.colors["red"][7],
                          textAlign: "center",
                        })}
                        onClick={() => deleteCommentMut.mutate(comment.id)}
                      >
                        Delete Comment
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                )}
              </Group>
            )
          )}
        </Flex>

        <Flex
          style={{
            bottom: 0,
            width: "100%",
            border: "solid",
            borderWidth: 1,
            borderColor: "#CED4DA",
            backgroundColor: "white",
          }}
          p={6}
        >
          <TextInput
            variant="filled"
            radius={"md"}
            ref={commentInputBoxRef}
            size="md"
            styles={{
              input: {
                border: "none",
              },
            }}
            style={{
              width: "100%",
            }}
            placeholder="Message..."
            rightSection={
              <ActionIcon
                onClick={() => {
                  if (commentInputBoxRef.current?.value?.trim()?.length) {
                    addCommentMut.mutate();
                  
                  } else {
                    commentInputBoxRef.current?.focus();
                  }
                }}
              >
                <IonIcon icon={send} />
              </ActionIcon>
            }
          />
        </Flex>
      </Flex>
    </AppShell>
  );
}
