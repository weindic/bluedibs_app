import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Group,
  Image,
  SimpleGrid,
  Text,
  Title,
  createStyles,
} from "@mantine/core";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import { IconMessageDots } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useParams } from "react-router";
import AppShell from "../../components/AppShell";
import { Chart, MinChart } from "../../components/Chart";
import InfiniteScrollComponent from "../../components/InfiniteScrollComponent";
import { ProfileEquityStats } from "../../components/Profile/ProfileEquityStats";
import { config } from "../../config";
import { useAppSelector } from "../../store/hooks";
import { follow, unfollow } from "../../store/slice/userSlice";
import { Status } from "../Profile/Profile";
import { fetchPosts } from "../Profile/profile.api";
import { BuySellModal } from "./BuySellModal";
import { fetchUserDetails, followUser, unFollowUser } from "./api.user";
import { createDorm } from "./createDorm";
import { NotifyUser } from "../../utils/notification";
import { IonAlert, IonAvatar, IonButton, IonCol, IonContent, IonGrid, IonInput, IonItem, IonLabel, IonList, IonModal, IonProgressBar, IonRadio, IonRadioGroup, IonRow, useIonAlert } from "@ionic/react";
import { sendNotificationApi } from "../Notification/notification.api";

import { useGlobalState } from "../../realtime/GlobalStateContext";
import Timer from "./timer";

const useStyles = createStyles((theme) => ({
  statusLeft: {},
  statusSquare: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#DADADA",
    borderTop: 0,
    borderBottom: 0,
  },
  statusRight: {},
}));

export function PublicProfile() {
  const { notifications } = useGlobalState();

  const [tempData, tempDataForChatRequest] = useState(null)
  const { classes } = useStyles();
  const history = useHistory();
  const { userId } = useParams<{ userId: string }>();
  const user = useAppSelector((state) => state.user);
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const [isPopular, setPopular] = useState(false)

  const [postData, setPostData] = useState<null | any>(null);

  const userQuery = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserDetails(userId),
  });



  

  const [welcomeAler, setWelcome] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [noBalance, setNoBalance] = useState(false);
  const [curUserData, setCurUser] = useState({})
  const [loggedUSer, setLogUser] = useState({})

  const [chatType, setChatType] = useState('text');
  const [duration, setDuration] = useState('10');

  const [waitingModal, setWaitingModal]  =  useState(false);

  const [timers, setTimer] = useState({min:0, sec:0});


  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const [error, setError] = useState('');

  const [resAlert, showResAlert] = useState(false);


  
useEffect(()=>{

  console.log('notifications',tempData)

  if(tempData!==null){

    const dataFit = notifications
    ?.filter(item => item?.sourceId === tempData?.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];


    const joinData = notifications?.filter(item=>{
      return item?.type === 'viproom' && item?.seenStatus === "0";
    })

    console.log('joinData', dataFit)

    if (Array.isArray(dataFit) && dataFit.length > 0) {
      // If dataFit is an array, loop through each element and present an alert
      dataFit.forEach((data) => {
          if (data.message === "Has rejected your VIP chat request." && data.type === 'vipchat') {
              presentAlert({
                  header: 'VIP Chat Response',
                  message: `${data.username} ${data.message}`,
                  buttons: [
                      {
                          text: 'Ok',
                          role: 'cancel',
                          handler: () => {
                              setWaitingModal(false);
                          }
                      }
                  ]
              });
          } else if (joinData?.length > 0) {
              presentAlert({
                  header: 'Join VIP Chat',
                  message: `${joinData[0].username} ${joinData[0].message}`,
                  buttons: [
                      {
                          text: 'Cancel',
                          role: 'cancel',
                          handler: () => {
                              setWaitingModal(false);
                          }
                      },
                      {
                          text: 'Join Now',
                          handler: () => {
                              setWaitingModal(false);
                              history.push('/app/vipChat/' + joinData[0].sourceId);
                          }
                      }
                  ]
              });
          }
      });
  } else if (typeof dataFit === 'object' && dataFit !== null) {
      // If dataFit is an object, present a single alert
      if (dataFit.message === "Has rejected your VIP chat request." && dataFit.type === 'vipchat') {
          presentAlert({
              header: 'VIP Chat Response',
              message: `${dataFit.username} ${dataFit.message}`,
              buttons: [
                  {
                      text: 'Ok',
                      role: 'cancel',
                      handler: () => {
                          setWaitingModal(false);
                      }
                  }
              ]
          });
      } else if (joinData?.length > 0) {
          presentAlert({
              header: 'Join VIP Chat',
              message: `${joinData[0].username} ${joinData[0].message}`,
              buttons: [
                  {
                      text: 'Cancel',
                      role: 'cancel',
                      handler: () => {
                          setWaitingModal(false);
                      }
                  },
                  {
                      text: 'Join Now',
                      handler: () => {
                          setWaitingModal(false);
                          history.push('/app/vipChat/' + joinData[0].sourceId);
                      }
                  }
              ]
          });
      }
  }
  
 

  }

  

},[notifications])






  const handleSendRequest = async () => {
// Check if chat type and duration are provided
    if (duration==='') {
      setError('Please select chat type and provide duration.');
      return;
    }

    if(curUserData?.balance >  (duration * vipChatData?.[chatType])){
      setError('');

      const requestData = {
        fromId: curUserData?.id,
        toId: userId,
        type: chatType,
        duration: duration,
        seenStatus: '0',
        status: 1,
      };
  
      try {
        const response = await fetch('https://server.bluedibs.com/vip-chat-request/send', {
          method: 'POST',
          headers: {
            
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
        });
  
        if (!response.ok) {
          throw new Error('Failed to send VIP chat request');
        }
  
        const data = await response.json()

        tempDataForChatRequest(data)
        setWaitingModal(true)
        setTimer({min:2, sec:0})
        // Close the modal
        closeModal();
  
    
        console.log('VIP chat request sent successfully');
      } catch (error) {
        console.error('Error sending VIP chat request:', error.message);
      }
      
    }
    else{

      closeModal()

      setNoBalance(true)
      return;

    }
  };


  
  const fetchUserProfile = async (id: string) => {
    const details = await fetchUserDetails(id);


    setCurUser(details)

  };



  useEffect(()=>{

 
    console.log('userQuery', userQuery)

    let usr:any = localStorage.getItem('bluedibs:user');
    let usrDt = JSON.parse(usr)

   

    setLogUser(usrDt)

  
    
    fetchUserProfile(usrDt?.id)
  
    
     
    
  },[])








  const [chtData, setCtData] =useState(null);

 // Dependency array ensures useEffect runs when userId changes

  const checkPopular = async(userId:any) =>{
    try {
      const response = await fetch('https://server.bluedibs.com/popular-profile/status/'+userId, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
     
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
 
      if(data?.userId===userId){
        setPopular(true)

      }

      console.log('datadata',data)
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  }




  useEffect(() => {
  
  
    checkPopular(userId)

  
}, []);


  const followMut = useMutation({
    mutationFn: followUser,
    onSuccess({ data }) {
      userQuery.refetch();
      NotifyUser(userId, {
        from: user.id,
        message: `${user.username} has followed you!`,
      });
      dispatch(follow(userId));
      queryClient.invalidateQueries(["feeds"]);
      queryClient.invalidateQueries(["suggestions"]);
    },
  });

  const unfollowMut = useMutation({
    mutationFn: unFollowUser,
    onSuccess({ data }) {
      userQuery.refetch();
      dispatch(unfollow(userId));
      queryClient.invalidateQueries(["feeds"]);
      queryClient.invalidateQueries(["suggestions"]);
    },
  });

  const fetchRoomFromDorm = async (targetUserId: string, isVip:boolean, chtData:any) => {
    await createDorm(user.id, targetUserId);

    openModal();


  };



  const sendNotification = async() =>{

    let locUser:any = localStorage.getItem('bluedibs:user');
    let lcU = JSON.parse(locUser);


    sendNotificationApi(lcU.id, userId, lcU.id, 'Started Following You', 'follow')

  
  }


  const userFollowUnfollow = () => {
    if (user.followingIDs.includes(userId)) {
      unfollowMut.mutate(userId);


    }else{
       followMut.mutate(userId);

       sendNotification()
    }
   
  };

  if (!userId) {
    history.goBack();
    return null;
  }

  const chartsData = (userQuery?.data?.graphData ?? [])?.map(
    (item: any, i: number) => ({
      x: i,
      y: item.price,
    })
  );

  const CharHOC = userQuery?.data ? <Chart data={chartsData} /> : null;









  const [vipChatData, setVipChatData] = useState(null);

  const getUserVipChat = async (userId:any) => {

    
    try {
      const response = await fetch(`https://server.bluedibs.com/vip-chat/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch VIP chat data');
      }
      const data = await response.json();

    
console.log('dssdsdsds',data)
      setVipChatData(data);
    } catch (error) {
      console.error('Error fetching VIP chat data:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      getUserVipChat(userId);
    }
  }, [userId]);



  


  const [presentAlert] = useIonAlert();

  const openVipChat = () => {
    presentAlert({
      header: 'VIP Chat',
      message: `The charge for this VIP chat is starting fro INR ${vipChatData.text} per minute. Would you like to continue?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Continue',
          handler: () => {

            let usr:any = localStorage.getItem('bluedibs:user');
            let udt = JSON.parse(usr);

            if(udt?.balance > vipChatData?.text * 1){

              fetchRoomFromDorm(userId, true, null)

            }
            else{
              alert('Sorry you do not have enought balance in your wallet to continue with this VIP chat. ')

            }
           
            // Add your logic to start the VIP chat here
          }
        }
      ]
    });
  };


  const goBack = () =>{

    closeModal()

    

  }

  return (
    <AppShell
      header={
        <Flex justify={"space-between"} style={{ alignItems: "center" }}>
          <Group spacing={5}>
            <ActionIcon onClick={() => history.goBack()}>
              <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
            </ActionIcon>

            <Title order={3} fz={20} weight={600} mr={"auto"}>
              Public Profile
            </Title>
          </Group>

          <ActionIcon
            variant="light"
            size="lg"
            onClick={() => fetchRoomFromDorm(userId, false, null)}
          >
            <IconMessageDots stroke={2} size={24} />
          </ActionIcon>
        </Flex>
      }
    >





<IonModal isOpen={isModalOpen} id="customMod" backdropDismiss={false} onDidDismiss={closeModal}>
      <IonContent>
        <div className=" mainCont">
          <h5 style={{ paddingLeft: 30 }}>VIP Chat Request</h5>
          <IonList>
            <IonItem>
              <IonRadioGroup value={chatType} onIonChange={e => setChatType(e.detail.value)}>
                <IonItem className="radio">
                  <IonLabel>Text Chat - &#8377; {vipChatData?.text} Per Min.</IonLabel>
                  <IonRadio slot="start" value="text" />
                </IonItem>
                <IonItem className="radio">
                  <IonLabel>Audio Chat - &#8377; {vipChatData?.audio} Per Min.</IonLabel>
                  <IonRadio disabled slot="start" value="audio" />
                </IonItem>
                <IonItem className="radio">
                  <IonLabel>Video Chat - &#8377; {vipChatData?.video} Per Min.</IonLabel>
                  <IonRadio disabled slot="start" value="video" />
                </IonItem>
              </IonRadioGroup>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Duration (minutes):</IonLabel>
              <IonInput type="number" placeholder="Enter mintues" value={duration} onIonChange={e => setDuration(e.target.value)}></IonInput>
            </IonItem>
          </IonList>

          {error && <div className="error-message">{error}</div>}


          <IonGrid>
            <IonRow>
              <IonCol size="6">
              <IonButton fill="outline" size="small" mode="ios" shape="round" expand="full" onClick={goBack}>
               Cancel
             </IonButton>
              </IonCol>
              <IonCol size="6">
              <IonButton mode="ios" size="small" shape="round" expand="full" onClick={handleSendRequest}>
                Send Request
             </IonButton>
                </IonCol>
            </IonRow>
          </IonGrid>

       
        </div>
      </IonContent>
    </IonModal>



    <IonModal isOpen={waitingModal} id="waitingMod" backdropDismiss={false} onDidDismiss={closeModal}>
      <IonContent>
        <div className=" mainCont">
          <h5 style={{  textAlign:'center' }}>Sending Request</h5>
         
          <IonItem>
           
            <IonAvatar className="conAv">
              <img src={curUserData?.avatarPath!==null? curUserData?.avatarPath: 'resources/avatar.png'} 
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src="/avatar.png";
            
      }}/>
            </IonAvatar>
           
            <IonLabel style={{padding:5, paddingTop:20, textAlign:'center'}}>
           
            <IonProgressBar style={{marginTop:5, borderRadius:25}} color="success" type="indeterminate"></IonProgressBar>
            <small>Chat in waiting list</small>
            <div>
            <Timer initialMinutes={timers.min} initialSeconds={timers.sec} />
             </div>
            </IonLabel>
           
            <IonAvatar  className="conAv">
            <img src={userQuery?.data?.avatarPath!==null? userQuery?.data?.avatarPath: 'resources/avatar.png'} 
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src="public/avatar.png";
            
      }}/>
            </IonAvatar>
          </IonItem>

          <IonItem className="ion-text-center">
          <small>Please wait untill requested person accept your request.</small>
          </IonItem>

        </div>
      </IonContent>
    </IonModal>



       <IonAlert
        isOpen={noBalance}
        onDidDismiss={() =>{ setNoBalance(false); goBack()}}
        header="Low Wallet Ballance"
        message={`You do not have enught balance to continue with this VIP chat kindly add funds to your wallet. You need at least INR ${duration * vipChatData?.[chatType]} in your wallet for requested duration.`}
        buttons={['OK']}
      />
  

  <IonAlert
        isOpen={welcomeAler}
        onDidDismiss={() => setWelcome(false)}
        header="Custom Alert Header"
        message={'Welcome to Vip Chat. Make sure you have enough balance in your wallet to make this VIP chat.'}
        buttons={['OK']}
      />






      <Container fluid p={"lg"}>
        <Flex pb={0} justify={"space-between"} align={"centers"}>
          <Flex direction={"column"} gap={"xs"} pl={0} p={"sm"}>


          <IonAvatar  className="bigPR"   style={{ width: 100, height: 100, border:`1px solid grey` }}>
            <img src={userQuery?.data?.avatarPath!==null? userQuery?.data?.avatarPath: 'resources/avatar.png'} 
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src="public/avatar.png";
            
                  }}
                  style={{ width: '100%', height: '100%', objectFit:'cover' }}
                  />
            </IonAvatar>

            {/* <Avatar
              src={
                userQuery.data?.avatar
                  ? `${config.STATIC_FILE_BASE_URL}${userQuery.data.avatarPath}?alt=media`
                  : null
              }
              size="xl"
              radius="md"
              style={{ width: 100, height: 100 }}
              alt="it's me"
            /> */}
            <div>
              <Title order={4} weight={500}>
                {userQuery.data?.username}
                
                {isPopular && <>
                  <span>  <img src="/tick.svg" style={{width:20, height:20}}/></span>
                  <small style={{display:'block', fontSize:10, color:'gray'}}>Populer Creator</small>
                </>

                 
                }
               
              </Title>
              <Group spacing={5}>
                <Text weight={500} size={"sm"}>
                  ₹
                  {userQuery.data?.price
                    ?.toFixed(8)
                    .replace(/(\.[0-9]*[1-9])0+$|\.0*$/, "$1")}
                </Text>
                <Text
                  component="span"
                  sx={{ wordBreak: "keep-all" }}
                  weight={400}
                  size={"sm"}
                >
                  EQ {userQuery.data?.userEquity?.toFixed(2)}%
                </Text>
              </Group>
              {/* {CharHOC} */}
            </div>
          </Flex>

          <div
            style={{
              height: "150px",
              width: "calc(100% - 200px)",
              marginTop: "10px",
              flex: 1,
            }}
          >
            <MinChart data={chartsData} />
          </div>
        </Flex>

        <Text size={"sm"} ff="Nunito Sans">
          {userQuery.data?.bio}
        </Text>
      </Container>

      <Flex gap={"lg"} p="lg" pt={0}>
        <Button
          w={"100%"}
          mt={"md"}
          variant={user.followingIDs?.includes(userId) ? "filled" : "light"}
          onClick={() => userFollowUnfollow()}
        >
          {user.followingIDs?.includes(userId) ? "Following" : "Follow"}
        </Button>

        <Button
          w={"100%"}
          mt={"md"}
          variant="outline"
          onClick={() => fetchRoomFromDorm(userId, false, null)}
        >
          Message
        </Button>

       {vipChatData?.status===1 &&
       <Button
       w={"100%"}
       mt={"md"}
       variant="outline"
      style={{backgroundColor:'#180177', color:'#fff'}}
       onClick={() => openVipChat()}
     >
       VIP Chat
     </Button>
       
       } 

      </Flex>

      <ProfileEquityStats
        stats={[
          { label: "Total Units", value: userQuery.data?.shares },

          { label: "INR Locked", value: userQuery.data?.INRLocked || 0 },
        ]}
      />

      <Container p={"0px 20px"}>
        <SimpleGrid
          cols={3}
          spacing={0}
          w={"100%"}
          mt={"sm"}
          sx={(theme) => ({
            borderStyle: "solid",
            borderWidth: 1,
            borderColor: "#DADADA",
            borderRadius: 20,
            background: theme.colors.indigo[6],
            overflow: "hidden",
            color: "white",
          })}
        >
          <Status
            label="Followers"
            value={userQuery.data?.followersIDs?.length || 0}
            className={classes.statusLeft}
            onClick={() =>
              history.push(
                `/app/follower-following/${userQuery.data.username}?type=followers`
              )
            }
          />

          <Status
            label="Following"
            value={userQuery.data?.followingIDs?.length || 0}
            className={classes.statusSquare}
            onClick={() =>
              history.push(
                `/app/follower-following/${userQuery.data.username}?type=following`
              )
            }
          />
          <Status
            label="Posts"
            // value={fetchPostQry.data?.length || 0}
            value={userQuery.data?.posts ?? 0}
            className={classes.statusRight}
            active
          />
        </SimpleGrid>
      </Container>

      {userQuery.data && (
        <InfiniteScrollComponent
          queryKey={["feeds", userQuery.data.username]}
          queryFn={(page) => fetchPosts(userQuery.data.username, page)}
          cols={3}
          virtual={false}
          withPullToRefresh={false}
        >
          {(post, { index }, { data }) => (
            <Box
              sx={(theme) => ({
                borderRadius: theme.radius.sm,
                overflow: "hidden",
                aspectRatio: "1/1",
              })}
              onClick={() => {
                history.push(
                  `/app/feed/${userQuery.data.username}?post=${index}`,
                  { data: data }
                );
              }}
            >
              {(post.mimetype ?? "image/*").split("/")[0] === "video" ? (
                <video
                  key={post.path}
                  // onClick={() => setPostData(post)}
                  width={"100%"}
                  style={{ aspectRatio: "1/1", objectFit: "cover" }}
                  autoPlay
                  muted
                  loop
                  src={post.path}
                />
              ) : (
                <Image
                  key={post.path}
                  // onClick={() => setPostData(post)}
                  width={"100%"}
                  sx={{ objectFit: "cover", aspectRatio: "1/1" }}
                  styles={{ image: { aspectRatio: "1/1" } }}
                  src={post.path}
                  alt="Random image"
                />
              )}
            </Box>
          )}
        </InfiniteScrollComponent>
      )}

      <div style={{ marginBottom: 63 }} />

      {userQuery.data && user.id !== userId && (
        <BuySellModal
          userData={userQuery.data ?? []}
          CharHOC={CharHOC}
          onSuccess={() => {
            userQuery.refetch();
            queryClient.invalidateQueries(["holdings"]);
          }}
        />
      )}
    </AppShell>
  );
}
