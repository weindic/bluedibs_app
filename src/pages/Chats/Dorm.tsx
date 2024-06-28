import { Dialog } from "@capacitor/dialog";
import {
  IonAvatar,
  IonContent,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import {
  ActionIcon,
  Avatar,
  Box,
  ColorSwatch,
  Group,
  LoadingOverlay,
  Text,
  TextInput,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconX } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { onValue, ref, remove } from "firebase/database";
import { searchOutline } from "ionicons/icons";
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router";
import AppShell from "../../components/AppShell";
import { useAppSelector } from "../../store/hooks";
import { database } from "../../utils/firebase";
import { imgUrl } from "../../utils/media";
import { createDorm } from "../User/createDorm";
import { getProfiles } from "./api.chat";
import "./style.css";
import { useChatState } from "../../realtime/ChatContext";

export function Dorm() {
  const user = useAppSelector((state) => state.user);
  const history = useHistory();
  const dormRooms: any = useAppSelector((state) => state.dorm)
  const [selectedTab, setSelectedTab] = useState('messages');

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchQuery] = useDebouncedValue(searchQuery, 200, {
    leading: true,
  });

  const userIdsRef = Object.keys(dormRooms || {})

  const location = useLocation();
  const notifData:any = location.state || {};

  const theme = useMantineTheme();

  const dormStoreRefURI = `dorm/${user.id}`;

  const getProfilesQuery = useQuery({
    queryKey: ["profiles", dormRooms],
    queryFn: () => getProfiles(userIdsRef),
    refetchOnWindowFocus: false,
    placeholderData: [],
    select(data: { username: string; avatarPath: string; id: string }[]) {
      const filteredUnread: {
        username: string;
        avatarPath: string;
        id: string;
      }[] = [];
      data.forEach((profile) => {
        if (dormRooms && dormRooms[profile.id].unread)
          filteredUnread.unshift(profile);
        else filteredUnread.push(profile);
      });
      return filteredUnread;
    },
  });

  const deleteDorm = async (targetUserId: string) => {
    const itemSwiper = document.getElementById(`ionic-swiper-${targetUserId}`);
    if (itemSwiper) itemSwiper?.close();
    const { value } = await Dialog.confirm({
      title: "Confirm",
      message: `Confirm delete chat?`,
    });
    if (value) remove(ref(database, `${dormStoreRefURI}/${targetUserId}`));
  };







  useEffect(()=>{

    if(notifData.vip===true){
      setSelectedTab('vipChat')
    }
 
  },[notifData])


  const chatStateData = useChatState();

  const [vipChatRooms, setVipChatRooms] = useState([])

  const [unreadCount, unreadVipCount] = useState(0)


  useEffect(() => {

    if(chatStateData.chatRooms){

      const sortedData:any =  chatStateData.chatRooms?.sort((a, b) => new Date(b.createdAt.$date) - new Date(a.createdAt.$date));
      const unreadData:any = sortedData?.filter(item => item.unread === 1);
  
      console.log('dkjdjdjk',sortedData, unreadData)
      setVipChatRooms(sortedData)
      unreadVipCount(unreadData)
    }
    
  
  }, [chatStateData]);



  
  

  // VIp chat here===================///


 

  return (
    <AppShell
      header={
        <Title order={3} fz={20} weight={600}>
          Chats
        </Title>
      }
    >
      <LoadingOverlay visible={isLoading || getProfilesQuery.isFetching} />


      <IonContent>
      <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value as string)}>
        <IonSegmentButton value="messages">
          <IonLabel style={{textTransform:'capitalize'}}>Messages</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="vipChat">
          <IonLabel style={{textTransform:'capitalize'}}>VIP Chat {unreadCount?.length > 0 && <span>({unreadCount?.length})</span>}</IonLabel>
        </IonSegmentButton>
      </IonSegment>
      {selectedTab === 'messages' && (
        <div>
         

         <Box p="sm">
        <TextInput
          w="100%"
          placeholder="Search"
          size="sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          icon={<IonIcon icon={searchOutline} />}
          rightSection={
            searchQuery.length ? (
              <ActionIcon onClick={() => setSearchQuery("")} size="xs">
                <IconX size="12" />
              </ActionIcon>
            ) : null
          }
        />
      </Box>

      {(getProfilesQuery.data ?? [])
        .filter((profile) =>
          profile.username
            .toLowerCase()
            .startsWith(debouncedSearchQuery.toLowerCase())
        )
        .map(
          (profile: { username: string; avatarPath: string; id: string }) => (
            <IonItemSliding id={`ionic-swiper-${profile.id}`} key={profile.id}>
              <IonItem
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  await createDorm(user.id, profile.id);
                  history.push(`/app/chat/${profile.id}`);
                }}
                lines="full"
              >
                <Group position="apart" w="100%" align={"center"} py={5}>
                  <Group spacing={"sm"}>
                   
                    <IonAvatar  className="conAv" style={{width:40, height:40}}>
                    <img src={profile.avatarPath!==null? profile.avatarPath: 'public/avatar.png'} 
                    onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src="public/avatar.png";

                    }}/>
                    </IonAvatar>

                    <Text fw={500}>{profile.username}</Text>
                  </Group>

                  {!!dormRooms && dormRooms[profile.id].unread != 0 && (
                    <ColorSwatch color={theme.colors.blue[5]} size={10} />
                  )}
                </Group>
              </IonItem>

              <IonItemOptions>
                <IonItemOption
                  onClick={() => deleteDorm(profile.id)}
                  color="danger"
                >
                  Delete
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          )
        )}


        </div>
      )}
      {selectedTab === 'vipChat' && (
        <div>
       
       
       <Box p="sm">
        <TextInput
          w="100%"
          placeholder="Search"
          size="sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
          icon={<IonIcon icon={searchOutline} />}
          rightSection={
            searchQuery.length ? (
              <ActionIcon onClick={() => setSearchQuery("")} size="xs">
                <IconX size="12" />
              </ActionIcon>
            ) : null
          }
        />
      </Box>

      {vipChatRooms?.map((item) => (
            <IonItemSliding id={`ionic-swiper-${item.id}`} key={item.id}>
              <IonItem
                href="#"
                onClick={async (e) => {
                  e.preventDefault();
                  history.push(`/app/vipChat/${item.id}`) 
                
                }}
                lines="full"
              >
                <Group position="apart" w="100%" align={"center"} py={5}>

                  {item?.userOne.id===user.id ? <>
                  
                    <Group spacing={"sm"}>
                    <IonAvatar  className="conAv" style={{width:40, height:40}}>
                    <img src={item?.userTwo?.avatarPath!==null? item?.userTwo?.avatarPath: 'public/avatar.png'} 
                    onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src="public/avatar.png";

                    }}/>
                    </IonAvatar>
                  

                    <Text fw={500}>{item?.userTwo?.username}</Text>
                  </Group>
                  </>:
                  <>
                   <Group spacing={"sm"}>
                   <IonAvatar  className="conAv" style={{width:40, height:40}}>
                    <img src={item?.userOne?.avatarPath!==null? item?.userOne?.avatarPath: 'public/avatar.png'} 
                    onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src="public/avatar.png";

                    }}/>
                    </IonAvatar>
                 
                  

                    <Text fw={500}>{item?.userOne?.username}</Text>
                  </Group>
                  </>
                 
                  }
                
                { item?.unread != 0 && (
                    <ColorSwatch color={theme.colors.blue[5]} size={10} />
                  )}
                  
                  
                  
                </Group>
              </IonItem>

              <IonItemOptions>
                <IonItemOption
                  onClick={() => deleteDorm(item.id)}
                  color="danger"
                >
                  Delete
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          )
        )}
        </div>
      )}
    </IonContent>

   
    </AppShell>
  );
}
