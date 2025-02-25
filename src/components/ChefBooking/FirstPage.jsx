import React, {useRef} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import DateTimeSelector from '../../utils/DateTimeSelector';
import WhosComingComponent from './WhosComingComponent';
import WhatComponent from './WhatComponent';
import {useSelector} from 'react-redux';
// import {createNotifications} from 'react-native-notificated';

// const {useNotifications} = createNotifications();

const {height: screenHeight, width: screenWidth} = Dimensions.get('window');

// Dummy component for the "What" tab
const DummyComponent = () => {
  return (
    <View style={{padding: 20}}>
      <Text>This is a dummy component.</Text>
    </View>
  );
};

const FirstPage = ({navigation}) => {
  const {formData} = useSelector(state => state.chefBooking);

  console.log("formData: ", formData);

  // const {notify} = useNotifications();

  // Set initial heights:
  // - "When" is initially expanded
  // - "Who" and "What" are initially collapsed.

  const calendarHeight = useRef(new Animated.Value(0)).current;
  const whoHeight = useRef(new Animated.Value(0)).current;
  const whatHeight = useRef(new Animated.Value(320)).current;

  // Expand the "When" section and collapse "Who" and "What"
  const expandWhenSection = () => {
    Animated.parallel([
      Animated.timing(calendarHeight, {
        toValue: screenHeight * 0.65,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(whoHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(whatHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Expand the "Who" section and collapse "When" and "What"
  const expandWhoSection = () => {
    // if (!checkIfWhenComponentValid()) {
    //   return;
    // }
    Animated.parallel([
      Animated.timing(whoHeight, {
        toValue: 220, // Adjust the expanded height as needed
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(calendarHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(whatHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  // Expand the "What" section and collapse "When" and "Who"
  const expandWhatSection = () => {
    Animated.parallel([
      Animated.timing(whatHeight, {
        toValue: 320, // Adjust as needed
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(calendarHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(whoHeight, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const checkIfWhatComponentValid = () => {
    if (formData?.bookingType === 'regular') {
      const hasItems = Object.values(formData?.eventType || {}).some(
        item => item?.numberOfItems > 0,
      );

      if (!hasItems) {
        return false; // If none of them have items, return false
      }

      return true;
    }

    if (
      formData?.bookingType === 'special' ||
      formData?.bookingType === 'catering'
    ) {
      if (formData?.eventType) {
        return true;
      }

      return false;
    }
  };

  const checkIfWhenComponentValid = () => {
    // if(formData?.eveTimings)
    if (!formData?.eventTimings) {
      return false;
    }

    const startDate = formData?.eventTimings?.startDate;

    if (startDate) {
      return true;
    }

    return false;
  };

  const checkIfWhoComponentValid = () => {
    if (!formData?.numberOfGuests) {
      return false;
    }

    return formData?.numberOfGuests > 0;
  };

  const onWhoNext = () => {
    if (
      !checkIfWhoComponentValid ||
      !checkIfWhatComponentValid ||
      !checkIfWhenComponentValid
    ) {
      // notify('error', {
      //   params: {
      //     description: 'Fill all the values ',
      //     title: 'Validations',
      //   },
      //   config: {
      //     isNotch: true,
      //     // notificationPosition: 'center',
      //     // animationConfig: "SlideInLeftSlideOutRight",
      //     // duration: 200,
      //   },
      // });
      return;
    }
  };

  const checkValidation = () => {
    if (
      !checkIfWhoComponentValid() ||
      !checkIfWhatComponentValid() ||
      !checkIfWhenComponentValid()
    ) {
      return false;
    }

    return true;
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {/* What Tab */}
      <TouchableOpacity onPress={expandWhatSection} style={styles.whoButton}>
        <Text style={styles.whenText}>What</Text>
        <Text style={styles.whenSubText}>Type</Text>
      </TouchableOpacity>

      {/* Animated What Container (Initially Collapsed) */}
      <Animated.View style={[styles.whatContainer, {height: whatHeight}]}>
        <WhatComponent />
        <TouchableOpacity
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 6,
          }}
          onPress={() => {
            if (checkIfWhatComponentValid()) {
              expandWhenSection();
            }
          }}
          className={`z-50  absolute w-[25%] items-center bottom-4 right-4 rounded-lg ${
            checkIfWhatComponentValid() ? 'bg-[#000]' : 'bg-[#000]/30'
          }`}>
          <Text className="text-center text-white text-lg">Next</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* When Tab */}
      <TouchableOpacity onPress={expandWhenSection} style={styles.whenButton}>
        <Text style={styles.whenText}>When</Text>
        <Text style={styles.whenSubText}>Time and date</Text>
      </TouchableOpacity>

      {/* Animated Calendar Container (Initially Expanded) */}
      <Animated.View
        style={[styles.animatedContainer, {height: calendarHeight}]}>
        <DateTimeSelector onNext={expandWhoSection} />
      </Animated.View>

      {/* Who Tab */}
      <TouchableOpacity onPress={expandWhoSection} style={styles.whoButton}>
        <Text style={styles.whenText}>Who</Text>
        <Text style={styles.whenSubText}>Guests</Text>
      </TouchableOpacity>

      {/* Animated Who Container (Initially Collapsed) */}
      <Animated.View style={[styles.whoContainer, {height: whoHeight}]}>
        <WhosComingComponent />
      </Animated.View>

      {/* Where Tab for navigation */}
      <TouchableOpacity
        onPress={() => {
          if (!checkValidation()) {
            // if(!checkIfWhoComponentValid()) {
            // notify('error', {
            //   params: {
            //     description: 'Fill the missing values',
            //     title: 'Missing Fields',
            //   },
            //   config: {
            //     isNotch: true,
            //     // notificationPosition: 'center',
            //     // animationConfig: "SlideInLeftSlideOutRight",
            //     // duration: 200,
            //   },
            // });
            return;
            // }
          }
          if (formData?.bookingType === 'catering') {
            navigation.navigate('Catering');
            return;
          }

          if (formData?.bookingType === 'regular') {
            navigation.navigate('Checkout');
            return;
          }
          navigation.navigate('Map');
        }}
        style={{
          // backgroundColor: 'white',
          borderRadius: 16,
          padding: 18,
          marginTop: 16,
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: checkValidation() ? 5 : 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        className={checkValidation() ? 'bg-red-500' : 'bg-red-500/60'}>
        {/* <Text style={styles.whenText}>Next</Text> */}
        <Text className="text-white text-[22px] text-center">Next</Text>
      </TouchableOpacity>

      {/* Spacer at the bottom */}
      <View style={{height: 100}} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    marginVertical: 16,
    width: screenWidth * 0.95,
    alignSelf: 'center', // Use alignSelf for centering in React Native
  },
  whenButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whenText: {
    fontSize: 18,
    color: 'gray',
  },
  whenSubText: {
    fontSize: 18,
    color: 'black',
  },
  animatedContainer: {
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  whoButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  whoContainer: {
    overflow: 'hidden',
    marginTop: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
  },
  whatContainer: {
    overflow: 'hidden',
    marginVertical: 10,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    width: '100%',
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: 'red',
    paddingVertical: 16,
    borderRadius: 10,
    marginTop: 20,
  },
  nextText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default FirstPage;
