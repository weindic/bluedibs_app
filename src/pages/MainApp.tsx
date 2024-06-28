import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  useIonRouter,
} from "@ionic/react";
import { ActionIcon } from "@mantine/core";
import WalletRoundedIcon from "@mui/icons-material/AccountBalanceWallet";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import Person2OutlinedIcon from "@mui/icons-material/Person2Outlined";
import Person2RoundedIcon from "@mui/icons-material/Person2Rounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { Route, useHistory } from "react-router";
import RedirectWithState from "../components/RedirectWithState";
import useUserQuery from "../hooks/useUserQuery";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setDorm } from "../store/slice/dormSlice";
import { setNotifications } from "../store/slice/notificationSlice";
import { setNotificationUnread } from "../store/slice/notificationUnreadSlice";
import { setUser } from "../store/slice/userSlice";
import { database } from "../utils/firebase";
import { Dorm } from "./Chats/Dorm";
import { SingleChat } from "./Chats/SingleChat";
import { CommentsPage } from "./Comments/Comments";
import { Feed } from "./Feed/Feed";
import Notifications from "./Notification/Notifications";
import CreatePost from "./Profile/CreatePost";
import FollowerFollowing from "./Profile/FollowerFollowing/FollowerFollowing";
import { Profile } from "./Profile/Profile";
import { ProfileFeeds } from "./ProfileFeeds/ProfileFeeds";
import { Search } from "./Search/Search";
import Settings from "./Settings/settings";
import SplashScreen from "./SplashScreen";
import { PublicProfile } from "./User/PublicProfile";
import AddBalance from "./Wallet/AddBalance/AddBalance";
import { BuyConfirmation } from "./Wallet/BuyConfirmaation";
import { SellConfirmation } from "./Wallet/Sell Confirmaation";
import { Wallet } from "./Wallet/Wallet";
import WithdrawalRequests from "./Wallet/WithdrawalRequests";
import { VipChatBox } from "./Chats/vipChatBox";
import SinglePost from "../components/singlePost";


export const MainLayout = () => {
  const dispatch = useAppDispatch();
  const history = useHistory();
  const [loading, setLoading] = useState(true);
  const userDet = useAppSelector((state) => state.user);
  const notificationRefURI = "notifications/" + userDet.id;
  const currentPath = location.pathname;
  const hiderNav = currentPath?.includes('vipChat');

  const intro  = localStorage.getItem('intro')

  console.log('Current Path:', currentPath);
  const ionRouter = useIonRouter();

  const getUserQuery = useUserQuery();

  useEffect(() => {
    FirebaseAuthentication.getCurrentUser()
      .then(({ user }) => {
        if (user) {
          getUserQuery.refetch().then(() => {
            setLoading(false);
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });

    FirebaseAuthentication.addListener("authStateChange", ({ user }) => {
      setLoading(false);
      if (user) getUserQuery.refetch();
      else {
        dispatch(setUser(null));
      }
    });
  }, []);

  useEffect(() => {
    const unsubscribeNotifs = onValue(
      ref(database, notificationRefURI),
      (snapshot) => {
        const notif = snapshot.val();

        dispatch(setNotificationUnread(true));
        dispatch(setNotifications(notif));
      }
    );

    const dormStoreRef = ref(database, `dorm/${userDet.id}`);

    const unsubscibrChats = onValue(dormStoreRef, (snapshot) => {
      const data = snapshot.val();
      dispatch(setDorm(data));
    });

    return () => {
      unsubscribeNotifs();
      unsubscibrChats();
    };
  }, [history, userDet?.id]);

  useEffect(() => {

    console.log(" intro!=='true'",   intro!=='true')

    if (
      loading == false &&
      !Object.keys(userDet || {}).length &&
      !getUserQuery.isLoading &&
      intro!=='true'
      
    ) {
      return history.replace("/auth/welcome");
    }
  }, [userDet, getUserQuery.isLoading, loading]);

  // if (loading || getUserQuery.isFetching) return <>Loading...</>;

  console.log('!userDet?.verified && Object.keys(userDet || {}).length', !userDet?.verified , Object.keys(userDet || {}).length);


  if (loading || !Object.keys(userDet || {}).length || getUserQuery.isLoading)
    return <SplashScreen />;

  if (!Object.keys(userDet || {}).length &&  intro!=='true'  )
    return <RedirectWithState to={"/auth/welcome"} replace />;

  if (!getUserQuery.data && getUserQuery.isFetching) return <SplashScreen />;

  if (!userDet?.verified && Object.keys(userDet || {}).length) {
    return (
      <RedirectWithState
        to={`/auth/verify-otp`}
        replace
        state={{
          email: userDet?.email,
          fromAuthScreen: false,
        }}
      />
    );
  }

  if (!userDet?.mobile || !userDet?.dob || !userDet?.gender) {
    return <RedirectWithState to="/auth/setup-profile" replace />;
  }

  if ((userDet?.shares ?? 0) < 1)
    return <RedirectWithState to={"/auth/dilute-shares"} replace />;

  return (<>


 
    
      
    <IonRouterOutlet>

    <Route path="/app/chat/:userId" exact component={SingleChat} />
    <Route path="/app/vipChat/:roomId" exact component={VipChatBox} />
  

    <Route path="/app/feed" exact component={Feed} />
      <Route path="/app/notifications" exact component={Notifications} />
      <Route path="/app/profile" exact component={Profile} />
      <Route path="/app/feed/:username" exact component={ProfileFeeds} />
      <Route path="/app/search" exact component={Search} />
      <Route path="/app/chats" exact component={Dorm} />
      <Route path="/app/singlePost/:postId" exact component={SinglePost} />
      <Route path="/app/wallet" exact component={Wallet} />
      <Route path="/app/settings" exact component={Settings} />

      <Route
        path="/app/wallet/buy-confirm"
        exact
        component={BuyConfirmation}
      />

      <Route
        path="/app/wallet/sell-confirm"
        exact
        component={SellConfirmation}
      />

      <Route path="/app/comments/:postId" exact component={CommentsPage} />

     

      <Route
        path="/app/follower-following/:username"
        exact
        component={FollowerFollowing}
      />

      <Route path="/app/user/:userId" exact component={PublicProfile} />

      <Route path="/app/create-post" exact component={CreatePost} />

      <Route
        path="/app/withdrawal-requests"
        exact
        component={WithdrawalRequests}
      />

      <Route path={"/app/wallet/invest"} exact component={AddBalance} />
    </IonRouterOutlet>

{!hiderNav && 
 <IonTabs>

<IonRouterOutlet>


<Route path="/app/feed" exact component={Feed} />
  <Route path="/app/notifications" exact component={Notifications} />
  <Route path="/app/profile" exact component={Profile} />
  <Route path="/app/feed/:username" exact component={ProfileFeeds} />
  <Route path="/app/search" exact component={Search} />
  <Route path="/app/chats" exact component={Dorm} />
  <Route path="/app/singlePost/:postId" exact component={SinglePost} />
  <Route path="/app/wallet" exact component={Wallet} />
  <Route path="/app/settings" exact component={Settings} />

  <Route
    path="/app/wallet/buy-confirm"
    exact
    component={BuyConfirmation}
  />

  <Route
    path="/app/wallet/sell-confirm"
    exact
    component={SellConfirmation}
  />

  <Route path="/app/comments/:postId" exact component={CommentsPage} />

 

  <Route
    path="/app/follower-following/:username"
    exact
    component={FollowerFollowing}
  />

  <Route path="/app/user/:userId" exact component={PublicProfile} />

  <Route path="/app/create-post" exact component={CreatePost} />

  <Route
    path="/app/withdrawal-requests"
    exact
    component={WithdrawalRequests}
  />

  <Route path={"/app/wallet/invest"} exact component={AddBalance} />
</IonRouterOutlet>

<IonTabBar slot="bottom">
<IonTabButton tab="home" href="/app/feed">
  {ionRouter.routeInfo.pathname.startsWith("/app/feed") ? (
    <HomeRoundedIcon sx={{ fontSize: 30 }} />
  ) : (
    <HomeOutlinedIcon sx={{ fontSize: 30 }} />
  )}
</IonTabButton>

<IonTabButton tab="search" href="/app/search">
  <SearchRoundedIcon sx={{ fontSize: 30 }} />
</IonTabButton>

<IonTabButton tab="add" href="#" style={{ position: "relative" }}>
  <ActionIcon
    onClick={(e) => {
      history.push("/app/create-post");
    }}
    variant="filled"
    color="blue"
    size="lg"
    radius={"md"}
  >
    <AddRoundedIcon sx={{ fontSize: 30 }} />
  </ActionIcon>
</IonTabButton>

<IonTabButton tab="wallet" href="/app/wallet">
  {ionRouter.routeInfo.tab === "wallet" ? (
    <WalletRoundedIcon sx={{ fontSize: 30 }} />
  ) : (
    <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 30 }} />
  )}
</IonTabButton>

<IonTabButton tab="profile" href="/app/profile">
  {ionRouter.routeInfo.tab === "profile" ? (
    <Person2RoundedIcon sx={{ fontSize: 30 }} />
  ) : (
    <Person2OutlinedIcon sx={{ fontSize: 30 }} />
  )}
</IonTabButton>
</IonTabBar>
</IonTabs>
}

 
  </>
    
  
  );
};
