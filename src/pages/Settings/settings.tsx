import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { IonCard, IonCol, IonGrid, IonIcon, IonItem, IonList, IonLoading, IonModal, IonRow } from "@ionic/react";
import {
  ActionIcon,
  Group,
  LoadingOverlay,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import { IconChevronRight } from "@tabler/icons-react";
import { useState } from "react";
import { useHistory } from "react-router";
import AppShell from "../../components/AppShell";
import { useAppDispatch } from "../../store/hooks";
import { clearLocalstorage } from "../../utils/localstorage";
import HelpSupport from "./HelpSupport";
import PaymentDetails from "./PaymentDetails";
import PersonalInformation from "./PersonalInformation";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsAndConditions from "./TermsAndConditions";
import { queryClient } from "../../utils/queryClient";
import { IonButton, IonAlert } from '@ionic/react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/react';

import './setting.css';
import { cardOutline, checkboxOutline, checkmark, documentAttach, documentLockOutline, documentTextOutline, helpCircleOutline, logOutOutline, personCircle, personOutline, trashBinOutline } from "ionicons/icons";
import { createRefralCode, deleteUserAccount } from "./settings.api";
import CompleteKyc from "./completeKyc";
import { showNotification } from "@mantine/notifications";
type Props = {};

const PAGES = {
  
  "Personal Information": PersonalInformation,
  "Complete KYC": CompleteKyc,
  "Payment Information": PaymentDetails,
  "Help & Support": HelpSupport,
  "Privacy Policy": PrivacyPolicy,
  "Terms & Conditions": TermsAndConditions,
};

export default function Settings({}: Props) {
  const [selectedPage, setSelectedPage] = useState<null | keyof typeof PAGES>(
    null
  );


  
  const [isLoading, setLoading] = useState(false);
  const dispatch = useAppDispatch();

  const Page = selectedPage && PAGES[selectedPage];

  const history = useHistory();

  const theme = useMantineTheme();



  const [showConfirmAlert, setShowConfirmAlert] = useState(false);

  // Handler for the confirm action
  const handleConfirm = async() => {
    // Add the action you want to take upon confirmation here
    queryClient.clear();
    clearLocalstorage();
    await FirebaseAuthentication.signOut().catch((err) => err);
    history.replace("/auth/login");
    setShowConfirmAlert(false);
  };

  // Handler for the cancel action
  const handleCancel = () => {
    console.log('Cancelled');
    setShowConfirmAlert(false);
  };



  const [showAlert, setShowAlert] = useState(false);
  const [reason, setReason] = useState('');




  const [showLoading, setShowLoading] = useState(false);

  const generateShareLink = (refCode:any) => {

    const message = `Hey there! 👋\n\nI'm excited to share *BluDibs* with you, a fantastic platform for discovering and booking amazing experiences!\n\nUse my referral code: *${refCode.toLocaleUpperCase()}* to get started and enjoy special benefits.\n\nVisit https://play.google.com/store/apps/details?id=io.bluedibs.com to sign up and explore the possibilities!\n\nHappy exploring! 🌟`;
    const imageUrl = 'https://res.cloudinary.com/dzmexswgf/image/upload/v1716211338/invite_asvjff.avif'; // Replace with the actual URL of your image
  
    const encodedMessage = encodeURIComponent(message);
    const encodedImageUrl = encodeURIComponent(imageUrl);
  
    const shareLink = `whatsapp://send?text=${encodedMessage}&image=${encodedImageUrl}`;
  
    return shareLink;
  };
  
  
  const [loading, setLoader] = useState(false)

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

    setShowLoading(true); // Show loader

    createRefralCode(refData).then(async(res) => {
      const link = await generateShareLink(refCode);


      window.open(link);

      setShowLoading(false); // Hide loader

      console.log(res);
    }).catch((error) => {
      setShowLoading(false); // Hide loader in case of error
      console.error(error);
    });
  };



  const confirmDelete = async() => {
    setLoader(true)
    setShowAlert(false);
    const usr: any = localStorage.getItem('bluedibs:user');
    const user = JSON.parse(usr);

    if(reason!==''){

      await deleteUserAccount({id:user.id, reason:reason}).then((res)=>{

        if(res.data.status==true){
          showNotification({
            message: res.data.message || "something went wrong",
            color: "green",
          });
        }
        else{
          showNotification({
            message: res.data.message || "something went wrong",
            color: "red",
          });
        }
        setLoader(false);

        setShowAlert(false);
      }, error=>{
        setLoader(false);
        showNotification({
          message: error.message || "something went wrong",
          color: "red",
        });
      })
     
    }
    else{
      await deleteUserAccount({id:user.id, reason:'No reason provided.'}).then((res)=>{

        if(res.data.status==true){
          showNotification({
            message: res.data.message || "something went wrong",
            color: "green",
          });
        }
        else{
          showNotification({
            message: res.data.message || "something went wrong",
            color: "red",
          });
        }

        setLoader(false);
        setShowAlert(false);
      }, error=>{
        setLoader(false);
        showNotification({
          message: error.message || "something went wrong",
          color: "red",
        });
      })
    }

  
  };

  const deleteCancel = () => {
    console.log('Account deletion cancelled');
    setShowAlert(false);
  };

  return (
    <AppShell
      header={
        <Title order={3} fz={20} weight={600}>
          Settings
        </Title>
      }
    >
        <LoadingOverlay
        visible={loading}
       
      />
      
      <IonModal
        isOpen={!!selectedPage}
        onWillDismiss={() => {
          setSelectedPage(null);
        }}
      >


<div>
  
      {/* <button onClick={inviteLink}>Invite</button> */}
      <IonLoading
        isOpen={showLoading}
        message={'Creating Invite Link...'}
        duration={5000} // Optional: Auto hide after 5 seconds
      />
    </div>



        <AppShell
          isModal
          header={
            <Group spacing="sm">
              <ActionIcon onClick={() => setSelectedPage(null)} variant="light">
                <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
              </ActionIcon>

              <Title order={3} fz={20} weight={600}>
                {selectedPage}
              </Title>
            </Group>
          }
        >
          {Page && (
            <Page
              setLoading={setLoading}
              isLoading={isLoading}
              closePage={() => setSelectedPage(null)}
            />
          )}
        </AppShell>
      </IonModal>

      <div className="invCard">
        <p style={{padding:'0 20', textAlign:'center', fontSize:15}}>Earn upto Rs. 50. By inviting your friends.</p>
          <IonCard mode="ios" className="invcard">
            <IonGrid>
              <IonRow>
                <IonCol>
                  <img src="/invite.jpg"/>

                  <IonButton mode="ios" size="small" shape="round" expand="full" onClick={inviteLink}   style={{marginTop:10}}>Invite Friends</IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCard>
      </div>
      <IonCard mode="ios" >
      <Stack p="md">
        <IonList>
         
       
          {Object.keys(PAGES).map((btnText) => (
            <IonItem
              onClick={() => setSelectedPage(btnText as any)}
              lines="full"
            >

               {btnText=='Personal Information' && <IonIcon  color="primary" size="small" icon={personOutline} />}

               {btnText=='Complete KYC' && <IonIcon  color="primary" size="small" icon={personCircle} />}
               {btnText=='Payment Information' && <IonIcon  color="primary" size="small" icon={cardOutline} />}
               {btnText=='Help & Support' && <IonIcon  color="primary" size="small" icon={helpCircleOutline} />}
               {btnText=='Privacy Policy' && <IonIcon  color="primary" size="small" icon={documentLockOutline} />}
               {btnText=='Terms & Conditions' && <IonIcon  color="primary" size="small" icon={documentTextOutline} />}

               
              <Group position="apart" w="100%" style={{paddingLeft:10}}>
                <Text>{btnText}</Text>

                <IconChevronRight color={theme.colors.gray[6]} size={19} />
              </Group>
            </IonItem>
          ))}



<IonAlert
  isOpen={showAlert}
  onDidDismiss={() => setShowAlert(false)}
  header={'Delete My Account'}
  inputs={[
    {
      name: 'reason',
      type: 'text',
      placeholder: 'Enter Reason To Delete.',
      value: reason,
    }
  ]}
  buttons={[
    {
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'secondary',
      handler: deleteCancel
    },
    {
      text: 'Confirm',
      handler: confirmDelete
    }
  ]}
  onIonInput={(e: any) => setReason(e.detail.value!)}
/>


           <IonItem
            lines="none"
            onClick={() => setShowAlert(true)}
         
          >
            <IonIcon  color="primary" size="small" icon={trashBinOutline} style={{marginRight:10}} />

            Delete My Account
          </IonItem>


          <IonItem
            lines="none"
            onClick={() => setShowConfirmAlert(true)}
         
          >
            <IonIcon  color="primary" size="small" icon={logOutOutline} style={{marginRight:10}} />

            Logout
          </IonItem>

          <IonAlert
          mode="md"
        isOpen={showConfirmAlert}
        onDidDismiss={() => setShowConfirmAlert(false)}
        header={'Logout'}
        message={'Are you sure you want to logout?'}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            handler: handleCancel,
          },
          {
            text: 'Logout',
            handler: handleConfirm,
          },
        ]}
      />
        </IonList>
      </Stack>
      </IonCard>
    </AppShell>
  );
}
