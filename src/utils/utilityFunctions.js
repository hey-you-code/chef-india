import axios from "axios";
import { Alert, PermissionsAndroid } from "react-native";
import Geolocation from 'react-native-geolocation-service';
import {GOOGLE_MAPS_API_KEY} from '@env';



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

export const fetchCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission Denied',
        'Location permission is required to fetch the current location.',
      );
      return;
    }
    
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            const { latitude, longitude } = position.coords;
            console.log('Current location:', latitude, longitude);
            resolve({ latitude, longitude });
          },
          error => {
            Alert.alert('Error', 'Could not fetch current location');
            console.error(error);
            reject(error);
          },
          { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
      });
  };

  
  export const reverseGeoCoding = async (latitude, longitude) => {
    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`
      );
  
      const results = response.data.results;
      if (results.length === 0) {
        Alert.alert('Error', 'No address details found.');
        return null;
      }
  
      const addressComponents = results[0].address_components;
      const getComponent = (type) =>
        addressComponents.find((c) => c.types.includes(type))?.long_name || '';
  
      const streetNumber = getComponent('street_number');
      const streetName = getComponent('route');
      const locality = getComponent('locality');
      const premise = getComponent('premise');
      const sublocalityLevel2 = getComponent('sublocality_level_2');
      const sublocalityLevel1 = getComponent('sublocality_level_1');
      const district = getComponent('administrative_area_level_3');
      const city = getComponent('locality');
      const state = getComponent('administrative_area_level_1');
      const country = getComponent('country');
      const postalCode = getComponent('postal_code');
  
      const street = streetNumber ? `${streetNumber} ${streetName}` : streetName;
  
      return {
        address: {
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
            locationName: street || premise,
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      };
    } catch (error) {
      console.error('Reverse Geocoding Error:', error);
      Alert.alert('Error', 'Failed to fetch address details.');
      return null;
    }
  };
  