import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import AuthStack from '../navigation/AuthStack';
import {useDispatch, useSelector} from 'react-redux';
import {useLogoutMutation} from '../features/auth/authApiSlice';
import {removeUser, setUser} from '../features/slices/userSlice';

const ProfileScreen = ({navigation}) => {
  const {height: HEIGHT, width: WIDTH} = Dimensions.get('window');
  const {user} = useSelector(state => state.user);

  const dispatch = useDispatch();
  const [logout, {isLoading: isLoggingOut, isError: isLoggingOutError}] =
    useLogoutMutation();

  if (!user) {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        {/* <NavigationContainer> */}
        <AuthStack />
        {/* </NavigationContainer> */}
      </GestureHandlerRootView>
    );
  }

  console.log('loggedInUser: ', user);

  const logUserOut = async () => {
    try {
      const reponse = await logout({accessToken: user?.accessToken}).unwrap();

      console.log('response of logging out: ', reponse);
      dispatch(setUser(null));
      navigation.replace('Home');
      //   navigate("/");
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  // if (isLoggingOut) {
  //   return <ActivityIndicator size="large" color="#00ff00" />;
  // }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ImageBackground
        source={{
          uri: 'https://i.pinimg.com/736x/1f/cc/d1/1fccd1628330a657b5a9c364661d9fb0.jpg',
        }}
        resizeMode="repeat"
        className=""
        style={{flex: 1}}>
        <View
          style={{flex: 1, height: '100%', width: WIDTH}}
          className={`bg-white/90 
           absolute inset-0`}
        />
        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />
        {/* Header */}
        <View className="mx-2 flex-row w-screen space-x-2 mt-[50px]">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color={'black'} />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold">PROFILE</Text>
        </View>

        {/* Main Content */}
        <View
          style={{width: WIDTH, maxWidth: WIDTH}}
          className="mx-auto px-4 my-4 max-w-md  flex-row justify-between items-center space-x-4">
          <View className="bg-[#FF3130] rounded-full  h-[50px] w-[50px] justify-center items-center">
            <Text className="text-white text-center text-2xl font-bold">
              {user?.user?.name[0]}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-3xl text-left font-semibold">
              {user?.user?.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={logUserOut}
          className="flex-row items-center justify-center mt-8  rounded-lg px-4 py-4  ">
          <View className="flex-row items-center space-x-3">
            <Ionicons name="exit-outline" size={26} color="#ef4444" />
            <Text className=" text-center text-red-500 text-lg">
              {isLoggingOut ? 'logging out...' : 'Logout'}
            </Text>
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  );
};

export default ProfileScreen;
