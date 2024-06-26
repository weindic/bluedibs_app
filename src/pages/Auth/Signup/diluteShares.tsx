import { IonButton, IonCard, IonCol, IonFooter, IonGrid, IonIcon, IonRow } from "@ionic/react";
import { Button, Flex, NumberInput, Paper, Text, Title } from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import { checkmarkCircle, personAdd } from "ionicons/icons";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Redirect, useHistory } from "react-router";
import { z } from "zod";
import AppShell from "../../../components/AppShell";
import { useAppSelector } from "../../../store/hooks";
import { updateUser } from "../../../store/slice/userSlice";
import { setupAPI } from "../auth.api";

export function GetStarted() {
  const userDet = useAppSelector((state) => state.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState();
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();

  const userInfoMut = useMutation({
    mutationFn: setupAPI,
    onSuccess(data) {
      dispatch(updateUser({ shares: userInfoForm.values.shares_dilute || 0 }));
      history.replace("/auth/setup-following");
    },
  });
  const userInfoForm = useForm<{
    equity_shares: number;
    shares_dilute: null | number;
  }>({
    validate: zodResolver(
      z.object({ equity_shares: z.coerce.number().min(0).max(10) })
    ),
    initialValues: {
      equity_shares: 10,
      shares_dilute: null,
    },
  });

  useEffect(() => {

    
    if (userInfoForm.values?.shares_dilute) setError(null);


  }, [userInfoForm.values?.shares_dilute]);

  useEffect(()=>{

    userInfoForm.setFieldValue("shares_dilute", 10_00_00_000)
  },[])

  // if (userDet.shares > 1) {
  //   if (userDet.followingIDs?.length) return <Redirect to={"/app/feed"} />;

  //   return <Redirect to={"/auth/setup-following"} />;
  // }

  return (
    <AppShell>
      <Title
        mt={10}
        align="center"
        order={2}
        color="#373A40"
        sx={(theme) => ({
          fontFamily: `Greycliff CF, ${theme.fontFamily}`,
          fontWeight: 700,
        })}
      >
        Complete Profile
      </Title>

      <div className="delShare ion-text-center">
        <img src="src/svg/del.svg" style={{width:'60%', margin:'0 auto'}}/>
      </div>

   <IonCard mode="ios" style={{padding:10}}>
   <form
        onSubmit={userInfoForm.onSubmit((vals: any) => {
          if (!userInfoForm.values.shares_dilute)
            return setError("Please dilute shares");
          return userInfoMut.mutate(vals);
        })}
      >

<Title className="ion-text-center" color="#373A40" order={5}>
              Dilute Units
            </Title>

<IonGrid>
  <IonRow>


    <IonCol size="4">
    <Button
     radius={50}
              color="#28016b"
              loading={loading}
              rightIcon={
                userInfoForm.values.shares_dilute == 10_00_00_000 && (
                  <IonIcon icon={checkmarkCircle} />
                )
              }
              onClick={() =>
                userInfoForm.setFieldValue("shares_dilute", 10_00_00_000)
              }
            >
              10 Cr.
   </Button>
    </IonCol>

    <IonCol size="4">
    <Button
     radius={50}
              color="#28016b"
              loading={loading}
              rightIcon={
                userInfoForm.values.shares_dilute == 1_00_00_00_000 && (
                  <IonIcon icon={checkmarkCircle} />
                )
              }
              onClick={() =>
                userInfoForm.setFieldValue("shares_dilute", 1_00_00_00_000)
              }
            >
              100 Cr.
   </Button>
    </IonCol>

    <IonCol size="4">
    <Button
     radius={50}
              color="#28016b"
              loading={loading}
              rightIcon={
                userInfoForm.values.shares_dilute == 2_00_00_00_000 && (
                  <IonIcon icon={checkmarkCircle} />
                )
              }
              onClick={() =>
                userInfoForm.setFieldValue("shares_dilute", 2_00_00_00_000)
              }
            >
              200 Cr.
            </Button>
    </IonCol>


    
    <IonCol size="4">
    
    <Button
     radius={50}
              color="#28016b"
              loading={loading}
              rightIcon={
                userInfoForm.values.shares_dilute == 5_00_00_00_000 && (
                  <IonIcon icon={checkmarkCircle} />
                )
              }
              onClick={() =>
                userInfoForm.setFieldValue("shares_dilute", 5_00_00_00_000)
              }
            >
              500 Cr.
            </Button>
    </IonCol>

    <IonCol size="4">
    
    <Button
     radius={50}
              color="#28016b"
              loading={loading}
              rightIcon={
                userInfoForm.values.shares_dilute == 10_00_00_00_000 && (
                  <IonIcon icon={checkmarkCircle} />
                )
              }
              onClick={() =>
                userInfoForm.setFieldValue("shares_dilute", 10_00_00_00_000)
              }
            >
              1000 Cr.
            </Button>
    </IonCol>
  </IonRow>
</IonGrid>

<Text color="dimmed" size="sm" mb={20} align="center">
              *Recommend - 10 cr
            </Text>


            <div>
              <Title color="#373A40" order={5}>
                Select Your Value In Units.
              </Title>
              <NumberInput
                hideControls
                styles={{
                  input: {
                    textAlign: "center",
                  },
                }}
                mt={"xs"}
                defaultValue={10}
                size="xs"
                max={100}
                min={0}
                {...userInfoForm.getInputProps("equity_shares")}
              />
              <Text color="dimmed" size="sm" align="center" mt={20}>
                *Recommend - 10%
              </Text>

              <Text color="#373A40" size={"sm"} mt={20} weight={500}>
            Note: Platform Charge of all Units : 2.5%
          </Text>

          {error && (
            <Text size="sm" align="center" color="red" mt={"sm"}>
              {error}
            </Text>
          )}
            </div>
            <IonFooter>
              
            <Button mt={30} type="submit"  size="md" radius={50} style={{background:'#28016b', width:'100%', padding:10}} loading={loading}>
            Complete
          </Button>
            </IonFooter>
     
      </form>
   </IonCard>
    
    </AppShell>
  );
}
