import {NavigationContainer} from '@react-navigation/native';
import {
  PermissionsAndroid,
  Platform,
  StatusBar,
  Text,
  View,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import AppStack from './AppStack';
import {useDispatch, useSelector} from 'react-redux';
import AuthStack from './AuthStack';
import {
  useRefreshAccessTokenMutation,
  useStoreFcmTokenMutation,
} from '../features/auth/authApiSlice';
import {useEffect, useState} from 'react';
import {setUser} from '../features/slices/userSlice';
import BottomSheetProvider from '../contexts/BottomSheetContext';

import {createNotifications} from 'react-native-notificated';

import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';

// This is the default configuration
configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false, // Reanimated runs in strict mode by default
});

const {NotificationsProvider} =
  createNotifications();

const Router = () => {
  const [isLoading, setIsLoading] = useState(true);

  const {user} = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [refreshAccessToken, {isLoading: verifyingRefreshToken}] =
    useRefreshAccessTokenMutation();

  const [storeFcmToken, {isLoading: isStoringFCMtoken}] =
    useStoreFcmTokenMutation();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        const response = await refreshAccessToken().unwrap();
        // console.log('r1');
        // console.log('acessToken response: ', response.data);

        dispatch(
          setUser({
            user: response?.data?.user,
            accessToken: response?.data?.accessToken,
          }),
        );
      } catch (error) {
        console.log('error response: ', error);
      } finally {
        setIsLoading(false);
        // SplashScreen.hide();
      }
    };

    if (!user) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
      //   SplashScreen.hide();
    }
  }, [user, dispatch]);

  //   TODO NOTIFICATIONS

  //   useEffect(() => {
  //     if (user) {
  //       requestUserPermission();
  //     }
  //   }, [user]);

  //   const requestUserPermission = async () => {
  //     if (Platform.OS === 'android') {
  //       const granted = await PermissionsAndroid.request(
  //         PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
  //       );
  //     }

  //     const authStatus = await messaging().requestPermission();
  //     const enabled =
  //       authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //       authStatus === messaging.AuthorizationStatus.PROVISIONAL;
  //     if (enabled) {
  //       const token = await messaging().getToken();
  //       console.log('myFCMToken:', token);
  //       try {
  //         console.log('Storing FCM Token...');
  //         const response = await storeFcmToken({
  //           id: user?.user._id,
  //           fcmToken: token,
  //         }).unwrap();
  //         console.log('response of storing FCM Token: ', response);
  //       } catch (error) {
  //         console.error('Error storing FCM Token:', error);
  //       }
  //     } else {
  //       console.log('Permission denied for notifications');
  //     }
  //   };

  if (isLoading) {
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );
  }
  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: '#fff'}}>
      <NotificationsProvider>
        <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
        <NavigationContainer>
          <BottomSheetProvider>
            <AppStack />
          </BottomSheetProvider>
        </NavigationContainer>
      </NotificationsProvider>
    </GestureHandlerRootView>
  );
};

export default Router;
