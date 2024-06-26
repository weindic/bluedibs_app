import { Box, Title } from "@mantine/core";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router";
import AppShell from "../../components/AppShell";
import { IonAlert, IonAvatar, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonModal, IonProgressBar, IonRow } from "@ionic/react";
import { useGlobalState } from "../../realtime/GlobalStateContext"; // Import the hook
import './style.css'
import Timer from "../User/timer";
import { fetchVipChatRequestById, sendNotificationApi } from "./notification.api";
import { useAppSelector } from "../../store/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { fetchUserDetails, followUser, unFollowUser } from "../User/api.user";
import { NotifyUser } from "../../utils/notification";
import { follow, unfollow } from "../../store/slice/userSlice";
import { queryClient } from "../../utils/queryClient";

dayjs.extend(relativeTime);

function Notifications() {
  const { notifications } = useGlobalState(); // Use the hook to get notifications
  const history = useHistory();
  const user = useAppSelector((state) => state.user);

  const [requestModal, setRequestModal]  =  useState(false);

 const [vipChatData, setChatData] =  useState({});

 const [rejected, setrejected] = useState(false)

 const [user_id, setUserID] = useState('')

 const dispatch = useDispatch();


 useEffect(()=>{

  let locUser:any = localStorage.getItem('bluedibs:user');
  let lcU = JSON.parse(locUser);

  setUserID(lcU.id)
 },[])

 const userQuery = useQuery({
  
  queryKey: ["user", user_id],
  queryFn: () => fetchUserDetails(user_id),
});




  const closeModal = () => {
    setRequestModal(false);
  }

  const structuredNotifications = useMemo(() => {
    let data: Record<string, Notification[]> = {
      today: [],
      yesterday: [],
      before: [],
    };
  
    const date = new Date();
    const today = date.toDateString();
  
    date.setDate(date.getDate() - 1);
    const yesterday = date.toDateString();
  
    // Sorting notifications by createdAt field in descending order
    const sortedNotifications = (notifications || []).slice().reverse();
  
    sortedNotifications.forEach((notification) => {
      const notificationDate = new Date(notification.createdAt).toDateString();
  
      if (notificationDate === today) {
        data.today.push(notification);
      } else if (notificationDate === yesterday) {
        data.yesterday.push(notification);
      } else {
        data.before.push(notification);
      }
    });

    console.log('datanotif',data)
  
    return data;
  }, [notifications]);
  


  const showRequestModal = async (notif:any) =>{


    if(notif.type==='vipchat'){

      const dt = await  fetchVipChatRequestById(notif.sourceId)

      console.log('dtdtdtdt',dt.status===1)
      
      
      if(dt.status===1){

        setChatData(notif)
        setRequestModal(true)
        
      }
      else{
        console.log('dtdtdtdt check expire',dt.status===1)
        expiredChat()
      }
    
    }

    if(notif.type==='chatlive' || notif.type==='chatwait' ||   notif.type==='viproom'){
      history.push('/app/vipChat/'+notif.sourceId)
     }

    if(notif.type==='refferal'){
     history.push('/app/wallet',{type:'REFFERAL'})
    }
    
    
    if(notif.type==='like'){
      history.push('/app/feed')
     }

     if(notif.type==='comment'){
      history.push('/app/comments/'+notif.sourceId)
     }

     if(notif.type==='buy'){
      history.push('/app/user/'+notif.sourceId)
     }

     if(notif.type==='sell'){
      history.push('/app/user/'+notif.sourceId)
     }

     if(notif.type==='follow'){
      history.push('/app/user/'+notif.sourceId)
     }
     
 

 
  
  }


  const changeStatus = async (status:number) =>{
    
    const payload = {
      id:vipChatData.sourceId,
      status:status,
    
    }

    try {
     await fetch('http://localhost:3000/vip-chat-request/update-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).then(async res=>{

        let data = await res.json()
        
      if(data.status===2){

        let playload = {
          userOne:data.fromId,
          userTwo:data.toId,

        }

     createVipRoom(playload)

      }
  
  
  
        // Close the modal
        closeModal();

      });

    

    
    } catch (error) {
      // console.error('Error sending VIP chat request:', error.message);
    }

  }



  const createVipRoom = async (data:any) => {
    try {
      const response = await fetch('http://localhost:3000/vip-chat-room/createRoom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }
  
      const result = await response.json();

      if(result){

       await sendNotificationApi(
        data.userTwo, 
        data.userOne, 
        result.id, 
        'Has created a VIP chat room for you. Join Now!',
        'viproom')

        history.push(`/app/vipChat/`+result.id);
      }
     
    } catch (error) {
      // console.error('There was a problem with the fetch operation:', error);
    }
  };


  const expiredChat = ()=>{
    setrejected(true)
  }


  const updateAllSeenStatusByUserId = async (userId:any, seenStatus:any) => {
    try {
      const response = await fetch('http://localhost:3000/notification-alerts/seen-status/all', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, seenStatus }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update seen status');
      }
  
      const data = await response.json();
      console.log('Successfully updated seen status:', data);
      return data;
    } catch (error) {
      // console.error('Error updating seen status:', error);
    }
  };
  

  useEffect(()=>{
    let locUser:any = localStorage.getItem('bluedibs:user');
    let lcU = JSON.parse(locUser);
    updateAllSeenStatusByUserId(lcU?.id, '1')
  },[])




  const sendNotification = async(userId:any) =>{

    let locUser:any = localStorage.getItem('bluedibs:user');
    let lcU = JSON.parse(locUser);


    sendNotificationApi(lcU.id, userId, lcU.id, 'Started Following You', 'follow')

  
  }


  const userFollowUnfollow = (notif:any) => {
    if (user.followingIDs.includes(notif.fromId)) {
      unfollowMut.mutate(notif.fromId);


    }else{
       followMut.mutate(notif.fromId);

       sendNotification(notif.fromId)
    }
   
  };




  const followMut = useMutation({
    mutationFn: followUser,
    onSuccess({ data }) {
      userQuery.refetch();
      NotifyUser(user_id, {
        from: user.id,
        message: `${user.username} has followed you!`,
      });
      dispatch(follow(user_id));
      queryClient.invalidateQueries(["feeds"]);
      queryClient.invalidateQueries(["suggestions"]);
    },
  });

  const unfollowMut = useMutation({
    mutationFn: unFollowUser,
    onSuccess({ data }) {
      userQuery.refetch();
      dispatch(unfollow(user_id));
      queryClient.invalidateQueries(["feeds"]);
      queryClient.invalidateQueries(["suggestions"]);
    },
  });





  return (
    <AppShell
      header={
        <Title order={3} fz={20} weight={600}>
          Notifications
        </Title>
      }
    >
      {Object.keys(structuredNotifications).map((key) =>
        !structuredNotifications[key].length ? null : (
          <Box py="sm" key={key}>
            <Title
              px="sm"
              mb="xs"
              fw="bold"
              fz={"1.25rem"}
              order={3}
              sx={{ textTransform: "capitalize" }}
            >
              {key}
            </Title>

            <IonList>
              {structuredNotifications[key].map((notification) => (
              
                <IonItem
                style={{opacity:notification.status==1? 1: 0.7}}
               
                
                
                key={notification.createdAt} >

                <IonGrid>
                  <IonRow>
                    <IonCol size={"2"}>
                      <IonAvatar className="smallavatar" onClick={()=>history.push('/app/user/'+notification.fromId)}>

                        {notification.type==='bluedibs' || notification.type==='refferal' ?

                        <img src={'resources/icon-only.png'} 

                        alt="logo"/>
                        : 

                        <img src={notification.avatarPath!=null ? notification.avatarPath: "public/avatar.png"} 
                        onError={(e) => {
                        e.target.src = 'resources/avatar.png'; // Replace with default image path
                        }}
                        alt="avatar"/>
                        }


                        </IonAvatar>

                    </IonCol>
                    <IonCol size={notification.type==='follow'? '7': '8'}>
                    <IonLabel className="notifLabel">
                   
                    
                   <h6 onClick={()=>history.push('/app/user/'+notification.fromId)}>@{notification.username}
{/*                    
                   {checkPopular(notification.fromId) && <>
                  <span>  <img src="public/tick.svg" style={{width:15, height:15}}/></span>
                  
                </>
                } */}
                   </h6>
                   <small  onClick={()=> { showRequestModal(notification)}}>{notification.message}</small>
                
                   <p style={{fontSize:10}}>{dayjs(notification.createdAt).fromNow()}</p>
                 </IonLabel>
                    </IonCol>
                    <IonCol size={notification.type==='follow'? '3': '2'}>
                    <div className="symbols">
                {notification.type==='vipchat' && 
                <span >
                <svg  xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#ffd233" d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14z"/></svg>
                </span>
                }

                {notification.type==='like' && 
                <span >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#3406b1" d="M23 10a2 2 0 0 0-2-2h-6.32l.96-4.57c.02-.1.03-.21.03-.32c0-.41-.17-.79-.44-1.06L14.17 1L7.59 7.58C7.22 7.95 7 8.45 7 9v10a2 2 0 0 0 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73zM1 21h4V9H1z"/></svg>
                </span>
                }

              {notification.type==='comment' && 
                <span >
                <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#db14c1" fill-rule="evenodd" d="M3 10.4c0-2.24 0-3.36.436-4.216a4 4 0 0 1 1.748-1.748C6.04 4 7.16 4 9.4 4h5.2c2.24 0 3.36 0 4.216.436a4 4 0 0 1 1.748 1.748C21 7.04 21 8.16 21 10.4v1.2c0 2.24 0 3.36-.436 4.216a4 4 0 0 1-1.748 1.748C17.96 18 16.84 18 14.6 18H7.414a1 1 0 0 0-.707.293l-2 2c-.63.63-1.707.184-1.707-.707V13zM9 8a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2zm0 4a1 1 0 1 0 0 2h3a1 1 0 1 0 0-2z" clip-rule="evenodd"/></svg>
                </span>
                }


               {notification.type==='mentionComment' && 
                <span >
               <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 12 12"><path fill="#db1414" d="M2 6a4 4 0 1 1 8 0c0 1.174-.589 1.47-.792 1.481c-.108.006-.252-.032-.394-.218C8.662 7.065 8.5 6.675 8.5 6V3.75a.75.75 0 0 0-1.402-.37A2.55 2.55 0 0 0 5.75 3C4.15 3 3 4.429 3 6s1.15 3 2.75 3c.75 0 1.403-.315 1.883-.811c.42.54 1.022.826 1.66.79C10.588 8.906 11.5 7.63 11.5 6a5.5 5.5 0 1 0-4.05 5.307a.75.75 0 0 0-.394-1.448A4.006 4.006 0 0 1 2 6m5 0c0 .914-.64 1.5-1.25 1.5S4.5 6.914 4.5 6s.64-1.5 1.25-1.5S7 5.086 7 6"/></svg>
                </span>
                }


              {notification.type==='buy' && 
                <span >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#4ecb71" d="M21.92 6.62a1 1 0 0 0-.54-.54A1 1 0 0 0 21 6h-5a1 1 0 0 0 0 2h2.59L13 13.59l-3.29-3.3a1 1 0 0 0-1.42 0l-6 6a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0L9 12.41l3.29 3.3a1 1 0 0 0 1.42 0L20 9.41V12a1 1 0 0 0 2 0V7a1 1 0 0 0-.08-.38"/></svg>
                </span>
                }


               {notification.type==='sell' && 
                <span >
               <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 256 256"><path fill="#f24e1e" d="M244 128v64a12 12 0 0 1-12 12h-64a12 12 0 0 1 0-24h35l-67-67l-31.51 31.52a12 12 0 0 1-17 0l-72-72a12 12 0 0 1 17-17L96 119l31.51-31.52a12 12 0 0 1 17 0L220 163v-35a12 12 0 0 1 24 0"/></svg>
                </span>
                }


             {notification.type==='refferal' && 
                <span >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#e4a951" d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.754a3.375 3.375 0 0 1 5.432 3.997h3.943a1.874 1.874 0 0 1 1.875 1.874v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3m1.875 9.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6zm1.5 0v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75z"/></svg>
               </span>
                }

              {notification.type==='withdraw' && 
                <span >
                  <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#9747ff" d="M19 9h-4V3H9v6H5l7 7zM5 18v2h14v-2z"/></svg>
               </span>
                }


                 {notification.type==='viproom' && 
                <span >
                 <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#85b6ff" d="M3 12c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H9v3l-3-3zm18 6c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-6v1c0 2.2-1.8 4-4 4v2c0 1.1.9 2 2 2h2v3l3-3z"/></svg>
               </span>
                }

              {notification.type==='chatlive' && 
                <span >
                 <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#85b6ff" d="M3 12c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H9v3l-3-3zm18 6c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-6v1c0 2.2-1.8 4-4 4v2c0 1.1.9 2 2 2h2v3l3-3z"/></svg>
               </span>
                }

             {notification.type==='chatwait' && 
                <span >
                 <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#85b6ff" d="M3 12c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H9v3l-3-3zm18 6c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-6v1c0 2.2-1.8 4-4 4v2c0 1.1.9 2 2 2h2v3l3-3z"/></svg>
               </span>
                }

             {notification.type==='chatend' && 
                <span >
                 <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="#85b6ff" d="M3 12c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2H9v3l-3-3zm18 6c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2h-6v1c0 2.2-1.8 4-4 4v2c0 1.1.9 2 2 2h2v3l3-3z"/></svg>
               </span>
                }
            
 
 

              {/* {notification.type==='follow' && 
                <span >
                  <IonButton style={{marginLeft:-25}} size="small"  onClick={()=>userFollowUnfollow(notification)}  mode="ios">
                   {user.followingIDs.includes(notification.fromId) ? 'Following':'Follow Back' } 
                    </IonButton>
                </span>
                } */}


             </div>
                 
                    </IonCol>
                  </IonRow>
                </IonGrid>

             
              
                 
                </IonItem>
              ))}
            </IonList>
          </Box>
        )
      )}



<IonAlert
        isOpen={rejected}
      
        header="Notification"
        message={`This request is already expired Kindly check your VIP chats.`}
        buttons={['OK']}
      />

      
    <IonModal isOpen={requestModal} id="waitingMod"  onDidDismiss={closeModal}>
      <IonContent>
        <div className=" mainCont ">
          <h5 style={{  textAlign:'center' }}>VIP Chat Request</h5>
         
       
      <IonAvatar size="large" style={{border:'3px solid #310071', margin:'0 auto', padding:5}}>
      <img src={vipChatData.avatarPath!=null ? vipChatData.avatarPath: "/avatar.png"} 
                     onError={(e) => {
                      e.target.src = 'resources/avatar.png'; // Replace with default image path
                    }}
                    alt="avatar"/>
      </IonAvatar>

      <h6 >@{vipChatData?.username}</h6>
      <small>{vipChatData.message}</small>
        
        {vipChatData.message!=='Has rejected your VIP chat request.' ?
        
        <IonItem>
        <IonGrid>
          <IonRow>
            <IonCol>
              <IonButton  onClick = {()=>changeStatus(3)} size="small" shape="round" fill="outline" mode="ios">Reject</IonButton>
            </IonCol>
            <IonCol>
            <IonButton onClick = {()=>changeStatus(2)}  size="small" shape="round"  mode="ios">Accept</IonButton>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
        
        : <IonButton style={{marginTop:20}} onClick={()=>closeModal()} size="small" shape="round"  mode="ios">Ok</IonButton>}
      

        </div>
      </IonContent>
    </IonModal>
    </AppShell>
  );
}

export default Notifications;
