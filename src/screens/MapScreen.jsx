import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  Image,
  PermissionsAndroid,
  StyleSheet,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import {GOOGLE_MAPS_API_KEY} from '@env';
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonticons from 'react-native-vector-icons/FontAwesome6';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {
  moveToNextPage,
  resetMenu,
  setFormData,
} from '../features/slices/chefbookingSlice';
import {useBottomSheet} from '../contexts/BottomSheetContext';
import BottomSheet from '@gorhom/bottom-sheet';
import {notify} from 'react-native-notificated';
import {
  fetchCurrentLocation,
  reverseGeoCoding,
} from '../utils/utilityFunctions';
import {useUpdateAddressMutation} from '../features/auth/authApiSlice';
import {setUser} from '../features/slices/userSlice';
import LottieView from 'lottie-react-native';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');

const OPERATED_STATES = ['Assam', 'Telangana'];

const MapScreen = ({navigation}) => {
  const {formData, currentPage} = useSelector(state => state.chefBooking);
  const [authUser, setAuthUser] = useState({});
  const [mapReady, setMapReady] = useState(false);
  const {user} = useSelector(state => state.user);
  const dispatch = useDispatch();

  const [isRegionChanging, setIsRegionChanging] = useState(false);

  // console.log('formData1: ', formData);

  const {address = {}} = user?.user;

  // console.log("addressss:", address)

  // console.log("formdata: ", formData?.customerLocation)

  useEffect(() => {
    dispatch(
      setFormData({
        field: 'customerLocation',
        value: address,
      }),
    );
  }, []);

  // Set a default initial region
  const [region, setRegion] = useState({
    latitude: user?.user?.address?.location?.coordinates[1] || 37.78825,
    longitude: user?.user?.address?.location?.coordinates[0] || -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [fetchingCurrentLocation, setFetchingCurrentLocation] = useState(false);

  // Bottom sheet ref using gorhom bottom sheet
  const bottomSheetRef = useRef(null);
  // Define snap points for bottom sheet
  const snapPoints = useMemo(() => ['45%', '80%'], []);

  // State for additional address details
  const [addressType, setAddressType] = useState('myself'); // 'myself' or 'someone'
  const [building, setBuilding] = useState('');
  const [landmark, setLandmark] = useState('');
  const [yourName, setYourName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const {openBottomSheet, closeBottomSheet} = useBottomSheet();

  // Reference for the MapView
  const mapRef = useRef(null);

  // Get current location using Geolocation
  const getCurrentLocation = async () => {
    try {
      setFetchingCurrentLocation(true);
      const {latitude, longitude} = await fetchCurrentLocation();
      setFetchingCurrentLocation(false);
      if (!latitude && !longitude) {
        notify('error', {
          params: {
            description: 'Failed to fetch location',
            title: 'Current Locations',
          },
          config: {
            isNotch: true,
            notificationPosition: 'top',
            // animationConfig: "SlideInLeftSlideOutRight",
            // duration: 200,
          },
        });
        return;
      }
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      // Animate map to the new region
      // Move the map to the user's location
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    } catch (error) {
      setFetchingCurrentLocation(false);
      notify('error', {
        params: {
          description: 'Failed to fetch location',
          title: 'Current Locations',
        },
        config: {
          isNotch: true,
          notificationPosition: 'top',
          // animationConfig: "SlideInLeftSlideOutRight",
          // duration: 200,
        },
      });
      return;
    }
  };
  // Fetch address details using Google Geocoding API (optional)
  const fetchAddressDetails = async (latitude, longitude) => {
    try {
      const {address} = await reverseGeoCoding(latitude, longitude);
      if (address) {
        dispatch(
          setFormData({
            field: 'customerLocation',
            value: address,
          }),
        );
      } else {
        Alert.alert('Error', 'No address details found.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch address details.');
    } finally {
      // setMapLoading(false);
    }
  };

  useEffect(() => {
    // if (region?.latitude && region?.longitude) {
    //   fetchAddressDetails(region.latitude, region.longitude);
    // }
    if (!user?.user?.address) {
      getCurrentLocation();
    }
  }, [user]);

  const [updateAddress, {isLoading: isUpdatingAddress}] =
    useUpdateAddressMutation();

  // console.log('finalFormData: ', formData?.customerLocation?.houseNumber);

  // console.log(
  //   'formData: ',
  //   JSON.stringify(formData?.customerLocation?.houseNumber, null, 2),
  // );
  const handleNavigation = () => {
    closeBottomSheet();
    navigation.goBack();
  };

  const handlePress = () => {
    openBottomSheet(
      <BottomSheetContent
        handleNavigation={handleNavigation}
        addressType={addressType}
        setAddressType={setAddressType}
        formData={formData}
        user={user}
        dispatch={dispatch}
        closeBottomSheet={closeBottomSheet}
        navigation={navigation}
      />,
      ['25%', '75%'],
      'MAPSCREEN',
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        translucent={true}
        barStyle="dark-content"
        backgroundColor={'transparent'}
      />
      <View
        className="space-x-4"
        style={{
          position: 'absolute',
          top: 50,
          left: 10,
          right: 10,
          zIndex: 20,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="bg-black/80 rounded-full"
          style={{
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Ionicons name="arrow-back" color={'white'} size={24} />
        </TouchableOpacity>
        <View style={{flex: 1}}>
          <Text style={{color: 'black', fontSize: 18}}>Confirm Location</Text>
        </View>
      </View>

      {/* Google Places Autocomplete Header */}
      <View style={[styles.autocompleteContainer, {pointerEvents: 'box-none'}]}>
        <GooglePlacesAutocomplete
          placeholder="Search for area, street name..."
          textInputProps={{
            placeholderTextColor: '#A9A9A9',
            returnKeyType: 'search',
          }}
          listViewProps={{
            keyboardShouldPersistTaps: 'always',
            pointerEvents: 'auto',
          }}
          styles={{
            container: {
              flex: 0,
              marginVertical: 16,
              shadowColor: 'black',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.3,
              shadowRadius: 4,
              elevation: 5,
              borderRadius: 12,
              zIndex: 1000,
            },

            textInputContainer: {
              backgroundColor: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 10,
            },
            textInput: {
              flex: 1,
              height: 50,
              color: '#5d5d5d',
              fontSize: 16,
            },
            listView: {
              backgroundColor: '#fff',
              borderRadius: 10, // Makes the entire suggestion box rounded
              // marginHorizontal: 10, // Optional: adds some margin from the edges
              overflow: 'hidden', // Ensures that the corners are truly rounded
            },
            // Removed custom listView styling to use the default clickable style
          }}
          onPress={(data, details) => {
            try {
              if (details) {
                console.log({description: data.description});
                console.log({location: details.geometry.location});
                // setMapLoading(true);
                const newRegion = {
                  latitude: details.geometry.location.lat,
                  longitude: details.geometry.location.lng,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                };
                setRegion(newRegion);
                if (mapRef.current) {
                  mapRef.current.animateToRegion(newRegion, 1000);
                }
              }
            } catch (error) {
              console.error(error);
            }
          }}
          fetchDetails={true}
          minLength={2}
          debounce={400}
          enablePoweredByContainer={false}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
          }}
          renderRow={data => (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
              }}>
              <Ionicons name="location-outline" size={20} color="#FF3130" />
              <Text style={{marginLeft: 10, fontSize: 16, color: '#333'}}>
                {data.description}
              </Text>
            </View>
          )}
          renderLeftButton={() => (
            <Ionicons
              name="search"
              size={20}
              color="#FF3130"
              style={{marginLeft: 10}}
            />
          )}
        />
      </View>
      {/* <View className="bg-white" style={styles.map} /> */}
      {/* Full Screen Map */}
      <MapView
        initialRegion={region}
        showsCompass={true}
        mapType="standard"
        showsBuildings
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        onRegionChange={useCallback(newRegion => {
          console.log('Changing region...');
          // setIsRegionChanging(true);

          // Only update state if the change is significant
          setRegion(prevRegion => {
            const distanceMoved =
              Math.abs(prevRegion.latitude - newRegion.latitude) +
              Math.abs(prevRegion.longitude - newRegion.longitude);
            return distanceMoved > 0.0001 ? newRegion : prevRegion;
          });
        }, [])}
        onRegionChangeComplete={useCallback(newRegion => {
          fetchAddressDetails(newRegion.latitude, newRegion.longitude);
          // setIsRegionChanging(false);
        }, [])}
        loadingIndicatorColor="#FF3130"
        loadingBackgroundColor="#fff">
        {/* Memoized Marker */}
        {useMemo(
          () => (
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title="Current Location"
              description="This is your location">
              <Image
                source={require('../../assets/marker_pin.png')}
                style={{width: 40, height: 40}}
              />
            </Marker>
          ),
          [region.latitude, region.longitude],
        )}

        {/* Memoized Circle */}
        {useMemo(
          () => (
            <Circle
              center={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              radius={100}
              strokeColor="rgba(0,112,255,0.5)"
              fillColor="rgba(0,112,255,0.2)"
            />
          ),
          [region.latitude, region.longitude],
        )}
      </MapView>

      {/* Use Current Location Button */}
      <TouchableOpacity
        onPress={getCurrentLocation}
        style={styles.currentLocationButton}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Fonticons
            name="location-crosshairs"
            size={20}
            color="#FF3130"
            style={{marginRight: 8}}
          />
          <Text style={styles.currentLocationText}>
            {fetchingCurrentLocation ? 'Loading...' : 'Use Current Location'}
          </Text>
        </View>
      </TouchableOpacity>
      {isRegionChanging ? (
        <View
          className="items-center justify-center"
          style={styles.addressDetailsContainer}>
          <LottieView
            source={require('../../assets/animation/loading_animation.json')} // Replace with your Lottie file
            autoPlay
            loop
            style={{width: 400, height: 100}}
          />
        </View>
      ) : (
        <View style={styles.addressDetailsContainer}>
          {formData?.customerLocation ? (
            <>
              <Text style={{fontSize: 18, fontWeight: '600', color: '#333'}}>
                {region.description
                  ? region.description
                  : formData?.customerLocation?.location?.locationName ||
                    ''}{' '}
                {formData?.customerLocation?.sublocalityLevel2 ||
                  formData?.customerLocation?.sublocalityLevel1 ||
                  formData?.customerLocation?.locality ||
                  ''}
              </Text>
              <Text style={{fontSize: 14, color: '#666', marginTop: 4}}>
                {formData?.customerLocation?.city || ''}{' '}
                {formData?.customerLocation?.state || ''}{' '}
                {formData?.customerLocation?.postalCode || ''}
              </Text>
            </>
          ) : (
            <>
              <Text style={{fontSize: 18, fontWeight: '600', color: '#333'}}>
                {address?.sublocalityLevel2 ||
                  address?.sublocalityLevel1 ||
                  address?.locality ||
                  ''}
              </Text>
              <Text style={{fontSize: 14, color: '#666', marginTop: 4}}>
                {address?.city || ''} {address?.state || ''}{' '}
                {address?.postalCode || ''}
              </Text>
            </>
          )}
          {!OPERATED_STATES.includes(formData?.customerLocation?.state) ? (
            <View
              style={{
                marginTop: 16,
                backgroundColor: '#FF3130',
                paddingVertical: 14,
                borderRadius: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{color: 'white', fontSize: 18, fontWeight: '500'}}>
                Oops we are not here yet!
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                console.log('r1');
                handlePress();
              }}
              style={{
                marginTop: 16,
                backgroundColor: '#FF3130',
                paddingVertical: 14,
                borderRadius: 16,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{color: 'white', fontSize: 18, fontWeight: '500'}}>
                Add more address details
              </Text>
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color="white"
                style={{marginLeft: 8}}
              />
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    // height: 300,
  },
  map: {
    flex: 1,
    // marginTop: 200,
    // height: 300,
    // margin: 6,
    overflow: 'hidden',
    borderRadius: 12,
    zIndex: 1,
    inset: 0,
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 90,
    left: 10,
    right: 10,
    // marginHorizontal: 12,
    zIndex: 1000,
    // elevation: 1000,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 220,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 998,
  },
  currentLocationText: {
    color: '#FF3130',
    fontSize: 16,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  addressDetailsContainer: {
    position: 'absolute',
    bottom: 0,
    height: 200,
    width: WIDTH,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 998,
  },
});

export const BottomSheetContent = ({
  fromMapScreen = true,
  closeBottomSheet,
  handleNavigation,
  navigation,
}) => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.user);
  const {formData} = useSelector(state => state.chefBooking);

  useEffect(() => {
    if (
      user &&
      user.user &&
      !formData?.customerInfo?.name &&
      !formData?.customerInfo?.phoneNumber
    ) {
      dispatch(
        setFormData({
          field: 'customerInfo',
          value: {
            name: user.user.name,
            phoneNumber: user.user.phoneNumber,
          },
        }),
      );
    }
  }, []);

  // Validate that required fields in customerLocation and customerInfo are filled
  const checkValidation = () => {
    const {customerLocation, customerInfo} = formData;

    // console.log("houseNu")

    // Validate customerLocation
    if (
      !customerLocation ||
      !customerLocation.houseNumber?.trim() ||
      !customerLocation.location ||
      !customerLocation.location.coordinates ||
      customerLocation.location.coordinates.length !== 2
    ) {
      return false;
    }

    // Validate customerInfo
    if (
      !customerInfo ||
      !customerInfo.name?.trim() ||
      !customerInfo.phoneNumber?.trim() ||
      !/^\+?\d{10,15}$/.test(customerInfo.phoneNumber)
    ) {
      return false;
    }

    return true;
  };

  const [updateAddress, {isLoading: isUpdatingAddress}] =
    useUpdateAddressMutation();

  const handleSaveAddress = async () => {
    const updatedLocation = formData?.customerLocation;

    try {
      const response = await updateAddress(updatedLocation).unwrap();

      dispatch(
        setUser({
          ...user,
          user: response?.data?.user,
        }),
      );

      dispatch(
        setFormData({
          field: 'customerLocation',
          value: response?.data?.user?.address,
        }),
      );

      if (!fromMapScreen) {
        console.log('r1');
        closeBottomSheet();
        return;
      }

      handleNavigation();
    } catch (error) {
      console.log('error: ', error);
    }
  };

  return (
    <View className="flex-1 p-5 bg-white">
      <Text className="text-xl font-bold mb-4 text-gray-800">
        Additional Address Details
      </Text>

      {/* Address Inputs */}
      <View className="bg-white rounded-2xl shadow-sm">
        <TextInput
          value={formData?.customerLocation?.houseNumber}
          onChangeText={text =>
            dispatch(
              setFormData({
                field: 'customerLocation',
                subfield: 'houseNumber',
                value: text,
              }),
            )
          }
          placeholder="Flat / House No. / Building Name"
          placeholderTextColor="#888"
          className="bg-gray-100 p-4 rounded-xl text-lg mb-3 text-gray-700"
        />

        <View className="relative flex-row items-center">
          <Text className="bg-gray-100 p-4 rounded-xl text-lg flex-1 pr-20 text-gray-700">
            {formData?.customerLocation?.location?.locationName ||
              formData?.customerLocation?.sublocalityLevel2 ||
              formData?.customerLocation?.sublocalityLevel1 ||
              formData?.customerLocation?.locality ||
              ''}
          </Text>
          <TouchableOpacity
            onPress={() => {
              if (!fromMapScreen) {
                closeBottomSheet();
                navigation.navigate('Map');
                return;
              }
              closeBottomSheet();
              return;
            }}
            className="absolute right-2 bg-red-500 rounded-lg px-4 py-2">
            <Text className="text-white text-sm font-medium">Change</Text>
          </TouchableOpacity>
        </View>

        <View className="my-4">
          <Text className="text-lg pl-2 text-gray-400">Enter your Details</Text>
        </View>

        <TextInput
          value={formData?.customerInfo?.name}
          onChangeText={text =>
            dispatch(
              setFormData({
                field: 'customerInfo',
                subfield: 'name',
                value: text,
              }),
            )
          }
          placeholder="Your Name"
          placeholderTextColor="#888"
          className="bg-gray-100 p-4 rounded-xl text-lg mt-3 text-gray-700"
        />

        <TextInput
          value={formData?.customerInfo?.phoneNumber}
          onChangeText={text =>
            dispatch(
              setFormData({
                field: 'customerInfo',
                subfield: 'phoneNumber',
                value: text,
              }),
            )
          }
          placeholder="Phone Number"
          keyboardType="phone-pad"
          placeholderTextColor="#888"
          className="bg-gray-100 p-4 rounded-xl text-lg mt-3 text-gray-700"
        />
      </View>

      {/* Save Address Button */}
      <TouchableOpacity
        disabled={!checkValidation()}
        onPress={() => {
          if (checkValidation()) {
            handleSaveAddress();
          }
        }}
        className={`mt-6 py-4 rounded-2xl items-center shadow-md ${
          checkValidation() ? 'bg-red-500' : 'bg-red-500/60'
        }`}>
        <Text className="text-white text-lg font-semibold">
          {isUpdatingAddress ? 'Saving...' : 'Save Address'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
