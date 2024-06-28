import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  Anchor,
  Button,
  Flex,
  Paper,
  PinInput,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router";
import AppShell from "../../../components/AppShell";
import { setUser, updateUser } from "../../../store/slice/userSlice";
import { clearLocalstorage } from "../../../utils/localstorage";
import { createUser, sendOtpAPI, verifyOtpAPI } from "../auth.api";
import { WaveBgCard } from "../login";
import './otp-form.css';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { app } from "../../../utils/firebase";

type Props = {};

function OTP({}: Props) {
  const auth = getAuth(app);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const locationState = location.state as any;
  console.log('locationState',locationState)

  const otpForm = useForm({
    initialValues: {
      otp: "",
      email:locationState?.data?.email
     
    },
  });

  const requestOtpMutation = useMutation({
    mutationKey: ["request-otp"],
    mutationFn: sendOtpAPI,

    onSuccess() {
      showNotification({
        message: "Verification email sent",
      });
    },

    onError(error, variables, context) {
      showNotification({
        message:
          error?.response?.data?.message ??
          "Cant resent OTP, try again after 5 mins.",
        id: "verify-otp",
        color: "red",
        tt: "capitalize",
      });
    },
  });

  const verifyOtpMutation = useMutation({
    mutationKey: ["verify-otp"],
    mutationFn: verifyOtpAPI,

    onSuccess() {
     
      createUserProfile(locationState)


    },

    onError(error, variables, context) {
      showNotification({
        message: error?.response?.data?.message ?? "Invalid OTP",
        id: "verify-otp",
        color: "red",
        tt: "capitalize",
      });
    },
  });



  const postLoginMut = useMutation({
    mutationFn: createUser,
  });


  const postLogin = async (vals: any, resp: any) => {
    const rslt = await postLoginMut.mutateAsync({
      username:  locationState.data.username,
      email:  locationState.data.email,
      firebaseId: resp.user.uid,
    });

    localStorage.setItem("user", JSON.stringify(resp));

    dispatch(
      updateUser({
        email:  locationState.data.email,
        username:  locationState.data.username,
        followersIDs: [],
        followingIDs: [],
        verified: false,
      })
    );
  };

  const createUserProfile = async() =>{

    
    console.log(locationState.data)

       const result =
        await FirebaseAuthentication.createUserWithEmailAndPassword({
          email: locationState.data.email,
          password: locationState.data.password,
        });

      await postLogin( locationState.data, result);

      const resp = await signInWithEmailAndPassword(
            auth,
            locationState.data.email,
            locationState.data.password
          );

          console.log('resp',resp)

      history.replace("/auth/setup-profile");

  }


  useEffect(() => {
    // if (location.state?.fromAuthScreen === false && location.state.email) {
    //   requestOtpMutation.mutate({ email: location.state.email });
    // }
  }, [location]);

  return (
    <AppShell>
      <WaveBgCard />

      <form
        onSubmit={otpForm.onSubmit((vals: any) => {
          verifyOtpMutation.mutate({
            otp: vals.otp,
            email: locationState.vals as string,
          });
        })}
      >
        <Title mt={40} align="center" order={2} weight={700} mr={"auto"}>
          Verify OTP
        </Title>

        <Text color="dimmed" size="sm" align="center" mt={5}>
          Verify your email to continue using platform.
        </Text>

        <Text color="dimmed" size="sm" align="center" mt={5}>
          Go Back to login?{" "}
          <Anchor
            onClick={async (e) => {
              e.preventDefault();
              clearLocalstorage();
              dispatch(setUser({}));
              await FirebaseAuthentication.signOut().catch((err) => err);
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
            loading={requestOtpMutation.isLoading}
            variant="white"
            type="button"
            onClick={() => {
              console.log(location.state);
              requestOtpMutation.mutate({
                email: locationState.data.email,
              });
            }}
          >
            Request again
          </Button>

          <Button
         radius={50} style={{background:'#2e3192'}}   size="md" type="submit" fullWidth mt="xl"
           
            loading={verifyOtpMutation.isLoading}
          >
            Verify
          </Button>
        </Paper>
      </form>
    </AppShell>
  );
}

export default OTP;
