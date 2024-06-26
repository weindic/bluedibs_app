import {
  ActionIcon,
  Anchor,
  Button,
  Checkbox,
  Group,
  Paper,
  PasswordInput,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { IconAddressBook, IconKey, IconMail, IconUser } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router";
import { z } from "zod";
import AppShell from "../../../components/AppShell";
import { updateUser } from "../../../store/slice/userSlice";
import { app } from "../../../utils/firebase";
import { createUser, signupRequest, signupValidationAPI } from "../auth.api";
import { GoogleIcon, InputWithIcon, WaveBgCard } from "../login";
import { signupSchema } from "../schemas";
import { IonModal } from "@ionic/react";
import ArrowBackIosRoundedIcon from "@mui/icons-material/ArrowBackIosRounded";
import TermsAndConditions from "../../Settings/TermsAndConditions";
import { showNotification } from "@mantine/notifications";
import { axiosInstance } from "../../../utils/axios";
import { useAppSelector } from "../../../store/hooks";
import useUserQuery from "../../../hooks/useUserQuery";

interface ISignUpForm
  extends Omit<z.infer<typeof signupSchema>, "firebaseId"> {}

export function SignUp() {
  const auth = getAuth(app);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.user);
  const getUserQuery = useUserQuery();

  const [isModalOpen, setModalOpen] = useState(false);

  const postLoginMut = useMutation({
    mutationFn: createUser,
  });

  const signupForm = useForm({
    validate: zodResolver(
      signupSchema.omit({
        shares_dilute: true,
        firebaseId: true,
        password: true,
      })
    ),
  });

  const postLogin = async (vals: any, resp: any) => {
    const rslt = await postLoginMut.mutateAsync({
      username: vals.username,
      email: vals.email,
      firebaseId: resp.user.uid,
    });

    localStorage.setItem("user", JSON.stringify(resp));

    dispatch(
      updateUser({
        email: vals.email,
        username: vals.username,
        followersIDs: [],
        followingIDs: [],
        verified: false,
      })
    );
  };



  const socialAuthLogin = async () => {


    await setPersistence(auth, browserLocalPersistence);
    setLoading(true);

    const result = await FirebaseAuthentication.signInWithGoogle().catch(
      (err) => {
        console.log(err);
        setLoading(false);
        showNotification({
          message: "something went wrong",
          color: "red",
        });
      }
    );


    if(result?.user){

      localStorage.setItem("user", JSON.stringify(result?.user));

      createNewUser();
    }
    else{
      console.log('result', result)
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


  async function postLoginFn() {
    await getUserQuery.refetch();
    signupForm.reset();
    history.replace("/app/feed");
  }



  const profValidation = async (vals: {
    username: any;
    email: any;
    password: any;
  }) => {
    setLoading(true);

    try {
      // can be done when creating account
      const userExsists = await signupValidationAPI({
        username: vals.username,
      });

      if (!!userExsists)
        return signupForm.setFieldError("username", "Username already exsist");


      signupRequest(vals).then((res)=>{

        if(res.status===true){

            history.replace(`/auth/verify-otp`, { vals: vals.email, data: vals });

        }
        else{
          return signupForm.setFieldError("email", "Email Already In Use");
        }

      

      })


      // const result =
      //   await FirebaseAuthentication.createUserWithEmailAndPassword({
      //     email: vals.email,
      //     password: vals.password,
      //   });

      // await postLogin(vals, result);

      // history.replace(`/auth/verify-otp`, { email: vals.email });
    } catch (err) {
      // if ((err as Error).message.includes("auth/email-already-in-use")) {
      //   const userExsists = await signupValidationAPI({
      //     email: vals.email,
      //   });
      //   if (!!userExsists.)
      //   return signupForm.setFieldError("email", "Email Already In Use");
      //   const resp = await signInWithEmailAndPassword(
      //     auth,
      //     vals.email,
      //     vals.password
      //   );
      //   try {
      //     await postLogin(vals, resp);
      //   } catch (err) {
      //     return signupForm.setFieldError("email", "something went wrong");
      //   }
      //   history.push(`/auth/verify-otp`, { email: vals.email });
      // }
      if ((err as Error).message.includes("auth/weak-password"))
        return signupForm.setFieldError(
          "password",
          "Password should be at least 6 characters"
        );
      if ((err as Error).message.includes("auth/email-already-in-use"))
        return signupForm.setErrors({ email: "Email already in use" });

      return signupForm.setErrors({ email: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <WaveBgCard />

      <Title style={{color:'#2e3192'}} align="center" order={2} mb={20} weight={700} mr={"auto"}>
        Sign Up
      </Title>

      <IonModal isOpen={!!isModalOpen}>
        <AppShell
          isModal
          header={
            <Group spacing="sm">
              <ActionIcon onClick={() => setModalOpen(false)} variant="light">
                <ArrowBackIosRoundedIcon sx={{ fontSize: 19 }} />
              </ActionIcon>

              <Title order={3} fz={20} weight={600}>
                Terms And Conditions
              </Title>
            </Group>
          }
        >
          <TermsAndConditions />
        </AppShell>
      </IonModal>

      <form
        onSubmit={signupForm.onSubmit((vals: any) => {
          if (!vals.agreeToTermsConditions) {
            return signupForm.setErrors({
              agreeToTermsConditions: "Required",
            });
          }

          profValidation(vals);
        })}
      >
        <Text color="dimmed" size="sm" align="center">
          Already have an account?{" "}
          <Anchor
            onClick={(e) => {
              e.preventDefault();
              history.replace("/auth/login");
            }}
          >
            Login
          </Anchor>
        </Text>

        <Paper p={30} pt={10} m={20} mt={10} radius="md">

     
          <InputWithIcon
            Component={TextInput}
            label="Username"
            placeholder="someone"
            size="md"
            disabled={loading}
            icon={IconUser}
            {...signupForm.getInputProps("username")}
          />

          <InputWithIcon
            Component={TextInput}
            label="Email"
            mt={"sm"}
            size="md"
            placeholder="you@email.dev"
            disabled={loading}
            icon={IconMail}
            {...signupForm.getInputProps("email")}
          />

          <InputWithIcon
            Component={PasswordInput}
            label="Password"
            placeholder="Your password"
            mt="md"
            size="md"
            disabled={loading}
            icon={IconKey}
            {...signupForm.getInputProps("password")}
          />




          <Checkbox
            mt={"sm"}
            label={
              <Text>
                I agree to the{" "}
                <Anchor
                  onClick={(e) => {
                    e.preventDefault();
                    setModalOpen(true);
                  }}
                >
                  terms and conditions
                </Anchor>
                .
              </Text>
            }
            {...signupForm.getInputProps("agreeToTermsConditions", {
              type: "checkbox",
            })}
            checked={
              signupForm.getInputProps("agreeToTermsConditions", {
                type: "checkbox",
              }).checked ?? false
            }
          />

          <Button  radius={50} style={{background:'#2e3192'}}   size="md" type="submit" fullWidth mt="xl" loading={loading}>
            Sign Up
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
      </form>
    </AppShell>
  );
}
