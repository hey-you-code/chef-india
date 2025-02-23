import React, {useEffect} from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';
import {useDispatch} from 'react-redux';
import {resetFormData} from '../features/slices/chefbookingSlice';

const BookingConfirmation = ({navigation}) => {
  const dispatch = useDispatch();
  useEffect(() => {
    // Navigate back after animation completes
    // dispatch(resetFormData());
    setTimeout(() => {
      navigation.replace('Home'); // Change 'Home' to your actual home screen name
    }, 3000); // Adjust timing based on animation length
  }, []);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../../assets/animation/booking_confirmed.json')} // Add your Lottie file in assets
        autoPlay
        loop={false} // Stops after one play
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  animation: {
    width: 300,
    height: 300,
  },
});

export default BookingConfirmation;
