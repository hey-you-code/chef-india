import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import React, {useMemo, useState} from 'react';
import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Menu from '../components/Menu/Menu';
import {useDispatch, useSelector} from 'react-redux';
import {useGetMenuQuery} from '../features/menu/menuApiSlice';
import { resetMenu } from '../features/slices/chefbookingSlice';

const {width, height} = Dimensions.get('window');

const SpecicCatererScreen = ({navigation}) => {
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();
  const route = useRoute();
  const {name, image} = route.params || {};
  const [page, setPage] = useState(1);
  const limit = 5;

  const menuType = `Catering-${name}`;
  const country = 'India';

  const queryParams = useMemo(
    () => ({menuType, country, page, limit}),
    [menuType, country, page, limit],
  );

  // Fetch menu items from API
  const {
    data: menuData,
    error,
    isLoading,
    isFetching,
  } = useGetMenuQuery(queryParams, {
    // skip: (preview = false || (page === 1 && menuItems.length > 0)),
  });

  return (
    <View style={{width: width, flex: 1, backgroundColor: 'white'}}>
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
            onPress={() => {
              dispatch(resetMenu());
              navigation.goBack()}}
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
            {name}
          </Text>
        </View>
        <View
          style={{position: 'absolute', inset: 0, zIndex: 10}}
          className="bg-black/40"
        />
        <Image
          source={{
            uri: image ?? 'https://i.pinimg.com/736x/7a/2e/6f/7a2e6f3168389da97ede6279f9c89aaf.jpg',
          }}
          className="h-full w-full"
        />
      </View>
      <View className="flex-1  z-20 rounded-t-3xl bg-white top-[-20px]">
        <Menu
          menuType={menuType}
          country={country}
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
            className="bg-green-500 absolute bottom-12 rounded-full flex-row items-center justify-between w-[70%] py-2 px-2 ">
            {/* Left - Stacked Images */}
            <View className="relative flex-row items-center w-[80px] h-[40px]">
              {formData?.menu?.items?.slice(0, 3).map((item, index) => (
                <Image
                  key={item?.id}
                  source={{uri: item?.itemImage}}
                  style={{
                    left: index * 20,
                    borderWidth: 2, // Explicitly define the border width
                    borderColor: '#22c55e',
                  }}
                  className="h-[50px] w-[50px] rounded-full absolute border-2 "
                />
              ))}
            </View>

            {/* Right - Text and Cart Icon */}
            <View className="flex-1 flex-row justify-between items-center px-2 pl-4">
              <Text
                style={{fontFamily: ''}}
                className="text-white text-lg font-medium">
                CHECK OUT{'\n'}
                <Text className="text-sm tracking-wider uppercase font-normal">
                  {formData?.menu?.items?.length} Items
                </Text>
              </Text>
              <View className="bg-white h-[45px] w-[45px] items-center justify-center rounded-full">
                <Ionicons name="chevron-forward" size={24} color="#22c55e" />
              </View>
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
