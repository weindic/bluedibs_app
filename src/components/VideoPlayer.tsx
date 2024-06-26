import { IonIcon } from "@ionic/react";
import { ActionIcon, Flex } from "@mantine/core";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { refresh } from "ionicons/icons";
import { motion } from "framer-motion";
import { mergeRefs } from "@mantine/hooks";
import { IconVolume, IconVolumeOff } from "@tabler/icons-react";
import { useDispatch } from "react-redux";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleMutePosts } from "../store/slice/feedsPrefrenceSlice";
import { postContext } from "./Feeds";

interface Props {
  src: string;
  height: "100%" | "auto" | number;
  width?: string | number;
}

const VideoPlayer = forwardRef<HTMLDivElement, Props>(
  ({ src, height = "100%" }, passedRef) => {
    const { setQueue } = useContext(postContext);

    const [isFinished, setIsFinished] = useState(false);
    const videoElementRef = useRef<HTMLVideoElement | null>(null);
    const dispatch = useAppDispatch();

    const isMuted = useAppSelector((state) => state.feedsPreference.muted);

    function restartVideo() {
      console.log("restarting");

      setIsFinished(false);

      if (videoElementRef.current) {
        videoElementRef.current.currentTime = 0;
        videoElementRef.current.play();
      }
    }

    const handleVideoClick = () => {
      if (videoElementRef.current) {
        if (videoElementRef.current.paused) {
          videoElementRef.current.play();
        } else {
          videoElementRef.current.pause();
        }
      }
    };

    return (
      <Flex
        justify={"center"}
        align="center"
        ref={passedRef}
        style={{ position: "relative", height }}
      >
        {isFinished && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              zIndex: 9999,
              width: "100%",
              height: "100%",
            }}
          >
            <Flex align={"center"} justify={"center"} w="100%" h="100%">
              <ActionIcon
                size={125}
                variant="transparent"
                onClick={restartVideo}
              >
                <IonIcon
                  icon={refresh}
                  style={{ height: "75px", width: "75px" }}
                />
              </ActionIcon>
            </Flex>
          </motion.div>
        )}

        <motion.video
          style={{
            width: "100%",
            height,
            objectFit: "cover",
          }}
          ref={videoElementRef}
          onChange={(e) => console.log(e.currentTarget.currentTime)}
          src={src}
          onTimeUpdate={(e) => {
            if (
              Math.round(e.currentTarget.currentTime) ===
              Math.round(e.currentTarget.duration)
            ) {
              setQueue((prev) => {
                return prev.filter((ref) => ref !== videoElementRef);
              });
            }
          }}
          onClick={handleVideoClick}
          onViewportEnter={() =>
            setQueue((prev) => {
              const draft = [...prev];
              draft.push(videoElementRef);
              return draft;
            })
          }
          onViewportLeave={() => {
            if (videoElementRef.current) {
              videoElementRef.current.pause();
            }

            setQueue((prev) => {
              return prev.filter((ref) => ref !== videoElementRef);
            });
          }}
          muted={isMuted}
        />

        <ActionIcon
          sx={{
            zIndex: 9999,
            position: "absolute",
            bottom: 5,
            right: 5,
            backgroundColor: "rgb(0 0 0 / 40%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
            borderRadius: 999,
            color: "white",
          }}
          unstyled
          radius={999}
          onClick={() => {
            dispatch(toggleMutePosts());
          }}
        >
          {isMuted ? <IconVolumeOff size={16} /> : <IconVolume size={16} />}
        </ActionIcon>
      </Flex>
    );
  }
);

export default VideoPlayer;
