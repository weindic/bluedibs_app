import { useState, useEffect } from 'react';
import { useForm, yupResolver } from '@mantine/form';
import { Anchor, Button, Flex, Image, Table, Text, TextInput, Title, FileInput, Notification, LoadingOverlay, AppShell } from "@mantine/core";
import { IconCheck, IconUpload } from "@tabler/icons-react";
import { IonBadge, IonCol, IonGrid, IonLoading, IonRefresher, IonRefresherContent, IonRow } from '@ionic/react';
import * as yup from 'yup';
import { getKYCStatus } from './settings.api';
import { uploadFileToFirebase } from '../Chats/chat.service';

type Props = {};

// Define the validation schema using yup
const schema = yup.object().shape({
  adhaarNumber: yup.string()
    .length(12, 'Aadhaar number must be exactly 12 digits')
    .required('Aadhaar number is required'),
  panNumber: yup.string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'PAN number must follow the format: 5 letters, 4 numbers, 1 letter')
    .required('PAN number is required'),
  adhaarImage: yup.mixed().required('Aadhaar image is required'),
  panImage: yup.mixed().required('PAN image is required'),
});

const CompleteKyc = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [kycStatus, setKycStatus] = useState({
  
    adhaar: "",
    pan: "",
    adhaarNumber: "",
    panNumbe: "",
    status: 0,
 
  })
  const [userId, setUserId] = useState('');
  const [adhaarPreview, setAdhaarPreview] = useState<string | null>(null);
  const [panPreview, setPanPreview] = useState<string | null>(null);

  const [loader, setLoader] = useState(false)

  useEffect(() => {

    const userLoc2: any =  localStorage.getItem('bluedibs:user');
    if (userLoc2) {
      let usrDt2 = JSON.parse(userLoc2);
      setUserId(usrDt2.id);

     callDataInInterval(usrDt2.id)



      
    }

   
 
  }, []);





  const getKYCStatusData = (userId:any)=>{

 

    return getKYCStatus(userId).then(res=>{

        console.log('sajhsaj',res)

      if(res.data.data!==null){
        setKycStatus(res.data.data)
       
      }
      

      setLoader(false)


    })

  }

  const form = useForm({
    initialValues: {
      adhaarNumber: '',
      panNumber: '',
      adhaarImage: null,
      panImage: null,
    },
    validate: yupResolver(schema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    setSuccess(false);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('adhaarNumber', values.adhaarNumber);
    formData.append('panNumber', values.panNumber);
    if (adhaarPreview) {
      formData.append('adhaar', adhaarPreview);
    }
    if (panPreview) {
      formData.append('pan', panPreview);
    }

    try {
      const response = await fetch('https://server.bluedibs.com/kyc-requests', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to submit KYC request');
      }

      setSuccess(true);
      form.reset();
      setAdhaarPreview(null);
      setPanPreview(null);

      setLoading(false);

      callDataInInterval(userId)

     
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const callDataInInterval = (userId:any) =>{
    setLoader(true)
    let callCount = 0;
    const maxCalls = 2;
    const intervalId = setInterval(() => {
      if (callCount < maxCalls) {
        getKYCStatusData(userId);
        callCount += 1;
      } else {
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
   
  }

  const handleAdhaarChange = async(file: File) => {
    setLoader(true)
    form.setFieldValue('adhaarImage', file);
  
    const url:any =  await uploadFileToFirebase(file);

    if(url!==''){

      setLoader(false)
      setAdhaarPreview(url)

    }
 
  };

  const handlePanChange = async(file: File) => {
    setLoader(true)
    form.setFieldValue('panImage', file);
    const url:any =  await uploadFileToFirebase(file);
    if(url!==''){

      setLoader(false)
      setPanPreview(url)

    }
  };



  function refetchQueries() {
    return Promise.allSettled([

      getKYCStatusData(userId)
    ]).then(console.log);
  }


  return (
    <AppShell
  
  >
    <Flex direction="column" align="center" justify="center" style={{ height: '100vh', padding:15 }}>

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

      {/* <LoadingOverlay
        visible={true}
      /> */}
        <IonLoading
          isOpen={loader}
          message={'Please wait...'}
          duration={0} // Set to 0 to prevent it from auto-hiding
        />


      <Title>{kycStatus?.adhaarNumber!==''? 'KYC Details' : 'Complete KYC' }</Title>
  
     {kycStatus?.adhaarNumber!=='' && <>
     
     <p>We've recieved your KYC request.</p>

     <h5>PAN: {kycStatus?.panNumbe}</h5>
     <h5>Adhaar Number: {kycStatus?.adhaarNumber}</h5>

     <h5>Status: {kycStatus?.status ==1? <> <IonBadge color={ 'warning'}>Under Verification</IonBadge></>: <> <IonBadge  color="success">KYC Verified</IonBadge></> }</h5>
     
     </>}

     {!kycStatus?.adhaarNumber && <>
        <p className='ion-text-center'>Complete your KYC so that you can widhraw your wallet money in your bank account.</p>
      <form onSubmit={form.onSubmit(handleSubmit)} style={{ width: '400px', padding:25 }}>
      <TextInput
          label="Aadhaar Number"
          placeholder="Enter your Aadhaar number"
          required
          error={form.errors.adhaarNumber && form.errors.adhaarNumber}
          {...form.getInputProps('adhaarNumber')}
        />
        <TextInput
          label="PAN Number"
          placeholder="Enter your PAN number"
          required
          error={form.errors.panNumber && form.errors.panNumber}
          {...form.getInputProps('panNumber')}
        />
        <FileInput
          label="Aadhaar Image"
          placeholder="Upload Aadhaar image"
          required
          icon={<IconUpload size={14} />}
          accept="image/*"
          onChange={handleAdhaarChange}
          error={form.errors.adhaarImage && form.errors.adhaarImage}
        />
      
        <FileInput
          label="PAN Image"
          placeholder="Upload PAN image"
          required
          icon={<IconUpload size={14} />}
          accept="image/*"
          onChange={handlePanChange}
          error={form.errors.panImage && form.errors.panImage}
        />
<IonGrid>
    <IonRow>
        <IonCol size="6">
        {adhaarPreview && (
          <img src={adhaarPreview}  style={{borderRadius:10, width:100, height:100, objectFit:'cover'}} alt="Aadhaar Preview" />
        )}
        </IonCol>

        <IonCol size="6">
        {panPreview && (
          <img src={panPreview}   style={{borderRadius:10, width:100, height:100, objectFit:'cover'}} alt="PAN Preview"  />
        )}
        </IonCol>
    </IonRow>
</IonGrid>

       
     
        <Button  type="submit" fullWidth mt="md" loading={loading || loader}>
          Submit KYC
        </Button>
      </form>
      {success && (
        <Notification mt="md" icon={<IconCheck size="1.1rem" />} color="teal" title="Success">
          KYC submitted successfully!
        </Notification>
      )}
     
     </>}
     
     
    </Flex>
    </AppShell>
  );
};

export default CompleteKyc;
