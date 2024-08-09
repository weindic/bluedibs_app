import {
  IonAlert,
  IonAvatar,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonProgressBar,
  IonRadio,
  IonRadioGroup,
  IonRow,
  IonicSafeString,
  useIonAlert,
  useIonViewWillLeave,
} from "@ionic/react";
import {
  ActionIcon,
  Avatar,
  Button,
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
import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import Timer from './timer';
import { ChatStateProvider, useChatState} from "../../realtime/ChatContext";
import { sendNotificationApi } from "../Notification/notification.api";
import { useGlobalState } from "../../realtime/GlobalStateContext";
import { startLiveChat } from "./api.chat";



const Incoming = ({ message, type, file }: { message: string; type: "image" | "message"; file:string }) => {
  if (type == "image") {
    return (
      <Image
        src={message!==''? message: file}
        height={200}
        width={250}
        style={{ marginRight: "auto" }}
        styles={{ image: { borderRadius: "12px 12px 12px 0" } }}
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

const OutGoing = ({ message, type, file }: { message: string; type: "image" | "message"; file:string }) => {
  if (type == "image") {
    return (
      <Image
        src={message!==''? message: file}
        height={200}
        width={250}
        color={'#e9b046'}
        style={{ marginLeft: "auto" }}
        styles={{ image: { borderRadius: "12px 12px 0 12px" } }}
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

export function VipChatBox() {
  const message = useRef<HTMLInputElement>(null);
  const user = useAppSelector((state) => state.user);
  const { roomId } = useParams<{ roomId: string }>();

  const [imgConfirmation, setImgConfirmation] = useState(false);
  const imgRef = useRef<File>();
  const history = useHistory();
  const location = useLocation();
  const { chtData, isVip }: any = location.state || {};

  const [welcomeAler, setWelcome] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [noBalance, setNoBalance] = useState(false);
  const [curUserData, setCurUser] = useState({});
  const [chatType, setChatType] = useState('text');
  const [duration, setDuration] = useState('10');
  const [waitingModal, setWaitingModal] = useState(false);
  const [timers, setTimer] = useState({ min: 0, sec: 0 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');

  const [selImage, setSelectedImage] = useState('');

  const [presentAlert] = useIonAlert();

 const [vipChatData, setVipChatData] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [chatBoxData, setChatBoxData] = useState(null);

  const [chatInfo, setChatInfo] = useState(null)

  const [askInfo, setAskInfo] = useState(false)

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const { notifications } = useGlobalState();

  const [msgData, setMsgData] = useState([]);



  const { messages, chatRooms, chatRoomID, setRoomId, updateTimer } = useChatState(); // Adjust state variable name

  useEffect(() => {
    console.log('Messages:', messages);
    console.log('Chat Rooms:', chatRooms);
    console.log('Active Chat Room ID:', chatRoomID);

      let currentChatRoom = chatRooms.filter(item=>{
        return item.id === chatRoomID;
      })

    
   

    // Ensure roomId is not null before fetching messages
    if (roomId) {
      fetchMessages(roomId); // Replace with your fetch logic
      setMsgData(messages)
    }
  }, [messages, chatRooms, chatRoomID]);




  

  const fetchMessages = async (roomId: string) => {
    try {
      const response = await fetch(`https://server.bluedibs.com/vip-chat-box/getAllMessages/${roomId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const messagesData = await response.json();
      console.log('Fetched messages:', messagesData);

      setMsgData(messagesData)
      // Update messages state
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    console.log('roomId',roomId)
    setRoomId(roomId); 
    getRoomData(roomId);
  }, []);


  useEffect(() => {

    console.log('timers',timers)

    if(timers.min > 0){

     setAskInfo(true)
    }

  }, [timers]);


  useEffect(()=>{

    console.log('timer', timers, duration)

    localStorage.setItem('roomAskInfo',JSON.stringify({startChat:false}))
   

  },[])




  
  useEffect(() => {
   

    const filtered = notifications.filter((notification:any) => 
      notification.userId === user.id && notification.sourceId === roomId && notification.type === 'chatLive'
    );

    const endChatData = notifications.filter((notification:any) => 
      notification.userId === user.id && notification.sourceId === roomId && notification.type === 'chatend'
    );

    console.log('filtered',filtered)

    if(filtered?.length > 0){
      localStorage.setItem('roomAskInfo',JSON.stringify({startChat:true}))
      setAskInfo(true)


      if(filtered?.[0]?.userId===user.id){

        //  getRequestData(filtered?.[0]?.fromId, filtered?.[0]?.userId)

         setAndStartTimer(roomId)

      }

      console.log('(endChatData?.length > 0',endChatData?.length > 0)


    

    

    }
   

   
  }, [notifications]);






  const getRequestData = async (fromId:any, toId:any) => {
    const url = 'https://server.bluedibs.com/vip-chat-request/get-latest'; // Update this URL to your actual API endpoint
  
    const requestBody = {
      fromId,
      toId,
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();

      if(data){

          setChatInfo(data)
          console.log('infoOne111',data)
          setDuration(data?.duration)
          // setTimer({min:parseInt(data?.duration), sec:0})
  

        console.log('infoOne111', requestBody, )

      }

      return data;
    } catch (error) {
      console.error('Error fetching vip chat request data:', error);
      throw error;
    }
  };

  const setAndStartTimer = async (roomId) => {
    try {
      // Fetch the room data
      const roomResponse = await fetch(`https://server.bluedibs.com/vip-chat-room/${roomId}`);
      
      if (!roomResponse.ok) {
        throw new Error('Failed to fetch room data');
      }
  
      const roomData = await roomResponse.json();
      
      // Set room data into state or perform required action
      setRoomData(roomData);
  
      // Fetch expiry datetime from roomData
      const expiryDateTime = new Date(roomData.expiry);
      
      // Ensure expiryDateTime is valid
      if (isNaN(expiryDateTime.getTime())) {
        throw new Error('Invalid expiry date');
      }
  
      // Calculate difference in milliseconds from current time to expiry time
      const currentDateTime = new Date();
      const timeDiffMillis = expiryDateTime - currentDateTime;
      
      // Ensure timeDiffMillis is a positive number
      if (timeDiffMillis < 0) {
        console.log('The chat has ended');
        return;
      }
  
      const timeDiffSeconds = Math.floor((timeDiffMillis % 60000) / 1000);
      const timeDiffMinutes = Math.floor(timeDiffMillis / 60000);
  
      console.log('dkjdjkjkf', { min: timeDiffMinutes, sec: timeDiffSeconds });
  
      // Set the timer with minutes and seconds
      setTimer({ min: timeDiffMinutes, sec: timeDiffSeconds });
  
      // Optionally, you can start a countdown or perform other actions based on the timer values
    } catch (error) {
      console.error('Error in setAndStartTimer:', error);
      // Handle errors as needed
    }
  };
  
  



  


  const startVipChatByRequester = async (user:any, userTwo:any, roomId:any, duration:any) => {

    // if(timers.min < 1){
    //   const url = 'https://server.bluedibs.com/vip-chat-room/startChatRoom';
  
    //   try {
    //     const response = await fetch(url, {
    //       method: 'POST',
    //       headers: {
    //         'Content-Type': 'application/json'
    //       },
    //       body: JSON.stringify({ roomId: roomId, minutes: duration })
    //     });
    
    //     if (!response.ok) {
    //       throw new Error('Network response was not ok');
    //     }
    
    //     const res = await response.json();
    //     console.log('resres', res.data);
    
    //     await sendNotificationApi(user, userTwo, roomId, 'Has joined your VIP chat. Start an amazing chat Now.', 'chatLive');
    //     setAndStartTimer(roomId);
    //   } catch (error) {
    //     console.error('There was a problem with the fetch operation:', error);
    //   }
    // }

  };
  



  const getRoomData = async (roomId: any) => {

    try {
      const roomResponse = await fetch(`https://server.bluedibs.com/vip-chat-room/${roomId}`);
      const roomData = await roomResponse.json();
      setRoomData(roomData);
      getChatBoxData(roomId);
      
    

      console.log('getReqData', roomData.userOne.id, user.id)

      if(roomData.userOne.id!==user.id){
        const vipChatData = await getUserVipChat(user.id)
        
        console.log('dhjkjdkjdkj2', user.id,  roomData.userOne.id)
        setVipChatData(vipChatData)

        updateSeenStatus(roomId)
        getRequestData( user.id,  roomData.userOne.id)
       
      
        if(roomData.status!==0){
          askToJoinInfo(user.id, roomData.userOne.id, roomId )
        }
     
      
      }
      else{
        console.log('dhjkjdkjdkj1', user.id,  roomData.userTwo.id)
        getRequestData( user.id,  roomData.userTwo.id)
      }

      if(roomData.status!==0){

        if(roomData.userOne.id===user.id){
          const vipChatData = await getUserVipChat(user.id)
          console.log('bhghhg', user.id,  roomData.userTwo.id)
          setVipChatData(vipChatData)
        
  
         
  
          console.log('getReqData11')
          
            
          if(roomData.status!==0 ){
              startVipChatByRequester(user.id, roomData.userTwo.id, roomId, duration)

        
          }
        
        }
       
      }
  

    
     
    
    

    } catch (error) {
      console.error('Error fetching room data:', error);
    }
  };
  


  const updateSeenStatus = async (roomId:any) =>{
    const url = 'https://server.bluedibs.com/vip-chat-room/updateUnreadStatus'; // Update this URL to your actual API endpoint
  

  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({id:roomId}),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();

      setTimer({min:0, sec:0})

      return data;
    } catch (error) {
      console.error('Error fetching vip chat request data:', error);
      throw error;
    }

  }



 
  
  // Example usage:

 





  const goBack = () => {
    closeModal();
    history.goBack();
  };




  const askToJoinInfo = async (from:any, toid:any, room:any) =>{

    if(chatInfo?.duration > 0){

      await sendNotificationApi(from,toid, room, 'Is Waiting for you in VIP chat room. Join Now!', 'chatwait' )

      let usrAsk:any = localStorage.getItem('roomAskInfo')
      let userAskStatus = JSON.parse(usrAsk)?.startChat;
 
      setAskInfo(userAskStatus)
    }

   
  }



  const getUserVipChat = async (userId:any) => {

    
    try {
      const response = await fetch(`https://server.bluedibs.com/vip-chat/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch VIP chat data');
      }
      const data = await response.json();

  return data;
    } catch (error) {
      console.error('Error fetching VIP chat data:', error);
    }
  };




  const getChatBoxData = async (roomId: any) => {
    try {
      const chatBoxResponse = await fetch(`https://server.bluedibs.com/vip-chat-box/getAllMessages/${roomId}`);
      const chatBoxData = await chatBoxResponse.json();
      setChatBoxData(chatBoxData);
    } catch (error) {
      console.error('Error fetching chat box data:', error);
    }
  };



 
  const sendImageMessage = async () =>{

    if(selImage===''){
      return false;
    }

    const newMessage = {
      userId: user.id,
      message: '',
      type: 'image',
      file:selImage,
      replyId:'',
      roomId: roomId, // Include the roomId in the message payload

    };
  
    try {
      const response = await fetch('https://server.bluedibs.com/vip-chat-box/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
  
      const result = await response.json();
      // console.log('Message sent successfully:', result);
  
      // Clear the input field
      message.current.value = "";
    } catch (error) {
      console.error('Error sending message:', error);
    }

  }
  

  const sendMessage = async () => {
    if (!message.current) return;
  
    const newMessage = {
      userId: user.id,
      message: message.current.value,
      type: 'text',
      file:'',
      replyId:'',
      roomId: roomId, // Include the roomId in the message payload

    };
  
    try {
      const response = await fetch('https://server.bluedibs.com/vip-chat-box/sendMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newMessage),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
  
      const result = await response.json();
      // console.log('Message sent successfully:', result);
  
      // Clear the input field
      message.current.value = "";
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };


     const endTheChat = async(fromId:any, toId:any, amount:any, duration:any, roomId:any)=> {

   
    const payload = { fromId, toId, amount, duration, roomId };
  
    try {
      const response = await fetch('https://server.bluedibs.com/vip-chat-room/end-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
  
      const data = await response.json();

      await sendNotificationApi(toId, fromId, roomId, 'Your last vip chat was ended!', 'chatend');
      await sendNotificationApi(fromId, toId, roomId, 'Your last vip chat was ended!', 'chatend');

      console.log('roomData?.status', roomData?.status)

 
  

    
     
      return data;
    } catch (error) {
      console.error('There was a problem with the fetch operation:', error);
    }
  }


 const timeUpCall = async () => {
  try {
    console.log('vipChatData11',chatInfo )
    // Fetch current user's VIP chat data
    const vipChatData = chatInfo.toId === user.id 
      ? await getUserVipChat(user.id) 
      : await getUserVipChat(chatInfo.fromId);

    // Calculate charge based on remaining time (difference in minutes)
    const currentDateTime = new Date();
    const expiryDateTime = new Date(roomData.expiry);
    const timeDiffMinutes = Math.floor((expiryDateTime - currentDateTime) / (1000 * 60));

    // Calculate chargeValue based on time difference and chatInfo.duration
    let chargeValue = chatInfo.duration - timeDiffMinutes;
    if (chargeValue < 0) {
      chargeValue = 0;
    }

    // Calculate amount based on chargeValue and vipChatData.text
    const amount = chargeValue * vipChatData.text;

    // End the chat with the calculated amount
    endTheChat(chatInfo.fromId, chatInfo.toId, amount, chatInfo.duration, roomId);
  } catch (error) {
    console.error('Error in timeUpCall:', error);
    // Handle errors as needed
  }
};

  


// const callBakTimer = (timer:any) =>{

//   updateTimer(roomId, timer)

// }

const goBackSession = () =>{
  if(roomData.status!==0){
    presentAlert({
      header: 'Are you sure?',
      message: `If you press back then this VIP chat will be end.!`,
      ackdropDismiss: false, 
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes Exit',
       
          handler: () => {
            timeUpCall()
           
          }
        },
     
      ]
    });
  }
  else{
    history.goBack()
  }

}


useIonViewWillLeave(() => {
  if(roomData.status!==0){
    presentAlert({
      header: 'Are you sure?',
      message: `If you press back then this VIP chat will be end.!`,
      ackdropDismiss: false, 
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
        },
        {
          text: 'Yes Exit',
       
          handler: () => {
            timeUpCall()
           
          }
        },
     
      ]
    });
  }
  else{
    history.goBack()
  }


});



  return (
    <>
      <AppShell
        header={<>
          <Flex

            align={"center"}
            style={{ width: "100%", borderColor: "gray", 
            
            }}
            gap={"xl"}
          >
            <ActionIcon onClick={() => goBackSession()} variant="light">
              <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
            </ActionIcon>

            {roomData?.userOne.id===user.id ?
            
            <Group spacing={"xs"}>
          <IonAvatar  className="conAv" style={{width:35, height:35}}>
                    <img src={roomData?.userTwo?.avatarPath!==null? roomData?.userTwo?.avatarPath: '/avatar.png'} 
                    onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src="/avatar.png";

                    }}/>
                    </IonAvatar>

            

            <Title order={3} fz={17} weight={500}>
              {roomData?.userTwo?.username}
            </Title>

         
          </Group>
            : 
            
            <Group spacing={"xs"}>
          

                 <IonAvatar  className="conAv" style={{width:35, height:35}}>
                    <img src={roomData?.userOne?.avatarPath!==null? roomData?.userOne?.avatarPath: '/avatar.png'} 
                    onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src="/avatar.png";

                    }}/>
                    </IonAvatar>

            <Title order={3} fz={17} weight={500}>
              {roomData?.userOne?.username}
            </Title>

            

          
          </Group>
            }

          
         
          </Flex>
        
         
        <div className="vipLabel"> 
        {roomData?.status!==0 ? 
        <small style={{  textAlign: 'right', fontSize:14  }}>
      {timers?.min > 0 ? 
       <span>This VIP chat will be end in  {(askInfo === true && timers.min > 0)? <strong> {}(  <Timer  initialMinutes={timers.min} initialSeconds={timers.sec} timeUpCall={timeUpCall} /> )</strong> : <strong>(   {chatInfo?.duration + ' : 00'}  )</strong>}  minutes.</span>
      : 
      <span>VIP chat will be start soon...!</span>
      }
       
      </small>
        :
        <small style={{  textAlign: 'right', fontSize:14  }}>
        <span>This VIP chat has already ended!.</span>
      </small>
        }
           </div>
      
        
        
         </>
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
              handler:() => sendImageMessage(),
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
            p={"sm"}
            direction={"column"}
            gap={"sm"}
            style={{ overflow: "auto", overflowX: "clip", height: "100%" }}
            pb={50}
            pt={70}
          >
            {msgData?.map((item:any) => {
            

              return item.userId === user.id ? (<>

                <OutGoing
                  key={item.id}
                  message={item.message}
                  file={item.file}
                  type={item.type || "text"}
                />
                {/* {item.seenStatus!==0? 
                 <span style={{textAlign:'right', fontSize:10, marginTop:-10}}> &#10004;</span>
                :
                <span style={{textAlign:'right', fontSize:10, marginTop:-10}}>&#10004; &#10004;</span>
                } */}
             
              </>
              

              ) : (
                <Incoming
                  key={item.id}
                  message={item.message}
                  file={item.file}
                  type={item.type || "text"}
                />
              );
            })}
          </Flex>

            {(askInfo && roomData?.status!==0 ) ? 
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
                  input: { border: "none" },
                  icon: { pointerEvents: "all" },
                }}
                style={{ width: "100%" }}
                placeholder="Message..."
                icon={
                  <ActionIcon
                    size={"xl"}
                    style={{ padding: 0, margin: 0 }}
                    onClick={(e) => {
                      e.preventDefault();
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = config.SUPPORTED_IMAGE_FORMATS;
                      input.onchange = async (_) => {
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
                        const url:any =  await uploadFileToFirebase(file);
                        setSelectedImage(url)
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
            :
            <>
            {roomData?.status!==0? 
              <div style={{padding:10, textAlign:'center'}}>Waiting for the chat partner...</div>
            :
            <div style={{padding:10, textAlign:'center'}}>Wait for another chat request!</div>
            }
            
            </>
            }
        
        </Flex>
      </AppShell>
    </>
  );
}
