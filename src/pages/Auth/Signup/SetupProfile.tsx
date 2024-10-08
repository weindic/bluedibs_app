import {
  ActionIcon,
  Avatar,
  Box,
  Button,
  Flex,
  Group,
  LoadingOverlay,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm, zodResolver } from "@mantine/form";
import { IconCamera } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router";
import AppShell from "../../../components/AppShell";
import { HeaderComponent } from "../../../components/Header";
import { config } from "../../../config";
import { useAppSelector } from "../../../store/hooks";
import { updateUser } from "../../../store/slice/userSlice";
import { updateProfile, verfyRefferalCode } from "../../Profile/profile.api";
import { updateProfileSchema } from "../../Profile/profile.schema";
import './otp-form.css';
import { useLocalStorage } from "@mantine/hooks";
import { IonCol, IonGrid, IonLoading, IonRow } from "@ionic/react";
import { sendNotificationApi } from "../../Notification/notification.api";
import { uploadFileToFirebase } from "../../Chats/chat.service";
import { showNotification } from "@mantine/notifications";
import { checkUserNameValid } from "../auth.api";
type Props =
  | {
      mode?: "setup";
    }
  | {
      mode: "update";
      close: () => void;
    };


function SetupProfile(props: Props) {

  const [skipRefs, setSkipRef] = useState(false)

  const [refCode, setRefCode] = useState('')

  const [loaderOn, setLoaderOn] = useState(false)

  const user = useAppSelector((state) => state.user);
  const [username, setUsername] = useState(user.username)
  const [newUsername, setNewUername] =  useState(user.username);
  const dispatch = useDispatch();
  const history = useHistory();

  const userLoc:any = localStorage.getItem('user');
  let usrDt = JSON.parse(userLoc)?.user;

  
  const userLoc2:any = localStorage.getItem('bluedibs:user');
  let usrDt2 = JSON.parse(userLoc2);
  const location = useLocation();
  const { emailData }:any = location.state || {};



 
 
  const [isLoading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [avatar, setAvatar] = useState<File | string | null>(

    user.avatarPath
      ? user.avatarPath?.startsWith("blob:")
        ? user.avatarPath
        : `${config.STATIC_FILE_BASE_URL}${user.avatarPath}?alt=media`
      : null
  );


  const [fileUrl, setFileUrl] = useState('')

  // const uploadToFirebase = async (file:File) =>{



  //   const url:any =  await uploadFileToFirebase(file);

  //   console.log('url',url)

  //   setFileUrl(url)

  // }



  useEffect(()=>{
    setNewUername(username)
    editForm.setFieldValue('username', username);
    
    //   return updateProfile(vals as any);
    // }

  },[username])

  useEffect(()=>{

    console.log('jhhj',emailData)

    setAvatar(emailData?.photoUrl)
    setFileUrl(emailData?.photoUrl)
    
    //   return updateProfile(vals as any);
    // }

  },[emailData])



  
  useEffect(()=>{

if(user?.email){

  if(user?.avatarPath!=='' && user?.avatarPath){
    setFileUrl(user?.avatarPath)
    setAvatar(user?.avatarPath)
  }


  if(usrDt2?.mobile!==null && usrDt2?.mobile){
    setSkipRef(true)
  }
  else{
    setSkipRef(false)
  }

}
else{
  history.replace("/auth/login");
}
   
  },[])
  


  const onRefChange = (e:any) =>{

     
        setRefCode(e.target.value.toLocaleUpperCase())
   
  }


  // const fetchUser = async () => {
  //   try {
  //     const response = await fetch(`https://server.bluedibs.com/users/${firebaseId}`);
  //     if (!response.ok) {
  //       throw new Error('Failed to fetch user');
  //     }
  //     const userData = await response.json();
  //     setUser(userData);
  //     setError(null);
  //   } catch (error) {
  //     setError(error.message);
  //     setUser(null);
  //   }
  // };




  const verifyRefralCode = () =>{
    const userDetails:any = localStorage.getItem('user');
    let usrDta = JSON.parse(userDetails);


    

    let firebaseID = '';

    if(usrDta.firebaseId!=='' && usrDta.firebaseId!==undefined){
      firebaseID = usrDta.firebaseId;
    }
    else{
      firebaseID = usrDta.data.user.firebaseId;
    }
    console.log(usrDta.firebaseId!=='' && usrDta.firebaseId!==undefined, firebaseID)
    

    setLoading(true)

    if(refCode?.length==6){
      const data = {
        
        "receiverId": firebaseID,
        "referralCode": refCode
      }


      return verfyRefferalCode(data as any).then(res=>{

        setLoading(false)
        console.log(res)
          if(res.data.status==200){

          
            alert('Refferal Code Verfied. Congratulations you have got INR. 250 in your refferal wallet.')
          

            let message = `INR 250 Refferal balance credited to your refferal wallet.`;

            sendNotificationApi('657b14c8e1040ebf6d05e6d9', usrDt?.uid, '657b14c8e1040ebf6d05e6d9', message, 'refferal')


            let message2 = `${refCode.toLocaleUpperCase()} code is claimed. INR 50 credited to your refferal wallet.`;

            sendNotificationApi('657b14c8e1040ebf6d05e6d9', res.data.senderId, '657b14c8e1040ebf6d05e6d9', message2, 'refferal')

            setSkipRef(true)
          } 
          else{
            
            alert(res.data.message)
          }

      }, error=>{
        setLoading(false)
      })

    }


  }








  const editForm = useForm<Zod.infer<typeof updateProfileSchema>>({
    validate: zodResolver(updateProfileSchema),

    initialValues: {
      dob: user?.dob ? new Date(user?.dob) : (undefined as any),
      mobile: emailData?.phoneNumber!==null &&  emailData?.phoneNumber!==undefined? String(emailData?.phoneNumber) : (user.mobile ? String(user.mobile) : '0'),
      gender: user.gender as any,
      id:(emailData?.uid && emailData?.uid!==null)? emailData?.uid :usrDt?.uid,
      avatar:fileUrl,
      username:username
      
      // refralCode:refralCode
    
    },
  });








  const updateProfMut =  useMutation({
     mutationFn: (vals: Record<string, any> ) => {
    
      vals.avatar = fileUrl;

      if(!vals.id || vals.id==='' || vals.id===undefined ){
        let usrDt:any = localStorage.getItem('user');

        let user = JSON.parse(usrDt);
        vals.id = !user?.firebaseId ? user?.data?.user?.firebaseId: user?.firebaseId;
        console.log('vals_user',vals.id)

        if(vals.id===undefined){
          vals.id = user?.uid;
        }
        
      }

     



      console.log('vals', vals)

       

      return updateProfile(vals as any).then(async res=>{

        if(res.status === 200){

          let datamn =res.data.data.data;

          await  localStorage.setItem('bluedibs:user',JSON.stringify(datamn));

          

          console.log('datamn',datamn)

         

          showNotification({
            message: "Profile updated successfully",
            color: "green",
          });

         
          if(datamn?.shares===0 || datamn?.shares==='' || datamn?.shares===null){
            history.replace("/auth/dilute-shares");
          }
           
          

        }
        else{
          showNotification({
            message: "Failed to update profile. Try again letter.",
            color: "red",
          });
        }

      }, error=>{
        showNotification({
          message: "Failed to update profile. Try again letter.",
          color: "red",
        });
      })
    },

    
    onSuccess(_, vars) {

     
    
      
      dispatch(
        updateUser({
          ...editForm.values,
          avatarPath: avatar ? URL?.createObjectURL(avatar as File) : "",
          dob: dayjs(editForm.values.dob).format("DD-MM-YYYY"),
        })
      );



    
    },
  });


  const [userMessage, setUserMessage] = useState({message:'', status:false, view:false})

  const checkUserName = async (e) => {
    const value = e.target.value;
    const lowerCaseAndNumbers = /^[a-z0-9]+$/; // Regular expression for lowercase letters and numbers only
  
    // Set the username state
    setUsername(value);

    console.log(value)
  
    // Check if the input contains only lowercase letters and numbers, and is at least 4 characters long
    if (value.length >=3 && lowerCaseAndNumbers.test(value)) {
      try {
        // Call the API to check if the username is valid
        const res = await checkUserNameValid({ username: value, email: user.email });
  
        // Set the user message based on the response
        setUserMessage({ message: res.message, status: res.status, view: true });
      } catch (error) {
        // Handle any errors that occur during the API call
        alert('Something went wrong! Please try again later.');
      }
    } else {
      // If the input is invalid, show an error message
      setUserMessage({
        message: 'Only lowercase letters and numbers are allowed, and the username must be at least 3 characters long.',
        status: false,
        view: true,
      });
    }
  };
  


  const formRef = useRef<HTMLFormElement>(null);

  return (
    <AppShell
      isModal={props.mode === "update"}
      header={
        props.mode === "update" ? (
         <>
  
             <HeaderComponent
            title="Edit Profile"
            back={() => props.close?.()}
            
            rightSection={
              <Button
              disabled={!userMessage.status && userMessage.view==true}
                size="xs"
                onClick={() => {
                  formRef.current?.requestSubmit();
                  // updateProfMut.mutate(editForm.values);
                }}
                loading={updateProfMut.isLoading}
              >
                Save
              </Button>
            }
          />
          </>
         
       
         
        ) : (    <HeaderComponent title={skipRefs!=true? 'Refferal Code ':'Setup Profile'} withBackButton={false} />        
        )
      }
    >

<IonLoading
        isOpen={showLoading}
        message={'Please wait...'}
        duration={5000} // Optional: Auto hide after 5 seconds
      />

      <Box
        component="form"
        sx={{ position: "relative" }}
        pb="md"
        onSubmit={editForm.onSubmit((vals) => {
          const age = dayjs().diff(dayjs(vals.dob), "years");

          if (age < 18) {
            return editForm.setErrors({
              dob: "You must be atleast 18 year old to use this app.",
            });
          }

          updateProfMut.mutate(vals);
        })}
        ref={formRef}
      >
        <LoadingOverlay visible={updateProfMut.isLoading} />

        <LoadingOverlay visible={loaderOn} />

        {skipRefs!=true && !usrDt2?.mobile &&
<>
<div style={{padding:20}}>

  <img src="https://res.cloudinary.com/dzmexswgf/image/upload/v1716211338/invite_asvjff.avif" style={{width:'100%'}}/>

<p style={{margin:'20px 0', fontSize:12}}>If you have any refferal Code. Kindly verify here and get INR. 250 signup bonus. </p>

<IonGrid>
  <IonRow>
    <IonCol size="7">
    <TextInput
 label="Refferal Code"
 maxLength={6}
 w={"100%"}
 onChange={(e)=>onRefChange(e)}
 value={refCode}
 // value={user?.refralCode}
/>


    </IonCol>
    <IonCol size="5">
    <Button disabled={refCode?.length !=6? true: false} radius={50} onClick={()=>verifyRefralCode()} style={{background:'#0b78ff', marginTop:20, color:'#fff !important'}}   size="md" type="button" fullWidth >Verify</Button>
    </IonCol>
  </IonRow>
</IonGrid>


</div>

</>

}

{skipRefs==true && <>
  <Flex
          sx={{
            background: "#0b1b32",
            width: "100%",
          }}
          justify={"center"}
          py={50}
        >

          



          <Box sx={{ position: "relative", width: "min-content" }}>
            <Avatar
              src={
                avatar instanceof File ? URL.createObjectURL(avatar) : avatar
              }
              size={125}
              radius={999}
              ml={"auto"}
              mr={"auto"}
              alt="it's me"
            />

            

            <ActionIcon
              variant="filled"
              style={{
                marginTop: 15,
                marginLeft: "auto",
                marginRight: "auto",
                position: "absolute",
                bottom: -5,
                right: -5,
                borderRadius:'50%',
              }}
              color="indigo"
              onClick={() => {
                const fileInput = document.createElement("input");
                fileInput.type = "file";
                fileInput.accept = config.SUPPORTED_IMAGE_FORMATS;
                fileInput.onchange = async (_) => {
                  setLoaderOn(true)
                  if (fileInput.files) {
                    const [file] = Array.from(fileInput.files);
                   
                  
                    const url:any =  await uploadFileToFirebase(file);

                    if(url!==''){
                      setLoaderOn(false)
                      console.log('url',url)
                      setAvatar(file);
                      setFileUrl(url)
                    }

                  
                  }
                };
                fileInput.click();
              }}
            >
              <IconCamera size={18} />
            </ActionIcon>
          </Box>

        </Flex>

        <Stack p="md" align="center" style={{marginBottom:80}}>

       

<TextInput
  label="Username"
  onChange={(e)=>checkUserName(e)}
  w={"100%"}
  value={username}
/>
{userMessage.view===true &&
  <small style={{color:userMessage.status===true ? 'green': 'red'}}>{userMessage.message}</small>
}


<TextInput label="Email" disabled w={"100%"} value={user?.email} />

<TextInput
  label="Phone"

  placeholder="eg: 9123093231"
  w={"100%"}
  {...editForm.getInputProps("mobile")}
/>

<Select
  label="Gender"
  data={[
    {
      label: "Male",
      value: "MALE",
    },
    {
      label: "Female",
      value: "FEMALE",
    },

    {
      label: "Rather Not Say",
      value: "OTHER",
    },
  ]}
  w={"100%"}
  {...editForm.getInputProps("gender")}
/>

<DatePickerInput
  label="Date Of Birth"
  w={"100%"}
  maxDate={new Date()}
  {...editForm.getInputProps("dob")}
/>

<Textarea
  label="Bio"
  placeholder="Type something here"
  maxLength={120}
  defaultValue={user.bio}
  w={"100%"}
  {...editForm.getInputProps("bio")}
/>
</Stack>

{props.mode !== "update"  && (
          <Group position="center" mt="md" style={{padding:15, position:'fixed', bottom:0, left:0, right:0, margin:'0 auto', background:'#fff'}}>
            <Button disabled={!userMessage.status && userMessage.view==true}     radius={50} style={{background:'#0b78ff'}}   size="md" type="submit" fullWidth   >
              Save & continue
            </Button>
          </Group>
        )}

</>}

{skipRefs!=true && !usrDt2?.mobile && <>

<div style={{padding:20}}>
<Button  radius={50} onClick={()=>setSkipRef(true)} style={{background:'#c5c5c5', color:'#000', marginTop:20}}   size="md" type="button" fullWidth >Skip</Button>
   
</div>
  
</>


   
}

    

      

 
      </Box>


    </AppShell>
  );
}

export default SetupProfile;
