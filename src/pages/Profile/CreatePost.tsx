import {
  ActionIcon,
  Avatar,
  Button,
  Group,
  LoadingOverlay,
  Progress,
  Stack,
  Textarea,
  Title,
} from "@mantine/core";
import { useSetState } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { Cropper, CropperRef } from "react-mobile-cropper";
import "react-mobile-cropper/dist/style.css";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import AppShell from "../../components/AppShell";
import { config } from "../../config";
import { useAppSelector } from "../../store/hooks";
import { updateUser } from "../../store/slice/userSlice";
import { imgUrl, loadVideo } from "../../utils/media";
import { addPost } from "../main.api";
import { uploadFileToFirebase } from "../Chats/chat.service";

type Props = {};

function randomIntFromInterval(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function CreatePost({}: Props) {
  const history = useHistory();

  const ref = useRef<CropperRef | null>();

  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false)

  const [uploadProgress, setUploadProgress] = useState(0);

  const progressRef = useRef<NodeJS.Timeout>();

  const [state, setState] = useSetState<{
    file: null | File | string;
    caption: string;
  }>({
    file: null,
    caption: "",
  });

  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();

  const postUploadMutation = useMutation({
    mutationFn: async ({ file, caption }: { file: File; caption?: string }) => {
      const url = await uploadFileToFirebase(file);
      return addPost(
        user.id,
        { url, caption, mimetype: file.type },
        (progress) => {
          setUploadProgress(progress);

          if (progress >= 50) {
            progressRef.current ??= setInterval(() => {
              setUploadProgress((prev) => {
                prev = randomIntFromInterval(prev, prev + (100 - prev) / 3);
                return prev;
              });
            }, 500);
          }
        }
      );
    },

    onSuccess({ data }) {
      clearInterval(progressRef.current);
      progressRef.current = undefined;

      setUploadProgress(100);
      progressRef.current = undefined;

      dispatch(updateUser({ posts: user.posts + 1 }));

      setState({ file: null, caption: "" });

      queryClient.setQueryData(["feeds", user.username], (prev) => {
        if (!prev) return;

        let clone: any = structuredClone(prev);

        if (clone?.pages?.length) {
          clone.pages[0].posts.unshift(data);
        } else {
          clone.pages = [{ page: 0, perPage: 10, posts: [data], total: 1 }];
        }

        return clone;
      });

      setTimeout(() => {
        setLoading(false)
        history.push("/app/profile");
      }, 500);
    },

    onError(error) {
      if (error?.response?.status === 413) {
        showNotification({
          color: "red",
          title: "File size is too large",
          message: "Maximum file size limit is 50MB",
        });
      }

      clearInterval(progressRef.current);
      progressRef.current = undefined;
    },
  });

  async function onSubmit() {
    setLoading(true)
    setUploadProgress(0);

    if (state.file instanceof File && state.file?.type.startsWith("video")) {
      return postUploadMutation.mutate(state as any);
    }

    ref.current?.getCanvas()?.toBlob((blob) => {
      if (!blob) return;

      const file = new File([blob], crypto.randomUUID() + ".jpg", {
        type: "image/jpeg",
      });


      return postUploadMutation.mutate({
        file,
        caption: state.caption,
      })

      
    }, "image/jpeg");
  }

  const fileURL = useMemo(() => {
    if (state.file && state.file instanceof File) {
      return URL.createObjectURL(state.file);
    } else {
      return "";
    }
  }, [state.file]);

  return (
    <>
        <LoadingOverlay visible={loading}/>
        <AppShell
      header={<>
      
  

      <Group position="apart">
          <Group align={"center"} spacing={5}>
            <ActionIcon onClick={() => history.goBack()} variant="light">
              <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
            </ActionIcon>

            <Title order={3} fz={20} weight={600}>
              Create Post
            </Title>
          </Group>

          <Button
            loading={postUploadMutation.isLoading}
            size="xs"
            ff={"Nunito Sans"}
            disabled={!state.file}
            onClick={onSubmit}
          >
            POST
          </Button>
        </Group>
      </>
       
       
      }
    >
      <Stack p="xl">
        <Group>
          <Avatar src={imgUrl(user.avatarPath)} size={50} radius={999} />

          <Title order={5}> {user.username} </Title>
        </Group>
        <Textarea
          value={state.caption}
          onChange={(e) => {
            let value = e.currentTarget.value;

            if (value.length > 200) value = value.slice(0, 200);

            setState({ caption: value });
          }}
          disabled={postUploadMutation.isLoading}
          placeholder="What's on your mind"
          minRows={4}
          description={`Characters used ${state.caption.length} / 200`}
          error={state.caption.length > 200 && "Maximum word limit is 200"}
        />
        {state.file && (
          <div style={{ position: "relative" }}>
            {state.file instanceof File ? (
              <video
                src={fileURL}
                style={{
                  height: 250,
                  width: "100%",
                  borderRadius: "0.5rem",
                  objectFit: "cover",
                }}
                muted
                autoPlay
                loop
              />
            ) : (
              <Cropper
                src={state.file}
                className={"cropper"}
                minHeight={500}
                ref={ref}
                minWidth={500}
              />
            )}

            <LoadingOverlay visible={postUploadMutation.isLoading} />
          </div>
        )}

        {postUploadMutation.isLoading && (
          <Progress value={uploadProgress} animate />
        )}

        <Button
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.accept = [
              config.SUPPORTED_IMAGE_FORMATS,
              config.SUPPORTED_VIDEO_FORMATS,
            ].join(", ");

            input.onchange = async (_) => {
              const [file] = Array.from(input.files as FileList);

              if (!file) return;

              if (
                !file.type.startsWith("image") &&
                !file.type.startsWith("video")
              ) {
                return showNotification({
                  color: "red",
                  title: "Only images & videos are supported",
                  message:
                    "File types other than image or video is not supported",
                });
              }

              if (file.type.startsWith("video")) {
                const video = await loadVideo(file);

                if (Math.floor(video.duration / 60) > 3) {
                  return showNotification({
                    color: "red",
                    message: "Video can not be more than 3 minutes long",
                  });
                }
              }

              const payload = file.type.startsWith("video")
                ? file
                : URL.createObjectURL(file);

              setState({ file: payload });
            };

            input.click();
          }}
          disabled={postUploadMutation.isLoading}
        >
          {Boolean(state.file) ? "Change" : "Add"} Photo / Video
        </Button>
      </Stack>
    </AppShell>
    </>
 
  );
}

export default CreatePost;
