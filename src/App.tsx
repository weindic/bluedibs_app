import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/* Theme variables */
// import './theme/variables.css';
import { Notifications } from "@mantine/notifications";
import { ForgotPassword } from "./pages/Auth/ForgotPassword";
import OTP from "./pages/Auth/Signup/OTP";
import SetupProfile from "./pages/Auth/Signup/SetupProfile";
import { GetStarted } from "./pages/Auth/Signup/diluteShares";
import SetupFollowing from "./pages/Auth/Signup/setupFollowing";
import { SignUp } from "./pages/Auth/Signup/signup";
import { Login } from "./pages/Auth/login";
import { MainLayout } from "./pages/MainApp";
import Onboarding from "./pages/Onboarding";
import SuccessScreen from "./pages/SuccessScreen";
import ContentSlider from "./components/ContentSlider";
import GlobalFinder from "./realtime/GlobalFinder";
import { GlobalStateProvider } from "./realtime/GlobalStateContext";

import { ChatStateProvider } from "./realtime/ChatContext";
import { useEffect } from "react";
import ScheduleLocalNotification from "./utils/notificationUtils";
import useLocalNotificationScheduler from "./utils/notificationUtils";
import { requestNotificationPermission } from "./realtime/permission";

import { Plugins, Capacitor } from '@capacitor/core';
import { StatusBar, Style } from "@capacitor/status-bar";

const { Permissions, Geolocation } = Plugins;


setupIonicReact();





const App: React.FC = () => {

  useEffect(() => {
    const setStatusBar = async () => {
      // Set the status bar color
      await StatusBar.setBackgroundColor({ color: '#040881' }); // Change the color as needed
      // Optionally, you can also change the style (light or dark content)
      await StatusBar.setStyle({ style: Style.Dark }); // or Style.Dark
    };

    setStatusBar();
  }, []);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    // Request notification permissions
    const notificationPermission = await requestNotificationPermission();
    console.log('Notification permission granted:', notificationPermission);

    // Request location permissions (example)
    if (Capacitor.isNative) {
      try {
        const result = await Permissions.query({ name: 'geolocation' });
        if (result.state === 'granted') {
          console.log('Location permission already granted');
        } else {
          const permissionRequest = await Permissions.request({ name: 'geolocation' });
          if (permissionRequest.state === 'granted') {
            console.log('Location permission granted');
          } else {
            console.log('Location permission denied');
          }
        }
      } catch (error) {
        console.error('Error checking or requesting location permission:', error);
      }
    }
  }


  useLocalNotificationScheduler(); 



  
  return (
    <IonApp>
      <GlobalStateProvider>
     
        <SuccessScreen>
          <Notifications />
         

          <IonReactRouter>
            <IonRouterOutlet>
              <Route path="/auth/welcome" exact component={ContentSlider} />
              <Route path="/auth/login" exact component={Login} />
              <Route path="/auth/signup" exact component={SignUp} />
              <Route
                path="/auth/forgot-password"
                exact
                component={ForgotPassword}
              />
              <Route path="/auth/verify-otp" exact component={OTP} />
              <Route path="/auth/dilute-shares" exact component={GetStarted} />
              <Route
                path="/auth/setup-profile"
                exact
                component={SetupProfile}
              />
              <Route
                path="/auth/setup-following"
                exact
                component={SetupFollowing}
              />
              <ChatStateProvider>
              <Route path="/app/*" exact component={MainLayout} />
              </ChatStateProvider>
              <Route path="/" exact>
                <Redirect to={"/app/feed"} />
                
              </Route>
            </IonRouterOutlet>
          </IonReactRouter>
        </SuccessScreen>
      </GlobalStateProvider>
    </IonApp>
  );
};

export default App;