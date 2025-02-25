import React, {useState} from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import RazorpayCheckout from 'react-native-razorpay';
import axios from 'axios';
import {takeActionForMenuItems} from '../features/slices/chefbookingSlice';
import {useBookChefMutation} from '../features/chefBook/chefBookingApiSlice';
import LottieView from 'lottie-react-native';
import loading_animation from '../../assets/animation/loading_animation.json';
import {notify} from 'react-native-notificated';
import AddressPreview from '../components/AddressPreview';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');

const SpecialCheckoutScreen = ({navigation}) => {
  // Retrieve the formData from your Redux store
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const {menu, bookingType, customerLocation, customerInfo, catering} =
    formData || {};

  const numberOfGuests = parseInt(formData?.numberOfGuests) || 1;
  const numberOfDays = 1;

  // Count different categories
  const numberOfStarters = menu?.numberOfItems['starters']
    ? parseInt(menu?.numberOfItems['starters'])
    : 0;
  const numberOfMainCourse = menu?.numberOfItems['main course']
    ? parseInt(menu?.numberOfItems['main course'])
    : 0;
  const numberOfDesserts = menu?.numberOfItems['desserts']
    ? parseInt(menu?.numberOfItems['desserts'])
    : 0;
  const numberOfDrinks = menu?.numberOfItems['drinks']
    ? parseInt(menu?.numberOfItems['drinks'])
    : 0;
  // const numberOfSnacks = menu?.numberOfItems['snacks'] ?parseInt(menu?.numberOfItems['snacks']) : 0

  // Base prices
  const basePrice = {starters: 4, mainCourse: 9, desserts: 4, drinks: 5};

  const amountPerPerson =
    numberOfStarters * basePrice.starters +
    numberOfMainCourse * basePrice.mainCourse +
    numberOfDesserts * basePrice.desserts +
    numberOfDrinks * basePrice.drinks;

  // Calculate pricing when catering is false
  const startersTotal =
    numberOfStarters * basePrice.starters * numberOfGuests * numberOfDays;
  const mainCourseTotal =
    numberOfMainCourse * basePrice.mainCourse * numberOfGuests * numberOfDays;
  const dessertsTotal =
    numberOfDesserts * basePrice.desserts * numberOfGuests * numberOfDays;
  const drinksTotal =
    numberOfDrinks * basePrice.drinks * numberOfGuests * numberOfDays;
  // const snacksTotal = numberOfSnacks * numberOfGuests * numberOfDays;
  const totalAmountNonCatering =
    startersTotal + mainCourseTotal + dessertsTotal + drinksTotal;
  const processingFeeNonCatering = totalAmountNonCatering * 0.08;
  const finalTotalNonCatering =
    totalAmountNonCatering + processingFeeNonCatering;

  // Get the list of ordered items.
  const items = menu?.items || [];

  // Calculate the total amount by summing price * itemCount for each item.
  // Ensure that we convert the price (which is a string) into a number.

  const amount = items.reduce((sum, item) => {
    const price = parseFloat(item.itemPrice) || 0;
    // const quantity = parseInt(formData.numberOfGuests);
    return sum + price;
  }, 0);

  // const processingFee = items.reduce((sum, item) => {
  //   const price = parseFloat(item.itemPrice) || 0;
  //   const quantity = parseInt(formData.numberOfGuests);
  //   return sum + price * 0.08 * quantity;
  // }, 0);

  const discount = '64.8%';

  let totalAmount = items.reduce((sum, item) => {
    const price = parseFloat(item.itemPrice) || 0;
    const quantity = parseInt(formData.numberOfGuests);
    return sum + price * quantity;
  }, 0);

  totalAmount = totalAmount * (1 - parseFloat(discount) / 100);

  let processingFee = totalAmount * 0.08;

  const finalTotal = totalAmount + processingFee;

  const handlePayment = async () => {
    try {
      setInitiatingPayment(true);
      // create Order
      const response = await axios.post(
        'https://admin.cheffindia.com/api/v1/admin/payment/createOrder',
        // 'http://10.0.2.2:9100/api/v1/auth/chef/createOrder',
        {
          amount: catering ? finalTotal : finalTotalNonCatering,
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
          // handle failure
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
          // console.error('Payment Error: ', error);
          // alert('Payment Failed');
        });
    } catch (error) {
      console.log('Something went wrong while payment', error);
    }
  };

  const [
    bookChef,
    {
      isLoading: isBookingChef,
      isError: isBookingError,
      isSuccess: isBookingDone,
    },
  ] = useBookChefMutation();

  console.log('data to be sent: ', JSON.stringify(formData, null, 2));

  // const handleDummyPayment = async () => {
  //   try {
  //     console.log('Request started...');

  //     const response = await bookChef({...formData}).unwrap();

  //     console.log('Booking Successful!', response);

  //     if (response?.success) {
  //       navigation.navigate('BookingConfirmation');
  //     }
  //   } catch (error) {
  //     console.log(
  //       'Booking Failed:',
  //       error?.data?.data || error?.message || error,
  //     );
  //     notify('error', {
  //       params: {
  //         description: 'No Chefs available.',
  //         title: 'Available Chefs',
  //         style: {
  //           multiline: 3,
  //         },
  //       },
  //       config: {
  //         isNotch: true,

  //         // notificationPosition: 'center',
  //         // animationConfig: "SlideInLeftSlideOutRight",
  //         // duration: 200,
  //       },
  //     });
  //   }
  // };

  // Render each item in the list.
  const renderItem = ({item}) => {
    return (
      <View style={styles.itemContainer}>
        <Image
          source={{uri: item.itemImage}}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemDetails}>
          <Text style={styles.itemName}>{item.itemName}</Text>
          <Text style={styles.itemDescription}>{item.itemDescription}</Text>
          <View style={styles.priceQuantityRow}>
            <Text style={styles.itemPrice}>₹ {item.itemPrice}</Text>
            <TouchableOpacity
              onPress={() => {
                dispatch(
                  takeActionForMenuItems({
                    id: item?.id,
                  }),
                );

                if (formData?.menu?.items.length === 1) {
                  navigation.goBack();
                }
              }}
              style={styles.itemQuantity}>
              <Ionicons name="trash" color={'red'} size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={{width: WIDTH}} className="flex-1 bg-white relative">
      <ImageBackground
        source={{
          uri: 'https://i.pinimg.com/736x/1f/cc/d1/1fccd1628330a657b5a9c364661d9fb0.jpg',
        }}
        resizeMode="repeat"
        className=""
        style={{flex: 1}}>
        <View
          style={{flex: 1, height: '100%', width: WIDTH}}
          className="bg-white/90 absolute inset-0"
        />

        <StatusBar
          translucent={true}
          backgroundColor={'transparent'}
          barStyle={'dark-content'}
        />

        {initiatingPayment ? (
          <View style={styles.containerLoad}>
            <View style={styles.loadingContainer}>
              <LottieView
                source={loading_animation} // Use a Lottie loading animation
                autoPlay
                loop
                style={styles.loadingAnimation}
              />
              <Text style={styles.loadingText}>Payment Initiating...</Text>
            </View>
          </View>
        ) : (
          <>
            <View className="flex-row items-start px-4 pt-12 pb-2 bg-white">
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={30} color="black" />
              </TouchableOpacity>
              <View className="ml-3">
                <Text
                  style={{fontFamily: 'Roboto Regular'}}
                  className="text-lg text-gray-400">
                  Checkout
                </Text>
                <AddressPreview navigation={navigation} />
              </View>
            </View>
            <ScrollView style={styles.container}>
              {catering === false ? (
                <>
                  <View style={styles.summaryContainer}>
                    <Text className="text-[19px] font-semibold"> Starters</Text>
                    <Text style={styles.summaryAmount}>{numberOfStarters}</Text>
                  </View>
                  <View style={styles.summaryContainer}>
                    <Text className="text-[19px] font-semibold">
                      {' '}
                      Main Course
                    </Text>
                    <Text style={styles.summaryAmount}>
                      {numberOfMainCourse}
                    </Text>
                  </View>
                  <View style={styles.summaryContainer}>
                    <Text className="text-[19px] font-semibold"> Desserts</Text>
                    <Text style={styles.summaryAmount}>{numberOfDesserts}</Text>
                  </View>
                  <View style={styles.summaryContainer}>
                    <Text className="text-[19px] font-semibold"> Drinks</Text>
                    <Text style={styles.summaryAmount}>{numberOfDrinks}</Text>
                  </View>
                  {/* <View style={styles.summaryContainer}>
                <Text className="text-[19px] font-semibold"> Drinks</Text>
                <Text style={styles.summaryAmount}>{numberOfSnacks}</Text>
              </View> */}
                  {/* <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Total Amount:</Text>
                <Text style={styles.summaryAmount}>
                  ₹ {finalTotal.toFixed(2)}
                </Text>
              </View> */}
                </>
              ) : (
                <FlatList
                  data={items}
                  renderItem={renderItem}
                  removeClippedSubviews={false}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.listContainer}
                />
              )}

              {/* Order Summary */}
              <View style={styles.summaryContainer}>
                <Text className="text-[19px] font-semibold">Amount/person</Text>
                <Text style={styles.summaryAmount}>
                  ₹ {catering ? amount.toFixed(2) : amountPerPerson.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryContainer}>
                <Text className="text-[19px] font-semibold">
                  Number of Guests
                </Text>
                <Text style={styles.summaryAmount}>
                  {' '}
                  {formData?.numberOfGuests}
                </Text>
              </View>
              {catering && (
                <View style={styles.summaryContainer}>
                  <Text className="text-[20px] font-semibold">
                    Discount
                    <Text className="text-gray-600 text-sm font-normal">
                      (First Order)
                    </Text>
                  </Text>
                  <Text style={styles.summaryAmount}>
                    {catering ? discount : 0}
                  </Text>
                </View>
              )}
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Total Amount</Text>
                <Text style={styles.summaryAmount}>
                  ₹{' '}
                  {catering
                    ? totalAmount.toFixed(2)
                    : totalAmountNonCatering.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Processing Fee(8%)</Text>
                <Text style={styles.summaryAmount}>
                  ₹{' '}
                  {catering
                    ? processingFee.toFixed(2)
                    : processingFeeNonCatering.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryContainer}>
                <Text style={styles.summaryText}>Amount Payable</Text>
                <Text style={styles.summaryAmount}>
                  ₹{' '}
                  {catering
                    ? finalTotal.toFixed(2)
                    : finalTotalNonCatering.toFixed(2)}
                </Text>
              </View>

              {/* Pay Now Button */}
              <TouchableOpacity
                className="bg-green-500"
                style={styles.payButton}
                onPress={() => {
                  // if (catering) {
                  handlePayment();
                  // return;
                  // } else {
                  //   handleDummyPayment();
                  //   return;
                  // }
                }}>
                <Text style={styles.payButtonText}>Pay Now</Text>
              </TouchableOpacity>
            </ScrollView>
          </>
        )}
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  containerLoad: {
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
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 15,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  itemDescription: {
    fontSize: 14,
    color: '#555',
    marginVertical: 5,
  },
  priceQuantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryContainer: {
    borderTopWidth: 1,
    borderColor: '#ddd',
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#22c55e',
  },
  payButton: {
    // backgroundColor: '#FF3130',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 60,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default SpecialCheckoutScreen;
