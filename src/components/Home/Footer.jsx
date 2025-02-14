import {View, Text} from 'react-native';
import React from 'react';

const Footer = () => {
// Book Your Personized chefs for every occasions


  return (
    <View className="w-full">
      <Text className="font-bold w-[90vw]">
        <Text className="text-4xl text-[#FF3130]">Book </Text> 
        <Text className="text-4xl text-[#FF3130]/90">Your </Text> 
        <Text className="text-5xl text-[#FF3130]/80 shadow-lg">Personalized </Text> 
        <Text className="text-5xl text-[#FF3130]/70">Chefs </Text> 
         <Text className="text-3xl text-gray-500">For Every Ocassions!</Text>
      </Text>
    </View>
  );
};

export default Footer;
