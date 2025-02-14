import { View, Text, Dimensions, ImageBackground, StatusBar, TouchableOpacity } from 'react-native'
import React from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import business_booking from "../../assets/business_booking.png"


const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');


const BusinessBookingScreen = ({navigation}) => {
  return (
    <View style={{width: WIDTH}} className="flex-1 bg-white relative">
      <ImageBackground
        source={business_booking}
        resizeMode="cover"
        className=""
        style={{flex: 1}}>
        {/* <View
          style={{flex: 1, height: '100%', width: WIDTH}}
          className="bg-black/30 absolute inset-0"
        /> */}

        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />

        {/* Header */}
        <View className="mx-2 flex-row justify-between items-center mt-[50px] mb-[10px]">
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={() => {
           
                navigation.goBack();
                }}>
              <Ionicons name="arrow-back" size={30} color={'white'} />
            </TouchableOpacity>
            {/* <Text className="text-2xl font-semibold text-white">Back</Text> */}
          </View>

          
        </View>

       
      </ImageBackground>
    </View>
  )
}

export default BusinessBookingScreen