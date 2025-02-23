import {View, Text, Image, TouchableOpacity, Dimensions, SafeAreaView} from 'react-native';
import React from 'react';
import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Menu from '../components/Menu/Menu';
import { useSelector } from 'react-redux';

const {width, height} = Dimensions.get('window');

const SpecicCatererScreen = ({navigation}) => {
  const {formData} = useSelector(state => state.chefBooking)
  // const route = useRoute();
  // const {} = route.params || {}
  return (
    <View  style={{width: width, flex: 1, backgroundColor: "white"}}>
      <View className="w-full h-[20%] relative">
        <View
          className="space-x-4"
          style={{
            position: 'absolute',
            top: 60,
            left: 10,
            right: 10,
            zIndex: 20,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="bg-white rounded-full"
            style={{
              width: 40,
              height: 40,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Ionicons name="arrow-back" color={'black'} size={24} />
          </TouchableOpacity>
          <Text style={{fontFamily: 'Anton'}} className="text-3xl text-white">
            PATEL CATERINGS
          </Text>
        </View>
        <View style={{position: 'absolute', inset: 0, zIndex: 10}} className="bg-black/40" />
        <Image
          source={{
            uri: 'https://i.pinimg.com/736x/7a/2e/6f/7a2e6f3168389da97ede6279f9c89aaf.jpg',
          }}
          className="h-full w-full"
        />
      </View>
      <View className="flex-1  z-20 rounded-t-3xl bg-white top-[-20px]">
      <Menu
            menuType={"special"}
            country={"India"}
            actionApplicable={true}
            preview={false}
          />

{formData?.menu?.items?.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              console.log('Checkout: ', JSON.stringify(formData, null, 2));
              navigation.navigate('SpecialCheckout');
            }}
            style={{zIndex: 999, alignSelf: 'center'}}
            className="bg-green-500 absolute bottom-12 rounded-[16px] flex-row items-center justify-start w-[90%] py-4 px-6 space-x-4">
            <Ionicons name="cart" size={24} color="white" />
            <Text className="text-white text-xl font-semibold">
              Check Out{' '}
              <Text className="">{formData?.menu?.items?.length}</Text> Items
            </Text>
            <View className="absolute w-[60px] h-full right-12 top-3">
              {formData?.menu?.items?.slice(0, 3).map((item, index) => (
                <View key={item.id} className="">
                  {item?.itemImage && (
                    <Image
                      key={item?.id}
                      source={{uri: item?.itemImage}}
                      style={{left: 2 + index * 20}}
                      className="h-[40px] w-[40px] rounded-full absolute border-2 border-white"
                    />
                  )}
                </View>
              ))}
            </View>
          </TouchableOpacity>
        )}
      </View>
      {/* <View className="bg-black">
        <Text>HELLO</Text>
      </View> */}
    </View>
  );
};

export default SpecicCatererScreen;
