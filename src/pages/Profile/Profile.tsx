import {
  ActionIcon,
  Avatar,
  Box,
  Container,
  Flex,
  Group,
  Image,
  SimpleGrid,
  Text,
  Title,
  createStyles,
  useMantineTheme,
} from "@mantine/core";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import { IconSettings } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import AppShell from "../../components/AppShell";
import InfiniteScrollComponent from "../../components/InfiniteScrollComponent";
import { ProfileEquityStats } from "../../components/Profile/ProfileEquityStats";
import { config } from "../../config";
import { useAppSelector } from "../../store/hooks";
import { getFormattedSmallPrice } from "../../utils";
import { imgUrl } from "../../utils/media";
import { EditProfileModal } from "./EditProfile";
import { fetchPosts } from "./profile.api";
import { Chart, MinChart } from "../../components/Chart";
import { Share } from "@capacitor/share";
import './profile.css';

import { IonAlert, IonButton, IonContent, IonFooter, IonHeader, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonTitle, IonToggle, IonToolbar } from '@ionic/react';
import { checkmarkCircleOutline } from "ionicons/icons";
import { createRefralCode } from "../Settings/settings.api";

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

export const Status = ({
  label,
  value,
  className,
  active = false,
  onClick,
}: {
  label: string;
  value: number;
  className: any;
  active?: boolean;
  onClick?: () => void;
}) => {
  const theme = useMantineTheme();

  return (
    <Flex
      wrap={"wrap"}
      direction={"column"}
      justify={"center"}
      className={className}
      sx={{
        padding: "15px 0px",
        background: active ? theme.colors.indigo[9] : "transparent",
        position: "relative",
      }}
      onClick={onClick}
    >
      <Text
        weight={700}
        size="xl"
        mb={5}
        align="center"
        style={{ lineHeight: 0.5 }}
      >
        {Math.max(0, value)}
      </Text>

      <Text
        pt={"xs"}
        weight={400}
        size={"sm"}
        align="center"
        style={{ lineHeight: 0.5 }}
      >
        {label}
      </Text>

      {active && (
        <Box
          sx={{
            background: "white",
            width: "50%",
            height: 5,
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "5px 5px 0 0",
            opacity: 0.5,
          }}
        />
      )}
    </Flex>
  );
};





export function Profile() {

  const modal = useRef<HTMLIonModalElement>(null);
  const { classes } = useStyles();
  const history = useHistory();
  const user:any = useAppSelector((state) => state.user);

  const [postData, setPostData] = useState<null | any>(null);
  const [editMdlOpn, setEdtMdlOpn] = useState(false);
  const [chtData, setCtData] =useState(null);
  const [userID, setUserID] = useState('');
 

  const queryFn = useCallback(
    (page: number) => fetchPosts(user.username, page),
    [user]
  );

  const chartsData = (user?.graphData ?? [])?.map((item: any, i: number) => ({
    x: i,
    y: item.price,
  }));




  useEffect(() => {

    console.log('user', user)

    let locUser:any = localStorage.getItem('bluedibs:user');
    let lcU = JSON.parse(locUser);

    let usr:any =  localStorage.getItem('user')
    let jsData = JSON.parse(usr)?.user;

    // Fetch chat data when component mounts or userId changes
    let userId = jsData?.uid

    setUserID(lcU?.id)
    if (userId) {
      getSingleDataByUser(userId);
    }
  }, []); // Dependency array ensures useEffect runs when userId changes



  const getSingleDataByUser = async (userId:any) => {
    try {
      const response = await fetch('http://localhost:5000/bludibs/v2/api/vip/getSingleDataByUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId:userId })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setCtData(data)
    } catch (error) {
      console.error('Error fetching chat data:', error);
    }
  };


 







  useEffect(()=>{


    checkPopular(userID)
    console.log(userID)

  }, [])



  const [isPopular, setPopular] = useState(false)

  const checkPopular = async(userId:any) =>{
    try {
      const response = await fetch('http://localhost:3000/popular-profile/status/'+userId, {
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




  const [isOpen, setIsOpen] = useState(false);

  const openBottomSheet = () => {
    setIsOpen(true);
  };

  const closeBottomSheet = () => {
    setIsOpen(false);
  };





  const [audio, setAudio] = useState('');
  const [video, setVideo] = useState('');
  const [text, setText] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleSubmit = async () => {
    try {
  
      if (!userID) {
        throw new Error('User data not found in localStorage');
      }

      if (enabled) {
        // Enable VIP chat
        const chatData = {
        userId:userID,
          audio,
          video,
          text
        };

        const response = await fetch(`http://localhost:3000/vip-chat/enable`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(chatData)
        });


      
        console.log('VIP chat enabled', response);
        setAlertMessage(`Your VIP chat is now ${enabled ? 'enabled' : 'disabled'}.`);
        setShowAlert(true);
        if (modal.current) {
          modal.current.dismiss();
        }


      } else {
        // Disable VIP chat
        const response = await fetch(`http://localhost:3000/vip-chat/disable`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to disable VIP chat');
        }

        

     
        console.log('VIP chat disabled');
        setAlertMessage(`Your VIP chat is now ${enabled ? 'enabled' : 'disabled'}.`);
        setShowAlert(true);
        if (modal.current) {
          modal.current.dismiss();
        }
      }

        setAlertMessage(`Your VIP chat is now ${enabled ? 'enabled' : 'disabled'}.`);
      setShowAlert(true);
      if (modal.current) {
        modal.current.dismiss();
      }
      
    } catch (error) {
      alert('Error updating VIP chat status')
      console.error('Error updating VIP chat status:', error);
    }
  };




  const [vipChatData, setVipChatData] = useState(null);

  const getUserVipChat = async (userId:any) => {
    try {
      const response = await fetch(`http://localhost:3000/vip-chat/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch VIP chat data');
      }
      const data = await response.json();

      setVideo(data.video)
      setAudio(data.audio)
      setText(data.text)
      setEnabled(data.status===1?true:false)

      setVipChatData(data);
    } catch (error) {
      console.error('Error fetching VIP chat data:', error);
    }
  };

  useEffect(() => {
    if (userID) {
      getUserVipChat(userID);
    }
  }, [userID]);



  

  

  const generateShareLink = (refCode:any) => {

    const message = `Hey there! 👋\n\nI'm excited to share *BluDibs* with you, a fantastic platform for discovering and booking amazing experiences!\n\nUse my referral code: *${refCode.toLocaleUpperCase()}* to get started and enjoy special benefits.\n\nVisit https://play.google.com/store/apps/details?id=io.bluedibs.com to sign up and explore the possibilities!\n\nHappy exploring! 🌟`;
    const imageUrl = 'https://res.cloudinary.com/dzmexswgf/image/upload/v1716211338/invite_asvjff.avif'; // Replace with the actual URL of your image
  

  
    Share.share({
      title: "Join Blue Dibs Now!",
      text:message,
      url: "https://play.google.com/store/apps/details?id=io.bluedibs.com",
      dialogTitle: "BlueDibs",
      files: [imageUrl]
    });
  };


  const inviteLink = async () => {
    const generateReferralCode = () => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
      }
      return result;
    };

    const usr: any = localStorage.getItem('bluedibs:user');
    const user = JSON.parse(usr);

    const refCode = generateReferralCode();

    const refData = {
      referralCode: refCode.toLocaleUpperCase(),
      senderId: user.id,
      receiverId: 'null',
      status: 1,
    };

  

    createRefralCode(refData).then(async(res) => {
      generateShareLink(refCode);

    }).catch((error) => {
   
      console.error(error);
    });
  };


 
  return (
    <AppShell
      header={
        <Flex justify={"space-between"} style={{ alignItems: "center" }}>
          <Title order={3} fz={20} weight={600} mr={"auto"}>
            Profile
          </Title>

          <IonButton onClick={()=>modal.current?.present()}  size="small" fill="outline" mode="ios" > VIP Chat</IonButton>

         

          <ActionIcon size="lg" variant="light">
            <IconSettings onClick={() => history.push("/app/settings")} />
          </ActionIcon>
        </Flex>
      }

    >

<IonModal mode="ios" ref={modal}  initialBreakpoint={0.80} breakpoints={[0, 0.80, 0.50, 0.75]}>
  <IonContent className="ion-padding">
    <IonHeader>
      <IonToolbar>
        <IonTitle>VIP Chat Settings</IonTitle>
      </IonToolbar>
    </IonHeader>

    <p>Set your pricing for VIP chat and allow your followers to access premium chat.</p>

    <IonItem>
    
      <IonInput type="text" label="Audio Call Price - ₹" placeholder="0.00" value={audio} onIonChange={e => setAudio(e.detail.value!)}></IonInput>
    </IonItem>
    <IonItem>
   
      <IonInput type="text" label="Video Call Price - ₹" placeholder="0.00" value={video} onIonChange={e => setVideo(e.detail.value!)}></IonInput>
    </IonItem>
    <IonItem>
   
      <IonInput type="text" label="Text Call Price - ₹" placeholder="0.00" value={text} onIonChange={e => setText(e.detail.value!)}></IonInput>
    </IonItem>
    <IonItem>
      <IonLabel>Enable Or Disable VIP Chat</IonLabel>
      <IonToggle checked={enabled} onIonChange={e => setEnabled(e.detail.checked)} />
    </IonItem>

    <IonFooter style={{padding: 10}}>
      <IonButton shape="round" onClick={handleSubmit} expand="full">Save Settings</IonButton>
    </IonFooter>
  </IonContent>
</IonModal>


<IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={'VIP Chat Status'}
        message={alertMessage}
        buttons={['OK']}
      />








      {/* <IonAlert
        trigger="present-alert"
        header="Vip chat charges."
        
        subHeader={`Set Prcing for per minute. Ex:₹14 per minute`}
        buttons={[
          {
            
            text: 'Cancel', // Button text
            role: 'cancel', // Assigning 'cancel' role
            cssClass: 'dark', // Optional CSS class
            handler: () => {
              // Handler function for when the cancel button is clicked
              // You can add any logic you want here, such as closing the alert
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Enable VIP Chat', // Button text
            handler: (data) => {
              // Handler function for when the main button is clicked
              enableChat(data)
              console.log('Enable VIP Chat clicked', data);
              // You can add more logic here if needed
            }
          }
        ]}
        
        inputs={[
          { type: 'number',
            label:'Chat',
            name:'chat',
            placeholder: 'Text Chat Price',
          },
          {
            type: 'number',
            label:'Call',
            name:'audio',
            placeholder: 'Audio Call Price',
          },
          {
            type: 'number',
            label:'View',
            name:'video',
            placeholder: 'Video Call Price',
          },

        
          
        ]}

        
      >
        
      </IonAlert> */}





      <div style={{ height: "calc(100% - 57px)" }}>
        <Container p={"lg"} pb={0}>
          <EditProfileModal open={editMdlOpn} setModalOpen={setEdtMdlOpn} />

          <Flex direction={"column"} gap={"xs"} p={"sm"}>
            <Flex gap={"sm"}>
              <Box
                sx={{
                  position: "relative",
                  width: "max-content",
                  height: "100%",
                }}
              >
                <Avatar
                  src={
                    user.avatarPath
                      ? user.avatarPath.startsWith("blob:")
                        ? user.avatarPath
                        : user.avatarPath
                      : null
                  }
                  size="xl"
                  radius="lg"
                  style={{
                    width: 100,
                    height: 100,
                  }}
                  alt="it's me"
                />
                <ActionIcon
                  sx={{ position: "absolute", bottom: -5, right: -5 }}
                  variant="filled"
                  color="blue"
                  onClick={() => setEdtMdlOpn(true)}
                >
                  <EditRoundedIcon fontSize="small" />
                </ActionIcon>
              </Box>

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

            <div>
              <Title mb="xs" order={4} weight={500}>
                @{user.username} 

                {isPopular && <>
                  <span>  <img src="/tick.svg" style={{width:20, height:20}}/></span>
                  <small style={{display:'block', fontSize:10, color:'gray'}}>Populer Creator</small>
                </>

                 
                }
              </Title>

              <Flex justify={"space-between"} gap={"md"}>
                <Group spacing={5}>
                  <Text weight={500} size={"sm"}>
                    ₹{" "}
                    {user?.price
                      ?.toFixed(8)
                      .replace(/(\.[0-9]*[1-9])0+$|\.0*$/, "$1")}
                  </Text>

                  <Text
                    component="span"
                    sx={{ wordBreak: "keep-all" }}
                    weight={400}
                    size={"sm"}
                  >
                    EQ {user?.userEquity?.toFixed(2)}%
                  </Text>
                </Group>

                <Text
                  size={"xs"}
                  sx={(theme) => ({
                    background: theme.colors.violet[3],
                    padding: "2px 6px",
                    borderRadius: theme.radius.md,
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    cursor: "pointer",
                  })}
                  ff="Nunito Sans"
                  onClick={() =>inviteLink()}
                >
                  Invite people to buy your profile units.
                </Text>
              </Flex>
            </div>

            <Box>
              <Text weight={600}>About Me</Text>
              <Text
                sx={(theme) => ({ color: theme.colors.gray[7] })}
                size={"sm"}
                ff="Nunito Sans"
              >
                {user.bio}
              </Text>
            </Box>
          </Flex>
        </Container>

        <Box my="sm">
          <ProfileEquityStats
            stats={[
              { label: "Total Units", value: user.shares },

              {
                label: "INR Locked",
                value: getFormattedSmallPrice(user.INRLocked ?? 0),
              },
            ]}
          />
        </Box>

        <Container p={"0px 20px"}>
          <SimpleGrid
            cols={3}
            spacing={0}
            w={"100%"}
            my={"sm"}
            sx={(theme) => ({
              borderStyle: "solid",
              borderWidth: 1,
              borderColor: "#DADADA",
              borderRadius: 15,
              background: theme.colors.indigo[6],
              overflow: "hidden",
              color: "white",
            })}
          >
            <Status
              label="Followers"
              value={user.followersIDs?.length || 0}
              className={classes.statusLeft}
              onClick={() =>
                history.push(
                  `/app/follower-following/${user.username}?type=followers`
                )
              }
            />
            <Status
              label="Following"
              value={user.followingIDs?.length || 0}
              className={classes.statusSquare}
              onClick={() =>
                history.push(
                  `/app/follower-following/${user.username}?type=following`
                )
              }
            />
            <Status
              label="Posts"
              // value={fetchPostQry.data.length || 0}
              value={user.posts}
              className={classes.statusRight}
              active
            />
          </SimpleGrid>
        </Container>

        <InfiniteScrollComponent
          queryKey={["feeds", user.username]}
          queryFn={queryFn}
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
                history.push(`/app/feed/${user.username}?post=${index}`, {
                  data,
                });
              }}
            >
              {(post.mimetype ?? "image/*").split("/")[0] === "video" ? (
                <video
                  key={post.path}
                  width={"100%"}
                  style={{
                    height: "100%",
                    objectFit: "cover",
                  }}
                  autoPlay
                  muted
                  loop
                  src={post.path}
                />
              ) : (
                <Image
                  key={post.path}
                  width={"100%"}
                  sx={{
                    objectFit: "cover",
                  }}
                  styles={{
                    image: { aspectRatio: "1/1" },
                  }}
                  src={post.path}
                  alt="Random image"
                />
              )}
            </Box>
          )}
        </InfiniteScrollComponent>
      </div>
    </AppShell>
  );
}
