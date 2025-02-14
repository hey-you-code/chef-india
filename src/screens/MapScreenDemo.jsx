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
  TextInput,
} from 'react-native';
import {GOOGLE_MAPS_API_KEY} from '@env';
import MapView, {Circle} from 'react-native-maps';
import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonticons from 'react-native-vector-icons/FontAwesome6';
import {useDispatch, useSelector} from 'react-redux';
import {setFormData} from '../features/slices/chefbookingSlice';
import axios from 'axios';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geolocation from 'react-native-geolocation-service';
// Import gorhom bottom sheet
import BottomSheet from '@gorhom/bottom-sheet';
import {useBottomSheet} from '../contexts/BottomSheetContext';

const MapScreenDemo = ({navigation}) => {
  const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');
  const route = useRoute();
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const {formData} = useSelector(state => state.chefBooking);
  const [location, setLocation] = useState(null);
  const {user} = useSelector(state => state.user);

  // Region state for map center
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

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

  // Handler for "Use Current Location" button
  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to fetch the current location.',
      );
      return;
    }

    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        // moveToLocation({latitude, longitude, description: ''});
        setRegion({
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      },
      error => {
        Alert.alert('Error', 'Could not fetch current location');
        console.error(error);
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  // Fetch address details using Google Geocoding API
  const fetchAddressDetails = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`,
      );

      const results = response.data.results;

      console.log("results: ", results);

      if (results.length > 0) {
        const addressComponents = results[0].address_components;
        const streetNumber =
          addressComponents.find(c => c.types.includes('street_number'))
            ?.long_name || '';
        const streetName =
          addressComponents.find(c => c.types.includes('route'))?.long_name ||
          '';
        const city = addressComponents.find(c =>
          c.types.includes('locality'),
        )?.long_name;
        const state = addressComponents.find(c =>
          c.types.includes('administrative_area_level_1'),
        )?.long_name;
        const postalCode = addressComponents.find(c =>
          c.types.includes('postal_code'),
        )?.long_name;

        const street = streetNumber
          ? `${streetNumber} ${streetName}`
          : streetName;

        dispatch(
          setFormData({
            field: 'customerLocation',
            value: {
              city,
              state,
              postalCode,
              location: {
                locationName: street || region?.description,
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
    }
  };

  // Update region when map stops moving
  const onRegionChangeComplete = newRegion => {
    setRegion(newRegion);
  };

  useEffect(() => {
    if (region?.latitude && region?.longitude) {
      fetchAddressDetails(region.latitude, region.longitude);
    }
  }, [region]);

  const moveToLocation = ({latitude, longitude, description}) => {
    mapRef.current.animateToRegion({
      latitude,
      longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.0121,
      description,
    });
  };

  // Handler for saving the additional address details from bottom sheet
  const handleSaveAddress = () => {
    closeBottomSheet();
  };

  // Render a text input with a clear (cross) icon
  const renderTextInput = (value, setValue, placeholder) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 10,
          marginVertical: 5,
        }}>
        <TextInput
          style={{flex: 1, height: 40}}
          placeholder={placeholder}
          value={value}
          onChangeText={setValue}
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={() => setValue('')}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  // Optional: Callback to handle bottom sheet changes
  const handleSheetChanges = useCallback(index => {
    // You can handle events when bottom sheet changes (if needed)
    // console.log("Bottom sheet index:", index);
  }, []);

  const handlePress = () => {
    openBottomSheet(
      <BottomSheetContent
        addressType={addressType}
        setAddressType={setAddressType}
        formData={formData}
        user={user}
        dispatch={dispatch}
        closeBottomSheet={closeBottomSheet}
        handleSaveAddress={handleSaveAddress}
      />,

      ['25%', '75%'],
      'EDITPROFILE',
    );
  };

  return (
    <View className="bg-white" style={{flex: 1, height: HEIGHT}}>
      {/* Header */}
      <View
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
          style={{
            width: 40,
            height: 40,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Ionicons name="arrow-back" color={'black'} size={24} />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            //  alignItems: 'center'
          }}>
          <Text style={{color: 'black', fontSize: 18}}>Confirm Location</Text>
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          top: 100,
          left: 0,
          right: 0,
          zIndex: 30,
          marginHorizontal: 10,
        }}>
        <GooglePlacesAutocomplete
          placeholder="Search for area, street name..."
          textInputProps={{
            placeholderTextColor: '#A9A9A9',
            returnKeyType: 'search',
          }}
          onPress={(data, details) => {
            if (details) {
              const {lat, lng} = details.geometry.location;
            //   moveToLocation({
            //     latitude: lat,
            //     longitude: lng,
            //     description: data?.description,
            //   });
              setRegion({
                latitude: lat,
                longitude: lng,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
                description: data?.description,
              });
            }
          }}
          fetchDetails={true}
          enablePoweredByContainer={false}
          minLength={2}
          debounce={400}
          query={{
            key: GOOGLE_MAPS_API_KEY,
            language: 'en',
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
              backgroundColor: 'white',
              borderRadius: 10,
            },
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

      <View className="h-[200px] mt-[200px]" style={{}}>
        <MapView
          ref={mapRef}
          style={{flex: 1, height: 200}}
          initialRegion={region}
          region={{}}
          onRegionChangeComplete={onRegionChangeComplete}
          >
          <Circle
            center={{latitude: region?.latitude, longitude: region?.longitude}}
            radius={50}
            strokeColor="rgba(0, 112, 255, 0.5)"
            fillColor="rgba(0, 112, 255, 0.2)"
          />
        </MapView>

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: -14,
            marginTop: -25,
          }}>
          <Image
            source={require('../../assets/marker_pin.png')}
            style={{width: 28, height: 50}}
          />
        </View>
      </View>

      <View style={{position: 'absolute', bottom: 210, alignSelf: 'center', zIndex: 999}}>
        <TouchableOpacity
          onPress={getCurrentLocation}
          style={{
            width: 250,
            backgroundColor: 'white',
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            alignItems: 'center',
          }}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Fonticons
              name="location-crosshairs"
              size={20}
              color="#FF3130"
              style={{marginRight: 8}}
            />
            <Text style={{color: '#FF3130', fontSize: 16}}>
              Use Current Location
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Address Details & Confirm Button */}
      <View
        style={{
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
        }}>
        <Text style={{fontSize: 18, fontWeight: '600', color: '#333'}}>
          {region.description
            ? region.description
            : formData?.customerLocation?.location?.locationName ||
              'Random Street'}
        </Text>
        <Text style={{fontSize: 14, color: '#666', marginTop: 4}}>
          {formData?.customerLocation?.city || ''}{' '}
          {formData?.customerLocation?.state || ''}{' '}
          {formData?.customerLocation?.postalCode || ''}
        </Text>
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
      </View>

      {/* Gorhom Bottom Sheet for Additional Address Details */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0} // Initially closed
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        enablePanDownToClose={true}>
        <View style={{flex: 1, padding: 16}}>
          <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 12}}>
            Additional Address Details
          </Text>

          {/* Radio options for "For myself" or "For someone else" */}
          <View style={{flexDirection: 'row', marginBottom: 16}}>
            <TouchableOpacity
              onPress={() => setAddressType('myself')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 16,
              }}>
              <Ionicons
                name={
                  addressType === 'myself'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={20}
                color={addressType === 'myself' ? '#FF3130' : '#888'}
              />
              <Text style={{marginLeft: 6}}>For myself</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setAddressType('someone')}
              style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons
                name={
                  addressType === 'someone'
                    ? 'radio-button-on'
                    : 'radio-button-off'
                }
                size={20}
                color={addressType === 'someone' ? '#FF3130' : '#888'}
              />
              <Text style={{marginLeft: 6}}>For someone else</Text>
            </TouchableOpacity>
          </View>

          {/* Fields: Flat/House no /Building name & Landmark */}
          {renderTextInput(
            building,
            setBuilding,
            'Flat/House no / Building name',
          )}
          {renderTextInput(landmark, setLandmark, 'Landmark')}

          {/* Divider */}
          <View
            style={{height: 1, backgroundColor: '#ccc', marginVertical: 16}}
          />

          {/* Fields: Your name & Your phone number */}
          {renderTextInput(yourName, setYourName, 'Your Name')}
          {renderTextInput(phoneNumber, setPhoneNumber, 'Your Phone Number')}

          {/* Save Address Button */}
          <TouchableOpacity
            onPress={handleSaveAddress}
            style={{
              marginTop: 24,
              backgroundColor: '#FF3130',
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
            }}>
            <Text style={{color: 'white', fontSize: 18, fontWeight: '500'}}>
              Save Address
            </Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

export default MapScreenDemo;

const BottomSheetContent = ({
  addressType,
  setAddressType,
  formData,
  user,
  dispatch,
  closeBottomSheet,
  handleSaveAddress,
}) => {
  return (
    <View className="flex-1 p-5 bg-white">
      <Text className="text-xl font-bold mb-4 text-gray-800">
        Additional Address Details
      </Text>

      {/* Radio Buttons for Address Type */}
      <View key={addressType} className="flex-row mb-4">
        {['myself', 'someone'].map(type => (
          <TouchableOpacity
            key={type}
            onPress={() => setAddressType(type)}
            className="flex-row items-center mr-6 py-2">
            <Ionicons
              name={
                addressType === type ? 'radio-button-on' : 'radio-button-off'
              }
              size={22}
              color={addressType === type ? '#FF3130' : '#AAA'}
            />
            <Text className="ml-2 text-lg text-gray-700">
              {type === 'myself' ? 'For myself' : 'For someone else'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Address Inputs */}
      <View className="bg-white rounded-2xl shadow-sm">
        <TextInput
          value={formData?.customerLocation?.houseNumber}
          onChangeText={text =>
            dispatch(setFormData({field: 'customerLocation', value: text}))
          }
          placeholder="Flat / House No. / Building Name"
          placeholderTextColor="#888"
          className="bg-gray-100 p-4 rounded-xl text-lg mb-3 text-gray-700"
        />

        <View className="relative flex-row items-center">
          <TextInput
            value={formData?.customerLocation?.location?.locationName}
            placeholder="Location Name"
            placeholderTextColor="#888"
            className="bg-gray-100 p-4 rounded-xl text-lg flex-1 pr-20 text-gray-700"
          />
          <TouchableOpacity
            onPress={() => closeBottomSheet()}
            className="absolute right-2 bg-red-500 rounded-lg px-4 py-2">
            <Text className="text-white text-sm font-medium">Change</Text>
          </TouchableOpacity>
        </View>
        <View className="my-4">
          <Text className="text-lg pl-2 text-gray-400">Enter your Details</Text>
        </View>

        <TextInput
          value={user?.user?.name}
          onChangeText={text =>
            dispatch(setFormData({field: 'customerInfo', value: {name: text}}))
          }
          placeholder="Your Name"
          placeholderTextColor="#888"
          className="bg-gray-100 p-4 rounded-xl text-lg mt-3 text-gray-700"
        />

        <TextInput
          value={user?.user?.phoneNumber}
          onChangeText={text =>
            dispatch(
              setFormData({field: 'customerInfo', value: {phoneNumber: text}}),
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
        onPress={handleSaveAddress}
        className="mt-6 bg-red-500 py-4 rounded-2xl items-center shadow-md">
        <Text className="text-white text-lg font-semibold">Save Address</Text>
      </TouchableOpacity>
    </View>
  );
};
