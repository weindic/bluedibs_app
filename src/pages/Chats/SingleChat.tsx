import { IonAlert, IonAvatar, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonInput, IonItem, IonLabel, IonList, IonModal, IonProgressBar, IonRadio, IonRadioGroup, IonRow, IonicSafeString } from "@ionic/react";
import {
  ActionIcon,
  Avatar,
  Flex,
  Group,
  Image,
  TextInput,
  Title,
  UnstyledButton,
} from "@mantine/core";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import { useQuery } from "@tanstack/react-query";
import CryptoJS from "crypto-js";
import { onValue, push, ref, update } from "firebase/database";
import { imageOutline, send, timer } from "ionicons/icons";
import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import { useAppSelector } from "../../store/hooks";
import { database } from "../../utils/firebase";
import { imgUrl } from "../../utils/media";
import { fetchUserDetails } from "../User/api.user";
import { uploadFileToFirebase } from "./chat.service";
import { config } from "../../config";
import { showNotification } from "@mantine/notifications";
import ReactDOMServer from 'react-dom/server';


const Incoming = ({
  message,
  type,
}: {
  message: string;
  type: "image" | "message";
}) => {
  if (type == "image") {
    return (
      <Image
        src={message}
        height={200}
        width={250}
        style={{
          marginRight: "auto",
        }}
        styles={{
          image: {
            borderRadius: "12px 12px 12px 0",
          },
        }}
      />
    );
  } else {
    return (
      <UnstyledButton
        style={{
          backgroundColor: "white",
          padding: "8px 15px",
          borderRadius: "12px 12px 12px 0",
          marginRight: "auto",
          wordBreak: "break-word",
        }}
        ff="Nunito Sans"
      >
        {message}
      </UnstyledButton>
    );
  }
};

const OutGoing = ({
  message,
  type,
}: {
  message: string;
  type: "image" | "message";
}) => {
  if (type == "image") {
    return (
      <Image
        src={message}
        height={200}
        width={250}
        style={{
          marginLeft: "auto",
        }}
        styles={{
          image: {
            borderRadius: "12px 12px 0 12px",
          },
        }}
      />
    );
  } else
    return (
      <UnstyledButton
        sx={(theme) => ({
          color: "white",
          backgroundColor: "#704ffe",
          padding: "8px 15px",
          borderRadius: "12px 12px 0 12px",
          marginLeft: "auto",
          wordBreak: "break-word",
        })}
        ff="Nunito Sans"
      >
        {message}
      </UnstyledButton>
    );
};
export function SingleChat() {
  const message = useRef<HTMLInputElement>(null);
  const user = useAppSelector((state) => state.user);
  const { userId } = useParams<{ userId: string }>();
  const [messages, setMessages] = useState([]);
  const rawRoomId =
    user.id < userId ? `${user.id}.${userId}` : `${userId}.${user.id}`;
  const roomId = CryptoJS.SHA256(rawRoomId).toString();
  const [imgConfirmation, setImgConfirmation] = useState(false);
  const imgRef = useRef<File>();

  const [curUserData, setCurUser] = useState({})

  const storeRefURI = "room/" + roomId;
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const targetDormRefURI = "dorm/" + userId + "/" + user.id;
  const currentDormRefURI = "dorm/" + user.id + "/" + userId;
  const history = useHistory();
  const location = useLocation();
  const { chtData, isVip }:any = location.state || {};

  const targetUserQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserDetails(userId),
    refetchOnWindowFocus: false,
  });

  const sendMessage = () => {
    if (!message.current) return;
    push(ref(database, storeRefURI), {
      from: user.id,
      message: message.current?.value,
    });
    update(ref(database, storeRefURI), {
      lastTransport: Date.now(),
    });
    update(ref(database, targetDormRefURI), { unread: 1 });
    message.current.value = "";
  };

  const scroll = () =>
    chatBoxRef.current &&
    chatBoxRef.current.scrollTo(0, chatBoxRef.current.scrollHeight);



 

    const fetchUserProfile = async (id: string) => {
      const details = await fetchUserDetails(id);

 
      setCurUser(details)
  
    };



    useEffect(()=>{

   

      let usr:any = localStorage.getItem('bluedibs:user');
      let usrDt = JSON.parse(usr)

      

      fetchUserProfile(usrDt?.id)
      if(isVip){
        
        openModal()
       
      }
    },[])



    const customContent: string = ReactDOMServer.renderToString(
      <div>
        <h2>Custom Alert Content</h2>
        <p>This is a custom alert with HTML content.</p>
      </div>
    );
    

  useEffect(() => {
    scroll();

 

  }, [messages]);

  useEffect(() => {
    const chatsRef = ref(database, storeRefURI);
    const unsubscribe = onValue(chatsRef, (snapshot) => {
      const data = snapshot.val();
      setMessages(Object.values(data || {}));
      update(ref(database, currentDormRefURI), { unread: 0 });
    });

    return unsubscribe;
  }, [storeRefURI]);

  const sendImage = async () => {
    if (!imgRef.current) return console.error("no image selected");
    const imageUrl = await uploadFileToFirebase(imgRef.current);
    push(ref(database, storeRefURI), {
      from: user.id,
      message: imageUrl,
      type: "image",
    });
    update(ref(database, storeRefURI), {
      lastTransport: Date.now(),
    });
    update(ref(database, targetDormRefURI), { unread: 1 });
  };



 

  return (
    <>



    <AppShell
      header={
        <Flex
          align={"center"}
          style={{
            width: "100%",
            borderColor: "gray",
          }}
          gap={"xl"}
        >
          <ActionIcon onClick={() => history.goBack()} variant="light">
            <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
          </ActionIcon>

          <Group spacing={"xs"}>
            
            <Avatar
              radius={999}
              size={30}
              src={imgUrl(targetUserQuery.data?.avatarPath)}
            />
           

           

            <Title order={3} fz={17} weight={500}>
              {targetUserQuery.data?.username}
              
            </Title>
           
          </Group>
        </Flex>
      }
    >
      <IonAlert
        isOpen={imgConfirmation}
        header="Confirm"
        message="Confirm this image to send?"
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            handler: () => setImgConfirmation(false),
          },
          {
            text: "Send",
            role: "send",
            handler: sendImage,
          },
        ]}
        onDidDismiss={() => setImgConfirmation(false)}
      />

      <Flex
        sx={(theme) => ({ backgroundColor: "#eee" })}
        direction={"column"}
        h="100%"
      >
        <Flex
          ref={chatBoxRef}
          p={"sm"}
          direction={"column"}
          gap={"sm"}
          style={{ overflow: "auto", overflowX: "clip", height: "100%" }}
          pb={50}
        >
          {messages.map(({ from, message, type }, index) => {
            if (!from || !message) return;

            return from == user.id ? (
              <OutGoing
                key={index}
                message={message}
                type={type || "message"}
              />
            ) : (
              <Incoming
                key={index}
                message={message}
                type={type || "message"}
              />
            );
          })}
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
            variant="filled"
            radius={"md"}
            ref={message}
            size="md"
            styles={{
              input: {
                border: "none",
              },
              icon: {
                pointerEvents: "all",
              },
            }}
            style={{
              width: "100%",
            }}
            placeholder="Message..."
            icon={
              <ActionIcon
                size={"xl"}
                style={{
                  padding: 0,
                  margin: 0,
                }}
                onClick={(e) => {
                  console.log("red");

                  e.preventDefault();
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = config.SUPPORTED_IMAGE_FORMATS;
                  input.onchange = (_) => {
                    setImgConfirmation(true);
                    const [file] = Array.from(input.files ?? []);

                    if (!file || !file.type.startsWith("image")) {
                      return showNotification({
                        color: "red",
                        title: "Only Images are supported",
                        message: "Only images are supported in chat.",
                      });
                    }

                    imgRef.current = file;
                  };
                  input.click();
                }}
              >
                <IonIcon icon={imageOutline} />
              </ActionIcon>
            }
            rightSection={
              <ActionIcon onClick={() => sendMessage()}>
                <IonIcon icon={send} />
              </ActionIcon>
            }
          />
        </Flex>
      </Flex>

   
    </AppShell>
      </>
  );
}
