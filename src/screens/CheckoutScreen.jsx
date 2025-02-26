import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import {useBookChefMutation} from '../features/chefBook/chefBookingApiSlice';
import {createNotifications, notify} from 'react-native-notificated';
import LottieView from 'lottie-react-native';
import loading_animation from '../../assets/animation/loading_animation.json';
import AddressPreview from '../components/AddressPreview';

// NativeWind allows us to use "className" for styling (ensure it is configured properly)
const {width: WIDTH} = Dimensions.get('window');

const CheckoutScreen = ({navigation}) => {
  // Get booking details from Redux. Here we assume formData is an array.
  const {formData = {}} = useSelector(state => state.chefBooking);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const booking = Array.isArray(formData) ? formData[0] : formData || {};

  if (!booking) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-lg text-gray-800">
          No booking data available.
        </Text>
      </View>
    );
  }

  const eventType = booking?.eventType || {};
  const eventTimings = booking?.eventTimings || {};
  const numberOfGuests = booking?.numberOfGuests || 1;

  // Define base prices per item for each meal
  const basePrices = {
    breakfast: 40,
    lunch: 50,
    snacks: 50,
    dinner: 60,
  };

  // Helper: parse date string (assumes YYYY-MM-DD format)
  const parseDate = dateStr => (dateStr ? new Date(dateStr) : null);
  const startDate = parseDate(eventTimings?.startDate || '');
  const endDate = parseDate(eventTimings?.endDate || '');

  // If endDate is null, use only startDate
  const diffTime = endDate ? Math.abs(endDate - startDate) : 0;
  const diffDays = endDate
    ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    : 1;

  const guests = numberOfGuests || 1;

  // Calculate breakdown for each meal
  let breakdown = [];
  let baseCost = 0;
  Object.keys(basePrices).forEach(meal => {
    if (eventType?.[meal] && eventType?.[meal]?.numberOfItems) {
      const numItems = eventType[meal].numberOfItems;
      const mealPrice = basePrices[meal];
      const mealCost = numItems * mealPrice * guests * diffDays;
      breakdown.push({
        meal,
        numItems,
        mealPrice,
        guests,
        days: diffDays,
        mealCost,
      });
      baseCost += mealCost;
    }
  });

  // Processing fee (10% of base cost)
  const processingFee = Math.ceil(baseCost * 0.1);
  const totalAmount = baseCost + processingFee;

  const [
    bookChef,
    {
      isLoading: isBookingChef,
      isError: isBookingError,
      isSuccess: isBookingDone,
    },
  ] = useBookChefMutation();

  const handlePayment = async () => {
    try {
      // create Order
      setInitiatingPayment(true);
      const response = await axios.post(
        'https://admin.cheffindia.com/api/v1/admin/payment/createOrder',
        // 'http://10.0.2.2:9100/api/v1/auth/chef/createOrder',
        {
          amount: totalAmount,
          ...formData,
        },
      );

      // const data = response?.data;
      setInitiatingPayment(false);
      console.log('data: ', response?.data?.data?.order);

      const order = response?.data?.data?.order;

      var options = {
        description: 'Payment for Chef Registration',
        // image: 'https://i.imgur.com/3g7nmJC.jpg',
        currency: 'INR',
        key: 'rzp_live_FZbdnnMty8PClJ',
        amount: order.amount,
        name: 'Chef India',
        order_id: order.id, //Replace this with an order_id created using Orders API.
        prefill: {
          email: 'indiacheff@gmail.com',
          name: 'Cheff India',
        },
        theme: {color: '#53a20e'},
      };
      RazorpayCheckout.open(options)
        .then(async data => {
          // Payment Success - Verify payment with backend
          console.log('Payment Success: ', data);

          const verifyResponse = await axios.post(
            'https://admin.cheffindia.com/api/v1/admin/payment/verifyPayment',
            // 'http://10.0.2.2:9100/api/v1/auth/chef/verifyPayment', // Replace with your verification endpoint
            {
              paymentDetails: {
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
              },
              ...formData,
            },
          );

          console.log('Verification Response: ', verifyResponse.data);

          if (verifyResponse.data.success) {
            navigation.navigate('BookingConfirmation');
            // alert('Payment verified successfully!');
            // dispatch(
            //   setUser({
            //     user: verifyResponse?.data?.data?.user,
            //     accessToken: verifyResponse?.data?.data?.accessToken,
            //   }),
            // );
          } else {
            notify('error', {
              params: {
                description: 'Payment Verification Failed',
                title: 'Payment Verification',
              },
              config: {
                isNotch: true,
                notificationPosition: 'center',
                // animationConfig: "SlideInLeftSlideOutRight",
                // duration: 200,
              },
            });
          }
        })
        .catch(error => {
          setInitiatingPayment(false);
          notify('error', {
            params: {
              description: 'Payment Failed',
              title: 'Payment',
            },
            config: {
              isNotch: true,
              notificationPosition: 'center',
              // animationConfig: "SlideInLeftSlideOutRight",
              // duration: 200,
            },
          });
        });
    } catch (error) {
      console.log('Something went wrong while payment', error);
    }
  };

  console.log('data to be sent: ', JSON.stringify(formData, null, 2));

  const handleDummyPayment = async () => {
    try {
      console.log('Request started...');

      const response = await bookChef({...formData}).unwrap();

      console.log('Booking Successful!', response);

      if (response?.success) {
        navigation.navigate('BookingConfirmation');
      }
    } catch (error) {
      console.log(
        'Booking Failed:',
        error?.data?.data || error?.message || error,
      );
      notify('error', {
        params: {
          description: 'No Chefs available.',
          title: 'Available Chefs',
          style: {
            multiline: 3,
          },
        },
        config: {
          isNotch: true,

          // notificationPosition: 'center',
          // animationConfig: "SlideInLeftSlideOutRight",
          // duration: 200,
        },
      });
    }
  };

  return (
    <View className="flex-1 bg-white relative">
      <StatusBar
        translucent={true}
        barStyle="dark-content"
        backgroundColor="transparent"
      />

      {isBookingChef ? (
        <View style={styles.container}>
          <View style={styles.loadingContainer}>
            <LottieView
              source={loading_animation} // Use a Lottie loading animation
              autoPlay
              loop
              style={styles.loadingAnimation}
            />
            <Text style={styles.loadingText}>Booking in progress...</Text>
          </View>
        </View>
      ) : (
        <>
          <View className="flex-row items-start px-4 pt-12 pb-2 bg-white">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={30} color="black" />
            </TouchableOpacity>
            <View className="ml-3 ">
              <View className="mb-2">
                <Text
                  style={{fontFamily: 'Roboto Regular'}}
                  className="text-lg text-gray-400">
                  Checkout
                </Text>
              </View>
              <Text style={{fontFamily: 'Roboto Regular'}} className="text-md">Your Booking will be confirmed for</Text>
              <AddressPreview navigation={navigation} />
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{paddingBottom: 120}}
            className="px-4 bg-gray-50">
            <Text className="text-xl font-bold text-gray-800 my-4">
              Cost Breakdown
            </Text>
            {breakdown.map((item, index) => (
              <View
                key={index}
                className="flex-row justify-between border-b border-gray-300 py-2">
                <Text className="text-base font-semibold text-gray-600">
                  {item.meal.charAt(0).toUpperCase() + item.meal.slice(1)}:
                </Text>
                <Text className="text-base text-gray-800">
                  ₹{item.mealPrice} x {item.numItems} x {item.guests} x{' '}
                  {item.days} = ₹{item.mealCost}
                </Text>
              </View>
            ))}
            <View className="flex-row justify-between border-b border-gray-300 py-2 mt-4">
              <Text className="text-base font-semibold text-gray-600">
                Base Cost:
              </Text>
              <Text className="text-base text-gray-800">₹{baseCost}</Text>
            </View>
            <View className="flex-row justify-between  py-2 mt-2">
              <Text className="text-base font-semibold text-gray-600">
                Processing Fee (10%):
              </Text>
              <Text className="text-base text-gray-800">₹{processingFee}</Text>
            </View>
            <View className="flex-row justify-between mt-4 pt-2 border-t border-gray-400">
              <Text className="text-lg font-bold text-gray-900">
                Total Amount:
              </Text>
              <Text className="text-lg font-bold text-gray-900">
                ₹{totalAmount}
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity
            onPress={handleDummyPayment}
            className="absolute bottom-6 left-4 right-4 bg-green-500 py-4 rounded-2xl flex-row items-center justify-center shadow-lg">
            <Ionicons name="cart-outline" size={24} color="white" />
            <Text className="ml-3 text-white text-lg font-bold">
              {isBookingChef
                ? 'Booking...'
                : isBookingDone
                ? 'Booking Confirmed'
                : 'Pay Now'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 10,
    color: 'gray',
  },
});
