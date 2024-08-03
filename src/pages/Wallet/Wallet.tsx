import { Button, Container, Divider, LoadingOverlay, SegmentedControl, Stack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import AppShell from "../../components/AppShell";
import { HeaderComponent } from "../../components/Header";
import { usePaymentInfoQuery } from "../Settings/PaymentDetails";
import { Holdings } from "./Holdings";
import { Tiiys } from "./Tiiys";
import { getHoldings, getReffCountData, getUserReffById } from "./wallt.api";
import { IonButton, IonCard, IonItem, IonRefresher, IonRefresherContent, IonInput, IonAlert, IonLabel } from "@ionic/react";
import { useHistory, useLocation } from "react-router";
import useUserQuery from "../../hooks/useUserQuery";
import { getKYCStatus } from "../Settings/settings.api";
import { Statement } from "./Statement";

import './style.css';

export function Wallet() {
  const location = useLocation();
  const { type } = location.state || 'HOLDINGS';
  const [tab, setTab] = useState<"HOLDINGS" | "TIIYD" | "REFFERAL">("HOLDINGS");

  const userQuery = useUserQuery();
  const history = useHistory();

  




const [userID, setUser] = useState('')

  const getHoldingQuery = useQuery({
    queryKey: ["holdings"],
    queryFn: getHoldings,
    // placeholderData: {
    //   holdings: [],
    //   balance: 0,
    //   ttlInvestment: 0,
    //   ttlReturns: 0,
    // },
  });

  useEffect(() => {
    getRefferalData();
  }, []);


  useEffect(()=>{
 

    if(type && type!==''){
    
      setTab(type as any);
      refetchQueries();
    }
    else{

      setTab("HOLDINGS" as any);
      refetchQueries();
    }
 
  },[type])

  const [referralCounts, setReferralCounts] = useState({ generatedCount: 0, claimedCount: 0 });

  useEffect(() => {
    let usr:any = localStorage.getItem('bluedibs:user');
    let usrJ = JSON.parse(usr);
    const userId = usrJ?.id;
    setUser(userId)

    getRefferalMoney(userId);
    fetchReferralCounts(userId);
  }, []);

  const [withdrawalAmount, setWithdrawalAmount] = useState<number>(0);
  const [showAlert, setShowAlert] = useState(false);

  const withdrawRefferal = async () => {
    let usr:any = localStorage.getItem('bluedibs:user');
    let usrJ = JSON.parse(usr);
    const userId = usrJ?.id;

    if (!withdrawalAmount || withdrawalAmount < 1000) {
      alert('Amount should not be blank and should be greater than or equal to 1000');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/referral-wallets/refferalGet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, amount: withdrawalAmount })
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      console.log(data);

      if(data.status===true){
        setShowAlert(true);
        fetchReferralCounts(userID)
        getRefferalData()
      }
      else{
        alert(data.message);
      }

 
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchReferralCounts = async (userId: any) => {
    return getReffCountData({ "userId": userId }).then((res: any) => {
      setReferralCounts(res);
      console.log('refData', res);
    });
  };

  const [refData, setRefData] = useState({ userId: '', balance: 0 });


  const getRefferalData = () => {
    const userDt: any = localStorage.getItem('bluedibs:user');
    const psData = JSON.parse(userDt);

    getUserReffById(psData?.id).then((res: any) => {
      setRefData(res);
      console.log('refData', res);
    });
  };

  const paymentInfoQuery = usePaymentInfoQuery();

  function refetchQueries() {
    return Promise.allSettled([
      getHoldingQuery.refetch(),
      paymentInfoQuery.refetch(),
      userQuery.refetch(),
      fetchReferralCounts(userID),
      fetchReferralCounts(userID),
      getRefferalData()
    ]).then(console.log);
  }

  useEffect(() => {
    if (location.pathname === "/app/wallet") refetchQueries();
  }, [location.pathname]);

  const [kycData, setKycData] = useState(false);



  const getRefferalMoney = async (userId: any) => {
  
    return getKYCStatus(userId).then(res => {

      if(res?.data?.data!==null){

      if (res?.data?.data?.status!==1 ) {
    
        setKycData(true);
      } else {
       
      }
    }
    else{
      setKycData(false);
    }

      console.log('kycData', res?.data?.data?.status , res?.data?.data)
    });
  };

  return (
    <AppShell
      header={<HeaderComponent title="Wallet" withBackButton={false} />}
    >
      <IonRefresher
        slot="fixed"
        onIonRefresh={(evt) => {
          refetchQueries().then(() => {
            evt.detail.complete();
          });
        }}
      >
        <IonRefresherContent />
      </IonRefresher>

      <LoadingOverlay
        visible={getHoldingQuery.isFetching ?? paymentInfoQuery.isFetching}
      />

      <Container p={"lg"} sx={{ position: "relative" }}>
        <SegmentedControl
          value={tab}
          color="blue"
          onChange={(val) => {
            console.log(val)
            setTab(val as any);
            refetchQueries();
          }}
          data={[
            { label: "Holdings", value: "HOLDINGS" },
            { label: "TIIYD", value: "TIIYD" },
            { label: "Refferal", value: "REFFERAL" },
          ]}
          fullWidth
          size="sm"
        />

        {tab === "HOLDINGS" && <>
          <Holdings query={getHoldingQuery} />
        </>}

        {tab === "TIIYD" && <>
          <Tiiys query={getHoldingQuery} />
        </>}

        {tab === "REFFERAL" && <>


          <Stack mt={"sm"} pt="xl">
        <Statement.Group>
          <Statement
            label="Refferal Balance"
            value={`₹ ${refData?.balance}`}
          />

          <Statement
            label="Total Invites"
            value={referralCounts?.generatedCount}
          />

          <Statement
            label="Total Claimed"
            value={referralCounts?.claimedCount}
          />

        
        </Statement.Group>

      

        <Divider my={"sm"} />

       
      </Stack>

      

          {kycData!==true ?
            <div>
              <p style={{ textAlign: 'center', fontSize: 12 }}>Kindly complete your kyc to withdraw your refferal wallet balance. <a href="javaScript:;" onClick={() => history.push("/app/settings")} >Go To Settings</a></p>
          
            </div>
            :
            <>
              <br/>

             <IonLabel> Amount</IonLabel> 
              <IonItem style={{border:"1px solid grey", borderRadius:5}}>
               
                <IonInput
                 className="custom-ion-input"
                  labelPlacement="floating"
                  value={withdrawalAmount}
                  placeholder="Enter amount"
                  onIonChange={(e) => setWithdrawalAmount(parseInt(e.detail.value!, 10))}
                  type="number"
                />
              </IonItem>

              <small style={{textAlign:'center'}}>Withdrwal request must be at least INR. 1000.</small>

              <Button
            color="green"
            fullWidth
            onClick={() => withdrawRefferal()}
          >
           Withdraw Amount
          </Button>

             </>
          }
        </>}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header={'Success'}
          message={'Withdrawal successful!'}
          buttons={['OK']}
        />
      </Container>
    </AppShell>
  );
}
