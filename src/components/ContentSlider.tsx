import { IonButton, IonContent, IonIcon, IonPage } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import "@ionic/react/css/ionic-swiper.css";
import {
  Autoplay,
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
} from "swiper/modules";
import { Box, Button } from "@mantine/core";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Link } from "react-router-dom";
import IntroOneSvg from "../svg/intro_one";


const images = new Array(3).fill(0).map((_, i) => `/slider_${i + 1}.jpg`);



function ContentSlider() {


  

  return (
    <IonPage>
      <IonContent>
        <Swiper
          modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
          pagination={{
            type: "bullets",
            clickable: true,
          }}
          autoplay={{ delay: 5000 }}
          slidesPerView={1}
          loop={false}
          initialSlide={0}
        >
   

        <SwiperSlide >
           
           <div style={{padding:15,
             marginBottom:20,
             height:'90vh'
           }}>
            <IntroOneSvg/>



            <div className="introText">
             <h2 style={{fontWeight:300}}>Welcome To The <br/><span style={{color:'#2e3192', fontWeight:600, fontSize:'2rem'}}>BlueDibs</span></h2>
           
            <p style={{color:'gray'}}>Buy & Sell shares of your friends profile. Digialize your profile and earn with Bludibs. </p>
            </div>

           </div>


         </SwiperSlide>


         <SwiperSlide >
           
           <div style={{padding:15,
             marginBottom:20,
             height:'90vh'
           }}>
            <img src="/slide2.gif"/>



            <div className="introText">
             <h2 style={{fontWeight:300}}>Create Your Social Network<br/><span style={{color:'#2e3192', fontWeight:600, fontSize:'2rem'}}>Invite Friends</span></h2>
           
            <p style={{color:'gray'}}>You can invite people to follow your profile. The more you grow network the more you earn. </p>
            </div>

           </div>


         </SwiperSlide>


         <SwiperSlide >
           
           <div style={{padding:15,
             marginBottom:20,
             height:'90vh'
           }}>
              <img src="/slide3.gif"/>



            <div className="introText">
             <h2 style={{fontWeight:300}}>Create Your Own <br/><span style={{color:'#2e3192', fontWeight:600, fontSize:'2rem'}}>Portfolio</span></h2>
           
            <p style={{color:'gray'}}>Buy share of other profiles and create your own profitable portfolio. </p>
            </div>

           </div>


         </SwiperSlide>

        </Swiper>

      
     
        <Button
          sx={{ position: "absolute", bottom: 20, right: 20, zIndex: 999, background:'#2e3192' }}
          size="lg"
          radius={50}
          
          component={Link}
          to={"/auth/login"}
        >
          Next 
        </Button>
      </IonContent>
    </IonPage>
  );
}

export default ContentSlider;
