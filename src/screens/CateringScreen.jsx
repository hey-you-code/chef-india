import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  PermissionsAndroid,
} from 'react-native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {GOOGLE_MAPS_API_KEY} from '@env';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetFooter,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import Caterer from '../components/ChefBooking/Catering/Caterer';
import Geolocation from 'react-native-geolocation-service';
import axios from 'axios';
import {useDispatch, useSelector} from 'react-redux';
import {notify} from 'react-native-notificated';
import {setFormData} from '../features/slices/chefbookingSlice';
import {
  fetchCurrentLocation,
  reverseGeoCoding,
} from '../utils/utilityFunctions';
import {useFindCateringMutation} from '../features/chefBook/chefBookingApiSlice';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');
const OPERATED_STATES = ['Assam', 'Telangana'];

const CateringScreen = ({navigation}) => {
  const {user} = useSelector(state => state.user);
  const {formData} = useSelector(state => state.chefBooking);

  const {address} = user?.user;

  const [currentAddress, setCurrentAddress] = useState(address);
  const [region, setRegion] = useState({
    latitude: user?.user?.address?.location?.coordinates[1] || 37.78825,
    longitude: user?.user?.address?.location?.coordinates[0] || -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [showHeader, setShowHeader] = useState(true);

  const [availableCaterers, setAvailableCaterers] = useState([]);

  const [fetchingCurrentLocation, setFetchingCurrentLocation] = useState(false);

  const mapRef = useRef(null);

  const dispatch = useDispatch();

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

  const [findCatering, {isLoading: isFindingCatering}] =
    useFindCateringMutation();
  // Fetch address details using Google Geocoding API (optional)
  const fetchAddressDetails = async (latitude, longitude) => {
    try {
      const {address} = await reverseGeoCoding(latitude, longitude);

      try {
        const response = await findCatering({
          latitude,
          longitude,
          startDate: formData?.eventTimings?.startDate,
          endDate: formData?.eventTimings?.endDate,
        }).unwrap();

        setAvailableCaterers(response?.data?.availableChefs);
        console.log('catering: ', response?.data?.availableChefs);
      } catch (error) {
        console.error('error: ', error);
      }

      if (address) {
        setCurrentAddress(address);
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

  //   console.log('currentAddress: ', currentAddress);

  useEffect(() => {
    if (region?.latitude && region?.longitude) {
      fetchAddressDetails(region.latitude, region.longitude);
    }
  }, []);

  const bottomSheetRef = useRef(null);

  // Snap points: 50% (index 0) and 100% (index 1)
  const snapPoints = useMemo(() => [HEIGHT * 0.5, HEIGHT * 0.8], []);

  // Handle backdrop press and prevent closing
  const handleSheetChanges = useCallback(index => {
    if (index === -1) {
      // If the sheet tries to close, reset it to 50%
      bottomSheetRef.current?.snapToIndex(0);
      return;
    }

    if (index > 0) {
      //   bottomSheetRef.current?.snapToIndex(1); // Keep it at max index 1 (80%)
      setShowHeader(false);
      return;
    }

    if (index <= 0) {
      setShowHeader(true);
      return;
    }
  }, []);

  //   console.log('formData: ', formData);
  return (
    <View className="flex-1 bg-white">
      <StatusBar translucent={true} barStyle="dark-content" />

      <View className="h-[55%]">
        {showHeader ? (
          <>
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
                className="bg-black/80 rounded-full"
                style={{
                  width: 40,
                  height: 40,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Ionicons name="arrow-back" color={'white'} size={24} />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.autocompleteContainer,
                {pointerEvents: 'box-none'},
              ]}>
              <GooglePlacesAutocomplete
                placeholder="Search for area, street name..."
                textInputProps={{
                  placeholderTextColor: '#A9A9A9',
                  returnKeyType: 'search',
                  onFocus: () => {
                    handleSheetChanges();
                  },
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
                    width: '90%',
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
                      //   console.log({description: data.description});
                      //   console.log({location: details.geometry.location});
                      // setMapLoading(true);
                      const newRegion = {
                        latitude: details.geometry.location.lat,
                        longitude: details.geometry.location.lng,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
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
                      paddingVertical: 5,
                    }}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#FF3130"
                    />
                    <Text style={{marginLeft: 6, fontSize: 16, color: '#333'}}>
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

            <TouchableOpacity
              disabled={fetchingCurrentLocation}
              onPress={getCurrentLocation}
              style={{
                top: 120,
                right: 30,
                zIndex: 100,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 15,
              }}
              className={
                fetchingCurrentLocation
                  ? 'absolute bg-white/60 p-2 rounded-lg'
                  : 'absolute bg-white p-2 rounded-lg'
              }>
              <Ionicons
                name="paper-plane"
                size={32}
                color={fetchingCurrentLocation ? 'red' : '#374151'}
              />
            </TouchableOpacity>
          </>
        ) : null}
        <MapView
          initialRegion={region}
          showsCompass={true}
          mapType="standard"
          showsBuildings
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          onRegionChange={newRegion => setRegion(newRegion)}
          onRegionChangeComplete={newRegion =>
            fetchAddressDetails(newRegion.latitude, newRegion.longitude)
          }
          loadingIndicatorColor="#FF3130"
          loadingBackgroundColor="#fff">
          <Marker
            coordinate={{
              latitude: region?.latitude,
              longitude: region?.longitude,
            }}
            title={`Location`}
            description="This is your location">
            <Image
              source={require('../../assets/marker_pin.png')}
              style={{width: 40, height: 40, resizeMode: 'contain'}}
            />
          </Marker>
          <Circle
            center={{
              latitude: region?.latitude,
              longitude: region?.longitude,
            }}
            radius={100}
            strokeColor="rgba(0,112,255,0.5)"
            fillColor="rgba(0,112,255,0.2)"
          />
        </MapView>
      </View>
      {/* Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0} // Start at 50%
        snapPoints={snapPoints}
        enablePanDownToClose={false} // Prevent closing completely
        backgroundStyle={{
          borderTopLeftRadius: 30, // Adjust radius here
          borderTopRightRadius: 30, // Adjust radius here
          backgroundColor: 'white',
          //   zIndex: 100
        }}
        onChange={handleSheetChanges}
        backdropComponent={props => (
          <BottomSheetBackdrop
            {...props}
            pressBehavior="collapse" // Prevent closing on backdrop press
            disappearsOnIndex={0} // Ensure it does not disappear
            onPress={() => bottomSheetRef.current?.snapToIndex(0)} // Reset to 50% on backdrop press
          />
        )}>
        <View style={{flex: 1}}>
          <View className="px-4">
            <Text style={{fontSize: 16, fontWeight: '600', color: '#333'}}>
              {region.description
                ? region.description
                : currentAddress?.location?.locationName || ''}{' '}
              {currentAddress?.sublocalityLevel2 ||
                currentAddress?.sublocalityLevel1 ||
                currentAddress?.locality ||
                ''}
            </Text>
            <Text style={{fontSize: 12, color: '#666', marginTop: 4}}>
              {currentAddress?.city || ''} {currentAddress?.state || ''}{' '}
              {currentAddress?.postalCode || ''}
            </Text>
          </View>
          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            <Caterer
              name={"Vishal's Catering"}
              distance={2000}
              navigation={navigation}
            />
            {/* {availableCaterers.length > 0 ? (
              availableCaterers.map(item => (
                <Caterer
                  key={item?._id}
                  name={item?.name}
                  distance={item?.distance}
                  navigation={navigation}
                />
              ))
            ) : (
              <View className="m-4">
                <Text
                  style={{fontFamily: 'Anton'}}
                  className="text-gray-400 text-2xl text-left">
                  NO CATERINGS AVAILABLE IN YOUR LOCATION. 
                  {'\n'}
                  TRY CHANGING YOUR LOCATION
                </Text>
              </View>
            )} */}
            <View style={{minHeight: HEIGHT / 2}} />
          </BottomSheetScrollView>
        </View>
      </BottomSheet>
    </View>
  );
};

export default CateringScreen;

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
    zIndex: 0,
  },
  autocompleteContainer: {
    position: 'absolute',
    top: 35,
    left: 60,
    right: 10,
    // marginHorizontal: 12,
    zIndex: 1000,
    // elevation: 1000,
    width: WIDTH * 0.9,
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
  bottomSheet: {
    position: 'absolute',
    zIndex: 0,
  },
  bottomSheetContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});
