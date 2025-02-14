import React from 'react';
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
import { takeActionForMenuItems } from '../features/slices/chefbookingSlice';

const {width: WIDTH, height: HEIGHT} = Dimensions.get('window');

const SpecialCheckoutScreen = ({navigation}) => {
  // Retrieve the formData from your Redux store
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();
  const {menu, bookingType, customerLocation, customerInfo, catering} =
    formData || {};

  const numberOfGuests = parseInt(formData?.numberOfGuests) || 1;
  const numberOfDays =  1;

  // Count different categories
  const numberOfStarters = menu?.numberOfItems['starters'] ? parseInt(menu?.numberOfItems['starters']) : 0
  const numberOfMainCourse = menu?.numberOfItems['main course'] ? parseInt(menu?.numberOfItems['main course']) : 0
  const numberOfDesserts = menu?.numberOfItems['desserts'] ? parseInt(menu?.numberOfItems['desserts']) : 0
  const numberOfDrinks = menu?.numberOfItems['drinks'] ? parseInt(menu?.numberOfItems['drinks']) : 0
  const numberOfSnacks = menu?.numberOfItems['snacks'] ?parseInt(menu?.numberOfItems['snacks']) : 0

  // Base prices
  const basePrice = {starters: 20, mainCourse: 30, desserts: 20, drinks: 10,snacks: 10};

  // Calculate pricing when catering is false
  const startersTotal =
    numberOfStarters * basePrice.starters * numberOfGuests * numberOfDays;
  const mainCourseTotal =
    numberOfMainCourse * basePrice.mainCourse * numberOfGuests * numberOfDays;
  const dessertsTotal =
    numberOfDesserts * basePrice.desserts * numberOfGuests * numberOfDays;
  const drinksTotal =
    numberOfDrinks * basePrice.drinks * numberOfGuests * numberOfDays;
    const snacksTotal = numberOfSnacks * numberOfGuests * numberOfDays;
  const totalAmountNonCatering =
    startersTotal + mainCourseTotal + dessertsTotal + drinksTotal + snacksTotal;
  const processingFeeNonCatering = totalAmountNonCatering * 0.1;
  const finalTotalNonCatering = totalAmountNonCatering + processingFeeNonCatering;

  // Get the list of ordered items.
  const items = menu?.items || [];

  // Calculate the total amount by summing price * itemCount for each item.
  // Ensure that we convert the price (which is a string) into a number.

  const amount = items.reduce((sum, item) => {
    const price = parseFloat(item.itemPrice) || 0;
    // const quantity = parseInt(formData.numberOfGuests);
    return sum + price;
  }, 0);

  const processingFee = items.reduce((sum, item) => {
    const price = parseFloat(item.itemPrice) || 0;
    const quantity = parseInt(formData.numberOfGuests);
    return sum + price * 0.1 * quantity;
  }, 0);

  const totalAmount = items.reduce((sum, item) => {
    const price = parseFloat(item.itemPrice) || 0;
    const quantity = parseInt(formData.numberOfGuests);
    return sum + price * quantity;
  }, 0);

  const finalTotal = totalAmount + processingFee;

  const handlePayment = async () => {
    try {
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

      console.log('data: ', response?.data?.data?.order);

      const order = response?.data?.data?.order;

      var options = {
        description: 'Payment for Chef Registration',
        // image: 'https://i.imgur.com/3g7nmJC.jpg',
        currency: 'INR',
        key: 'rzp_live_FZbdnnMty8PClJ',
        amount: order.amount,
        name: 'Cheff India',
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
            },
          );

          console.log('Verification Response: ', verifyResponse.data);

          if (verifyResponse.data.success) {
            // alert('Payment verified successfully!');
            dispatch(
              setUser({
                user: verifyResponse?.data?.data?.user,
                accessToken: verifyResponse?.data?.data?.accessToken,
              }),
            );
          } else {
            alert('Payment verification failed!');
          }
        })
        .catch(error => {
          // handle failure
          console.error('Payment Error: ', error);
          alert('Payment Failed');
        });
    } catch (error) {
      console.log('Something went wrong while payment', error);
    }
  };

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
            <TouchableOpacity onPress={() => {
                dispatch(
                    takeActionForMenuItems({
                      id: item?.id,
                    }),
                  );

                  if(formData?.menu?.items.length === 1) {
                    navigation.goBack();
                  }
            }} style={styles.itemQuantity}>
                <Ionicons name='trash' color={"red"} size={24}/>
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

        {/* Header */}
        <View className="mx-2 flex-row space-x-2 mt-[50px] mb-[10px]">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color={'black'} />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold text-black">Checkout</Text>
        </View>
        <ScrollView style={styles.container}>
          {/* <Text style={styles.header}>Checkout</Text> */}

          {catering === false ? (
            <>
              <View style={styles.summaryContainer}>
                <Text className="text-[19px] font-semibold"> Starters</Text>
                <Text style={styles.summaryAmount}>{numberOfStarters}</Text>
              </View>
              <View style={styles.summaryContainer}>
                <Text className="text-[19px] font-semibold"> Main Course</Text>
                <Text style={styles.summaryAmount}>{numberOfMainCourse}</Text>
              </View>
              <View style={styles.summaryContainer}>
                <Text className="text-[19px] font-semibold"> Desserts</Text>
                <Text style={styles.summaryAmount}>{numberOfDesserts}</Text>
              </View>
              <View style={styles.summaryContainer}>
                <Text className="text-[19px] font-semibold"> Drinks</Text>
                <Text style={styles.summaryAmount}>{numberOfDrinks}</Text>
              </View>
              <View style={styles.summaryContainer}>
                <Text className="text-[19px] font-semibold"> Drinks</Text>
                <Text style={styles.summaryAmount}>{numberOfSnacks}</Text>
              </View>
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
            <Text className="text-[19px] font-semibold"> Amount</Text>
            <Text style={styles.summaryAmount}>₹ {catering ? amount.toFixed(2) : totalAmountNonCatering.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryContainer}>
            <Text className="text-[19px] font-semibold"> Number of Guests</Text>
            <Text style={styles.summaryAmount}>
              {' '}
              {formData?.numberOfGuests}
            </Text>
          </View>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}> Processing Fee(10%)</Text>
            <Text style={styles.summaryAmount}>₹ {catering ? processingFee : processingFeeNonCatering}</Text>
          </View>
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>Total Amount:</Text>
            <Text style={styles.summaryAmount}>₹ {catering? finalTotal.toFixed(2) : finalTotalNonCatering.toFixed(2)}</Text>
          </View>

          {/* Pay Now Button */}
          <TouchableOpacity
            className="bg-green-500"
            style={styles.payButton}
            onPress={() => {
              handlePayment();
            }}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </ScrollView>
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
