import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { IonRouterLink, useIonRouter } from "@ionic/react";
import {
  Anchor,
  Box,
  Button,
  Flex,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { IconKey, IconUser } from "@tabler/icons-react";
import { browserLocalPersistence, fetchSignInMethodsForEmail, setPersistence } from "firebase/auth";
import React, { forwardRef, useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router";
import { z } from "zod";
import AppShell from "../../components/AppShell";
import { auth } from "../../utils/firebase";
import { loginSchema } from "./schemas";
// import GoogleIcon from "@mui/icons-material/Google";
import { showNotification } from "@mantine/notifications";
import useUserQuery from "../../hooks/useUserQuery";
import { axiosInstance } from "../../utils/axios";
import { AuthBranding } from "../Onboarding";
import SplashScreen from "../SplashScreen";

import { useAppSelector } from "../../store/hooks";
// import { scheduleLocalNotification } from "./Signup/notificationUtils";
import { createUser } from "./auth.api";
import { useDispatch } from "react-redux";
import { updateUser } from "../../store/slice/userSlice";

export function WaveBgCard() {
  return (
    <>
      <Box
        sx={{
          height: "12vh",
    
          backgroundPosition: "center",
          backgroundSize: "cover",
          position: "relative",
          backgroundAttachment: "fixed",
        }}
      >
        <img src="/wave.png" style={{ position: "absolute", top: 0 }} />
      </Box>

      <AuthBranding pb={20} />
    </>
  );
}

export function GoogleIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid"
      viewBox="0 0 256 262"
      width="0.9rem"
      height="0.9rem"
      {...props}
    >
      <path
        fill="#4285F4"
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      />
      <path
        fill="#34A853"
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      />
      <path
        fill="#FBBC05"
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782"
      />
      <path
        fill="#EB4335"
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      />
    </svg>
  );
}

export const InputWithIcon = forwardRef(
  (
    {
      Component,
      icon,
      ...props
    }: {
      Component: (...any: any[]) => React.ReactElement;
      icon: (...any: any[]) => React.ReactElement;
    } & Record<string, any>,
    ref: any
  ) => {
    const Icon = icon;

    return (
      <Component
        {...props}
        styles={{
          icon: { padding: 5 },
          innerInput: { "&[data-with-icon]": { paddingLeft: "2.5rem" } },
        }}
        iconWidth={40}
        ref={ref}
        value={props.value ?? ""}
        icon={
          <Flex
            align="center"
            justify={"center"}
            h="100%"
            w="100%"
            sx={(theme) => ({
              borderRadius: theme.radius.sm,
              background: theme.colors.indigo[1],
              color: theme.colors.indigo[7],
            })}
          >
            <Icon size={18} />
          </Flex>
        }
      />
    );
  }
);

export function Login() {
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const history = useHistory();
  const user = useAppSelector((state) => state.user);
  const getUserQuery = useUserQuery();
  const dispatch = useDispatch();
  const form = useForm<z.infer<typeof loginSchema>>({
    validate: zodResolver(loginSchema),
  });











  // if (user && !loading) return <Redirect to={"/app/feed"} exact push={false} />;
  if (Object.keys(user || {}).length && !loading)
    if (Object.keys(user).length && !loading)
      return <Redirect to={"/app/feed"} exact push={false} />;

  async function postLoginFn() {
    await getUserQuery.refetch();
    form.reset();
    history.replace("/app/feed");
  }

  const login = async (vals: z.infer<typeof loginSchema>) => {
    await setPersistence(auth, browserLocalPersistence);
    setLoading(true);
    try {
      const resp = await FirebaseAuthentication.signInWithEmailAndPassword({
        email: vals.email,
        password: vals.password,
      });

      console.log(resp)
      if (resp && resp.user) {
        // Set user data in local storage
        localStorage.setItem("user", JSON.stringify(resp.user));

      const res = await axiosInstance.get("/user");
     
      await postLoginFn();

      } else {
        // Handle sign-in failure
        throw new Error("Authentication failed");
      }
      // return <Redirect exact from="/app/login" to="/app/feed" />;
    } catch (err) {
      localStorage.removeItem("user");
      await FirebaseAuthentication.signOut();
      let errMsg = (err as Error).message;

      if ((err as Error).message.includes("auth/user-not-found"))
        errMsg = "Invalid email or password";

      if ((err as Error).message.includes("auth/wrong-password"))
        errMsg = "Wrong Password";

      if (
        (err as Error).message.includes("INVALID_LOGIN_CREDENTIALS") ||
        (err as Error).message.includes("auth/invalid-login-credentials")
      )
        errMsg = "Invalid email or password";

      console.log(err);
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const socialAuthLogin = async () => {
  
    
    await setPersistence(auth, browserLocalPersistence);
    setLoading(true);
  
    try {
      const result = await FirebaseAuthentication.signInWithGoogle();
      
      if (result?.user) {
        const userEmail:any = result.user.email ;
  
        // Check if email exists
        const signInMethods = await fetchSignInMethodsForEmail(auth, userEmail);
  
        if (signInMethods.length > 0) {
          console.log('Email already exists:', userEmail);
        } else {
          // Email does not exist, proceed with current logic
          localStorage.setItem("user", JSON.stringify(result.user));
          createNewUser();
        }
      } else {
        console.log('Result:', result);
      }
    } catch (err) {
      console.log(err);
      setLoading(false);
      showNotification({
        message: "Something went wrong",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewUser  = () =>{

   const getUser:any =     localStorage.getItem("user");
   const datJson = JSON.parse(getUser);

   if(datJson!==null && datJson!=='' && datJson!==undefined){

    console.log('getUser',datJson)

    const payload = {
      email: datJson.email,
      username: datJson.email.replace('@gmail.com',''),
      firebaseId: datJson.uid
    }

    createUser(payload).then((res)=>{

      localStorage.setItem("user", JSON.stringify(res));

      dispatch(
        updateUser({
          email:  datJson.email,
          username: datJson.email.replace('@gmail.com',''),
          followersIDs: [],
          followingIDs: [],
          verified: true,
        })
      );

      history.replace("/auth/setup-profile", {emailData:datJson});


   
    })



    setLoading(false);
   }


  }

  return (
    <AppShell>
      <WaveBgCard />

      <Title style={{color:'#0b78ff'}} align="center" order={2} mb={20} weight={700} mr={"auto"}>
        Sign In
      </Title>

      <Text color="dimmed" size="sm" align="center">
        Do not have an account yet?{" "}
        <Anchor
          onClick={(e) => {
            e.preventDefault();
            history.replace("/auth/signup");
          }}
        >
          Create account
        </Anchor>
      </Text>

      <Paper
        p={30}
        m={20}
        mt={10}
        radius="md"
        component="form"
        onSubmit={form.onSubmit((vals) => login(vals))}
      >
        <InputWithIcon
          Component={TextInput}
          label="Email"
          size="md"
          placeholder="you@email.dev"
          {...form.getInputProps("email")}
          disabled={loading}
          icon={IconUser}
          autoComplete="email"
        />

        <InputWithIcon
          Component={PasswordInput}
          label="Password"
          size="md"
          iconWidth={40}
          placeholder="Your password"
          mt="md"
          {...form.getInputProps("password")}
          disabled={loading}
          icon={IconKey}
          autoComplete="current-password"
        />
        {error && (
          <Text mt={"sm"} color="red" size={"sm"}>
            {error}
          </Text>
        )}

        <Flex mt="xs" justify={"flex-end"}>
          <Anchor
            component={IonRouterLink}
            routerLink="/auth/forgot-password"
            size="small"
            ml={"auto"}
            onClick={() => {
              form.reset();
              setError("");
            }}
          >
            Forgot Password?
          </Anchor>
        </Flex>

        <Button type="submit" fullWidth mt="xl" size="md" radius={50} style={{background:'#0b78ff'}} loading={loading}>
          Sign in
        </Button>
          <Text color="dimmed" size="sm" align="center" mb={10} mt={10}>
          Or Continue With

          </Text>

        <Button
          onClick={() => socialAuthLogin()}
          fullWidth
          radius={50}
          mt="m"
          size="md"
          loading={loading}
          variant="default"
          color="gray"
          type="button"
          leftIcon={<GoogleIcon color={"primary"} />}
        >
          {" "}
          Google{" "}
        </Button>
      </Paper>
    </AppShell>
  );
}
