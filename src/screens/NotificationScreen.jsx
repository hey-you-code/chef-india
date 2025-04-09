import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationScreen = ({navigation}) => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar
        translucent={false}
        backgroundColor={'white'}
        barStyle={'dark-content'}
      />
      <View className="flex-row items-center mx-4 space-x-4 mt-4 mb-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="">
          <Ionicons name="arrow-back" size={32} />
        </TouchableOpacity>
        <Text className="flex-1 font-semibold text-3xl">Notifications</Text>
      </View>

      <View className="mt-4">
        <Text className="text-center text-lg text-gray-400">
          No New Notifications
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default NotificationScreen;
