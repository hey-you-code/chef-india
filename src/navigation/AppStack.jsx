import React from 'react';
import {Text, View} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import EntypoIcon from 'react-native-vector-icons/Entypo';

// Screens
import ProfileScreen from '../screens/ProfileScreen';
import HomeScreen from '../screens/HomeScreen';
import ChefBookingScreen from '../screens/ChefBookingScreen';
import MenuScreen from '../screens/MenuScreen';
import RegularBookingScreen from '../screens/RegularBookingScreen';
import SpecialBookingScreen from '../screens/SpecialBookingScreen';
import MapScreen from '../screens/MapScreen';
import SpecificMenuScreen from '../screens/SpecificMenuScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import UserDecisionScreen from '../screens/UserDecisionScreen';
import UserMenuScreen from '../screens/UserMenuScreen';
import SpecialCheckoutScreen from '../screens/SpecialCheckoutScreen';
import BusinessBookingScreen from '../screens/BusinessBookingScreen';
import BookingConfirmation from '../screens/BookingConfirmationScreen';
import CateringScreen from '../screens/CateringScreen';
import SpecicCatererScreen from '../screens/SpecificCatererScreen';
import BookingsScreen from '../screens/BookingsScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'black',
        tabBarHideOnKeyboard: true,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          height: 60,
          borderTopWidth: 0,
          backgroundColor: 'white',
          // bottom: 12,
          paddingTop: 10,
          justifyContent: 'center',
          alignItems: 'center',
          shadowOffset: 0,
          borderTopWidth: 0,
          shadowColor: 'white',
          // backgroundColor: "black",
          // left: "2.5%",
          // right: "2.5%",
          // width: "95%",
          marginHorizontal: 'auto',
          // borderRadius: 25
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <View className="h-[36px]  w-[36px] justify-center">
              {focused ? (
                <View className="bg-green-500 justify-center rounded-xl items-center flex h-[40px]  w-[40px] relative">
                  <EntypoIcon name={'home'} size={36} color={color} />
                </View>
              ) : (
                // </View>
                <SimpleLineIcons name={'home'} size={30} color={color} />
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Book"
        component={ChefBookScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <View className=" relative justify-center items-center">
              {focused ? (
                // <View className="bg-blue-400 h-[60px] w-[40px] flex justify-center items-center">

                <View className="border border-orange-500 rounded-full justify-center absolute w-[70px] h-[70px] -top-12 bg-blue-400">
                  <Text className="text-center">BOOK</Text>
                </View>
              ) : (
                // </View>
                <View className="border border-orange-500 rounded-full justify-center  absolute w-[70px] h-[70px] -top-6">
                  <Text className="text-center">Book</Text>
                </View>
              )}
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, focused}) => (
            <View className="h-[34px]  w-[34px] justify-center">
              {focused ? (
                <Ionicons name="person" size={34} color={color} />
              ) : (
                <Ionicons name="person-outline" size={34} color={color} />
              )}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator>
      {/* <Stack.Screen
        name="Tabs"
        component={TabNavigator}
        options={{headerShown: false}}
      /> */}
      {/* <View>
        <Text>
          Hello
        </Text>
      </View> */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="BookChef"
        component={ChefBookingScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="RegularBooking"
        component={RegularBookingScreen}
        options={{headerShown: false, animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="SpecialBooking"
        component={SpecialBookingScreen}
        options={{headerShown: false, animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="Menu"
        component={MenuScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{headerShown: false, animation: 'slide_from_bottom'}}
      />
      <Stack.Screen
        name="SpecificMenu"
        component={SpecificMenuScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Checkout"
        component={CheckoutScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="UserDecision"
        component={UserDecisionScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="UserMenu"
        component={UserMenuScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="SpecialCheckout"
        component={SpecialCheckoutScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="BusinessBooking"
        component={BusinessBookingScreen}
        options={{headerShown: false, animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmation}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Catering"
        component={CateringScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SpecificCaterer"
        component={SpecicCatererScreen}
        options={{headerShown: false,  animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{headerShown: false,  animation: 'slide_from_right'}}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{headerShown: false,  animation: 'slide_from_right'}}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
