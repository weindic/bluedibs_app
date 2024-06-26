import { IonRouterLink } from "@ionic/react";
import { Anchor, Button, Flex, Paper, PasswordInput, PinInput, Text, TextInput, Title } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { IconKey, IconUser } from "@tabler/icons-react";
import { FirebaseError } from "firebase/app";
import {
  browserLocalPersistence,
  sendPasswordResetEmail,
  setPersistence,
} from "firebase/auth";
import { useState } from "react";
import { useHistory } from "react-router";
import { z } from "zod";
import AppShell from "../../components/AppShell";
import { auth } from "../../utils/firebase";
import { InputWithIcon, WaveBgCard } from "./login";
import { forgotPasswordSchema, resetPassFormSchema } from "./schemas";
import { showNotification } from "@mantine/notifications";
import { sendPasswordResetOTPEmail, verifyForgottOtpAPI } from "./auth.api";
import { useMutation } from "@tanstack/react-query";


import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { app } from "../../utils/firebase";



export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const [error, setError] = useState("");
  const [otpFormStatus, setOTPFormStatus] = useState(false);
  const [isReset, setReset] = useState(false);
  const [emailDef, setEmailDef] = useState("");
  const auth = getAuth(app);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    validate: zodResolver(forgotPasswordSchema),
  });

  const resetPassForm = useForm<z.infer<typeof resetPassFormSchema>>({
    validate: zodResolver(resetPassFormSchema),
  });

  async function handleSubmit(vals: z.infer<typeof forgotPasswordSchema>) {
    setLoading(true)
    // await setPersistence(auth, browserLocalPersistence);
    setError("");

    try {
      // await sendPasswordResetEmail(auth, vals.email);

   
      sendOtpToEmail(vals.email)
   
      // history.push("/auth/login");
    } catch (err) {
      if (err instanceof FirebaseError) {
        if (err.code === "auth/user-not-found") {
          setError("User with this email does not exists");
        }
      }
    } 
  }


  const otpForm = useForm({
    initialValues: {
      otp: "",
      email:''
     
    },
  });



  const sendOtpToEmail = (email:any) =>{

    setLoading(true)
    sendPasswordResetOTPEmail({email:email}).then(res=>{

      if(res.status===true){
        showNotification({
          message: res.message,
        });

        setEmailDef(email)

        setOTPFormStatus(true)

        form.reset();
      }else{
        showNotification({
          message: res.message,
          color: "red",
          
        });
      }

      setLoading(false)

    }, error=>{
      setLoading(false)
    })
  }


  const verifyOTPandEmail = async(data:any) =>{
    setLoading(true)

    verifyForgottOtpAPI(data).then(async  (res)=>{

      if(res.status===true){

        showNotification({
          message: 'OTP verified reset password link has sent to  your email.',
          color:'green'
        });

       await sendPasswordResetEmail(auth, data.email);   
        setOTPFormStatus(false)
        setLoading(false)
        history.replace("/auth/login");
      }
      else{
        showNotification({
          message: res.message,
          color:'red'
        });

        setLoading(false)
      }

    }, error=>{
      showNotification({
        message: 'Something went wrong! Please try again letter.',
        color:'red'
      });
      setLoading(false)
    })


  }


  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const resetPasswordSubmit = async (vals: { password: string, confirmPassword:string }) => {


    
   
    try {

      if(vals.confirmPassword!==vals.password){

        return setConfirmPasswordError('Password does not matched.')

      }
      // Sign in the user with their email
      const userCredential = await signInWithEmailAndPassword(auth, emailDef, vals.password);
      const user = userCredential.user;
  
      // Update the password
      await updatePassword(user, vals.password);

      
  
      console.log('Password reset successful');
      // Optionally, show a notification to the user
    } catch (error) {
      console.error('Error resetting password:', error);
      // Optionally, handle different error cases
    }
  };







  

  return (
    <AppShell>
      <WaveBgCard />




{isReset &&  <>

  <Title align="center" order={2} weight={700} mr={"auto"}>
      Reset Password!
    </Title>

    <Text color="dimmed" size="sm" align="center" mt={5}>
      Remembered? Back to{" "}
      <Anchor component={IonRouterLink} routerLink={"/auth/login"}>
        Login
      </Anchor>
    </Text>


    <Paper
  p={30}
  m={20}
  mt={30}
  radius="md"
  component="form"
  onSubmit={resetPassForm.onSubmit((vals) => resetPasswordSubmit(vals))}
>
  <InputWithIcon
    Component={PasswordInput}
    label="Password"
    placeholder="Your password"
    mt="md"
    size="md"
    disabled={loading}
    icon={IconKey}
    {...resetPassForm.getInputProps("password")}
  />

<InputWithIcon
    Component={PasswordInput}
    label="Confirm Password"
    placeholder="Your password"
    mt="md"
    size="md"
    disabled={loading}
    icon={IconKey}
 
    {...resetPassForm.getInputProps("confirmPassword")}
  />
  
  {confirmPasswordError && (
    <Text mt={"sm"} color="red" size={"sm"}>
      {confirmPasswordError}
    </Text>
  )}

  {error && (
    <Text mt={"sm"} color="red" size={"sm"}>
      {error}
    </Text>
  )}

  <Button  radius={50} style={{background:'#2e3192'}}   size="md" type="submit" fullWidth mt="xl" loading={loading}>
    Save New Password
  </Button>
</Paper>

</>}
    

      {otpFormStatus===true? 
      
      <form
      onSubmit={otpForm.onSubmit((vals: any) => {
      verifyOTPandEmail({
        otp: vals.otp,
        email: emailDef as string,
      })
      })}
    >
      <Title mt={40} align="center" order={2} weight={700} mr={"auto"}>
        Verify OTP
      </Title>

      <Text color="dimmed" size="sm" align="center" mt={5}>
  A 4 Digit OTP has sent to your email : <b>{emailDef}</b>
      </Text>

      <Text color="dimmed" size="sm" align="center" mt={5}>
        Go Back to login?{" "}
        <Anchor
          onClick={async (e) => {
            history.replace("/auth/login");
            window.location.reload();
          }}
        >
          Login
        </Anchor>
      </Text>

      <Paper p={30} m={20} mt={30} radius="md">
        <Flex w="100%" justify={"center"}>
          <PinInput
            oneTimeCode
            type="number"
            required
            {...otpForm.getInputProps("otp")}
            value={otpForm.getInputProps("otp").value ?? ""}
          />
        </Flex>

        <Button
          fullWidth
          mt="xl"
          loading={loading}
          variant="white"
          type="button"
          onClick={() => {sendOtpToEmail(emailDef)}}
        >
          Request again
        </Button>

        <Button
       radius={50} style={{background:'#2e3192'}}   size="md" type="submit" fullWidth mt="xl"
         
          loading={loading}
        >
          Verify
        </Button>
      </Paper>
    </form>
      
      :

      <>
      
      
      <Title align="center" order={2} weight={700} mr={"auto"}>
      Forgot Password!
    </Title>

    <Text color="dimmed" size="sm" align="center" mt={5}>
      Remembered? Back to{" "}
      <Anchor component={IonRouterLink} routerLink={"/auth/login"}>
        Login
      </Anchor>
    </Text>

      
      <Paper
      p={30}
      m={20}
      mt={30}
      radius="md"
      component="form"
      onSubmit={form.onSubmit((vals) => handleSubmit(vals))}
    >
      <InputWithIcon
      size="md"
        Component={TextInput}
        label="Email"
        placeholder="you@email.dev"
        {...form.getInputProps("email")}
        disabled={loading}
        icon={IconUser}
        autoComplete="email"
      />

      {error && (
        <Text mt={"sm"} color="red" size={"sm"}>
          {error}
        </Text>
      )}

      <Button  radius={50} style={{background:'#2e3192'}}   size="md" type="submit" fullWidth mt="xl" loading={loading}>
        Send Verification Email
      </Button>
    </Paper>
      
      </>
  
      }

    
    </AppShell>
  );
}
