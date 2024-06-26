import { ActionIcon, Flex, Group, Indicator, Title } from "@mantine/core";
import { useHistory } from "react-router";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { IconBell, IconMessageDots } from "@tabler/icons-react";
import AppShell from "../../components/AppShell";
import Feeds from "../../components/Feeds";
import { setNotificationUnread } from "../../store/slice/notificationUnreadSlice";
import { HeaderComponent } from "../../components/Header";
import { IonBadge, useIonRouter } from "@ionic/react";
import { borderRadius } from "@mui/system";
import { useGlobalState } from "../../realtime/GlobalStateContext";
import { useEffect, useMemo, useState } from "react";
import { useChatState } from "../../realtime/ChatContext";

export function Feed() {

  const { notifications } = useGlobalState();

  const [notifCont, setNotifCont] = useState(0)


  
  const notiCount = useMemo(() => {

   

    const newArr = notifications?.filter((item:any)=>{

      return item.seenStatus == 0;

    })

  
    setNotifCont(newArr?.length)

  return newArr;

  }, [notifications]);


  const history = useHistory();
  
  const dorm = useAppSelector((state) => state.dorm);
  const [chatRoomCount,setRoomCount] = useState(0)


  const messageUnread = (Object.values(dorm || {}) || []).every(
    (room) => room?.unread == 0
  );
  const distpatch = useAppDispatch();




  const { messages, chatRooms, chatRoomID, setRoomId, updateTimer } = useChatState(); // Adjust state variable name

  useEffect(() => {
    console.log('Messages:', messages);
    console.log('Chat Rooms:', chatRooms);
    console.log('Active Chat Room ID:', chatRoomID);


    const dt = chatRooms?.filter(item=>{
      return item.unread === 1;
    })

    setRoomCount(dt?.length)


  }, [messages, chatRooms, chatRoomID]);


  return (
    <AppShell
      header={
        <HeaderComponent
          withLogo
          withBackButton={false}
          rightSection={
            <Group>
              <ActionIcon
                variant="light"
                size="lg"
                onClick={() => {
                 setNotifCont(0)
                  history.push("/app/notifications");
                }}
                color="blue"
              >
                <Indicator color="red" disabled={notifCont > 0 ? false: true} >
                  <IconBell stroke={2} size={24} /> 

                 
              
                </Indicator>
              </ActionIcon>

              <ActionIcon
                size="lg"
                onClick={() => history.push("/app/chats")}
                variant="light"
                color="blue"
              >
                <Indicator color="red" disabled={messageUnread || chatRoomCount > 0}>
                  <IconMessageDots stroke={2} size={24} />
                </Indicator>
              </ActionIcon>
            </Group>
          }
        />
      }
    >
      <Feeds />
    </AppShell>
  );
}
