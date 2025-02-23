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

const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');
const OPERATED_STATES = ['Assam', 'Telangana'];

const CateringScreen = ({navigation}) => {
  const {user} = useSelector(state => state.user);
  const {formData} = useSelector(state => state.chefBooking);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [showHeader, setShowHeader] = useState(true);
  const [fetchingCurrentLocation, setFetchingCurrentLocation] = useState(false);

  const mapRef = useRef(null);

  const dispatch = useDispatch();

  // Request location permission (Android)
  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Location Access Permission',
          message: 'We need access to your location to provide this feature.',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  // Get current location using Geolocation
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to fetch the current location.',
      );
      return;
    }
    // setMapLoading(true);
    setFetchingCurrentLocation(true);
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setFetchingCurrentLocation(false);
        console.log('current location', latitude, longitude);
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
        // Wait a moment for the region to update
        // setTimeout(() => {
        //   // setMapLoading(false);
        // }, 1000);
      },
      error => {
        setFetchingCurrentLocation(false);

        Alert.alert('Error', 'Could not fetch current location');
        console.error(error);
        // setMapLoading(false);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // Update region when map stops moving (and turn off loading state)

  // Fetch address details using Google Geocoding API (optional)
  const fetchAddressDetails = async (latitude, longitude) => {
    try {
      // setMapLoading(true);
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
      );
      const results = response.data.results;
      if (results.length > 0) {
        const addressComponents = results[0].address_components;
        const streetNumber =
          addressComponents.find(c => c.types.includes('street_number'))
            ?.long_name || '';
        const streetName =
          addressComponents.find(c => c.types.includes('route'))?.long_name ||
          '';
        const locality =
          addressComponents.find(c => c.types.includes('locality'))
            ?.long_name || '';
        const premise =
          addressComponents.find(c => c.types.includes('premise'))?.long_name ||
          '';
        const sublocalityLevel2 =
          addressComponents.find(c => c.types.includes('sublocality_level_2'))
            ?.long_name || '';
        const sublocalityLevel1 =
          addressComponents.find(c => c.types.includes('sublocality_level_1'))
            ?.long_name || '';
        const district =
          addressComponents.find(c =>
            c.types.includes('administrative_area_level_3'),
          )?.long_name || '';
        const city = addressComponents.find(c =>
          c.types.includes('locality'),
        )?.long_name;
        const state = addressComponents.find(c =>
          c.types.includes('administrative_area_level_1'),
        )?.long_name;
        const country =
          addressComponents.find(c => c.types.includes('country'))?.long_name ||
          '';
        const postalCode = addressComponents.find(c =>
          c.types.includes('postal_code'),
        )?.long_name;
        const street = streetNumber
          ? `${streetNumber} ${streetName}`
          : streetName;

        // if (!OPERATED_STATES.includes(state)) {
        //   notify('warning', {
        //     params: {
        //       description: 'Oops!,We are not here yet',
        //       title: 'Available locations',
        //     },
        //     config: {
        //       isNotch: true,
        //       notificationPosition: 'center',
        //       // animationConfig: "SlideInLeftSlideOutRight",
        //       // duration: 200,
        //     },
        //   });
        // }

        dispatch(
          setFormData({
            field: 'customerLocation',
            value: {
              premise,
              locality,
              sublocalityLevel2,
              sublocalityLevel1,
              city,
              district,
              state,
              country,
              postalCode,
              location: {
                locationName: street || region?.description || premise,
                type: 'Point',
                coordinates: [longitude, latitude],
              },
            },
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

  console.log('formData: ', formData);
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
              latitude: region.latitude,
              longitude: region.longitude,
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
              latitude: region.latitude,
              longitude: region.longitude,
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
                : formData?.customerLocation?.location?.locationName || ''}{' '}
              {formData?.customerLocation?.sublocalityLevel2 ||
                formData?.customerLocation?.sublocalityLevel1 ||
                formData?.customerLocation?.locality ||
                ''}
            </Text>
            <Text style={{fontSize: 12, color: '#666', marginTop: 4}}>
              {formData?.customerLocation?.city || ''}{' '}
              {formData?.customerLocation?.state || ''}{' '}
              {formData?.customerLocation?.postalCode || ''}
            </Text>
          </View>
          <BottomSheetScrollView showsVerticalScrollIndicator={false}>
            <Caterer navigation={navigation} />
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
