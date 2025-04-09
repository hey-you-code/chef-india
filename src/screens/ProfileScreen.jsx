import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {useDispatch, useSelector} from 'react-redux';
import {
  useGetBookingsQuery,
  useLogoutMutation,
} from '../features/auth/authApiSlice';
import {removeUser, setUser} from '../features/slices/userSlice';
import AuthStack from '../navigation/AuthStack';
import axios from 'axios';

const {height: HEIGHT, width: WIDTH} = Dimensions.get('window');

// const fetchBookings = async () => {
//   try {
//     const response = await axios.get(
//       'https://auth.cheffindia.com/api/v1/auth/user/userBookings',
//       {},
//     );
//     console.log('response: ', response.data);
//   } catch (error) {
//     console.error(
//       'Error fetching bookings:',
//       error.response?.data || error.message,
//     );
//   }
// };

const ProfileScreen = ({navigation}) => {
  const {user} = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [logout, {isLoading: isLoggingOut}] = useLogoutMutation();

  const {data, error, isLoading, refetch} = useGetBookingsQuery();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch(); // Re-fetch the bookings
    setRefreshing(false);
  }, [refetch]);

 
  // if (error) return <p>Error fetching bookings!</p>;

  // console.log('bookings of user: ', data?.data?.bookings);

  console.log(
    'Bookings: ',
    JSON.stringify(data?.data?.bookings.slice(0, 1), null, 2),
  );

  if (!user) {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <AuthStack />
      </GestureHandlerRootView>
    );
  }

  const logUserOut = async () => {
    try {
      await logout({accessToken: user?.accessToken}).unwrap();
      dispatch(setUser(null));
      navigation.replace('Home');
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  const renderBookingItem = booking => {
    const bookingDate = new Date(
      booking.eventTimings.startDate,
    ).toLocaleDateString();
    const bookingEndDate = new Date(
      booking.eventTimings.endDate,
    ).toLocaleDateString();
    const chefName =
      booking?.catering?.name ||
      `${booking?.chef?.firstName} ${booking?.chef?.lastName}` ||
      booking?.chef?.groupName ||
      'N/A';
    const chefPhoneNumber =
      booking?.catering?.phoneNumber || booking?.chef?.phoneNumber || 'N/A';

    return (
      <View key={booking._id} style={styles.bookingCard}>
        {/* Booking Header */}
        <View style={styles.bookingHeader}>
          <Ionicons name="calendar-outline" size={20} color="#EF4444" />
          <Text style={styles.bookingDate}>{bookingDate}</Text>
          {bookingDate !== bookingEndDate && (
            <Text style={styles.bookingDate}> - {bookingEndDate}</Text>
          )}
        </View>

        {/* Time Slots */}
        <View style={styles.timeSlotsContainer}>
          {booking.eventTimings.timeSlots.map((slot, index) => (
            <View key={index} style={styles.timeSlotBadge}>
              <Text style={styles.timeSlotText}>{slot}</Text>
            </View>
          ))}
        </View>

        {/* Booking Details */}
        <View style={styles.bookingDetails}>
          <Text style={styles.bookingText}>
            <Text style={styles.boldText}>Chef:</Text> {chefName}
          </Text>
          <Text style={styles.bookingText}>
            <Text style={styles.boldText}>Phone:</Text> {chefPhoneNumber}
          </Text>
          <Text style={styles.bookingText}>
            <Text style={styles.boldText}>Event Type:</Text> {booking.eventType}
          </Text>
          <Text style={styles.bookingText}>
            <Text style={styles.boldText}>Guests:</Text>{' '}
            {booking.numberOfGuests}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ImageBackground
        source={{
          uri: 'https://i.pinimg.com/736x/1f/cc/d1/1fccd1628330a657b5a9c364661d9fb0.jpg',
        }}
        resizeMode="repeat"
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
        <View className="mx-2 flex-row w-screen space-x-2 mt-[50px]">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={30} color={'black'} />
          </TouchableOpacity>
          <Text className="text-2xl font-semibold">PROFILE</Text>
        </View>

        {/* User Info */}
        <View
          style={{width: WIDTH, maxWidth: WIDTH}}
          className="mx-auto px-4 my-4 max-w-md flex-row justify-between items-center space-x-4">
          <View className="bg-[#FF3130] rounded-full h-[50px] w-[50px] justify-center items-center">
            <Text className="text-white text-center text-2xl font-bold">
              {user?.user?.name[0]}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-3xl text-left font-semibold">
              {user?.user?.name}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="mx-4 my-4 bg-gray-100 rounded-xl p-4 flex-row justify-between items-center"
          onPress={() => navigation.navigate('Bookings')}>
          <View className="flex-row items-center space-x-3">
            <Ionicons name="calendar-outline" size={24} color="#EF4444" />
            <Text className="text-lg font-semibold">View All Bookings</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="#6B7280" />
        </TouchableOpacity>

        {/* Bookings List */}
        {/* <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
        contentContainerStyle={styles.bookingsContainer}>
          {data?.data?.bookings?.length > 0 ? (
            data?.data?.bookings.map(booking => renderBookingItem(booking))
          ) : (
            <View style={styles.noBookings}>
              <Text className="text-gray-500">No bookings found.</Text>
            </View>
          )}
        </ScrollView> */}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={logUserOut}
          className="flex-row items-center justify-center my-8 rounded-lg px-4 py-4">
          <View className="flex-row items-center space-x-3">
            <Ionicons name="exit-outline" size={26} color="#ef4444" />
            <Text className="text-center text-red-500 text-lg">
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </Text>
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  backgroundImage: {flex: 1},
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.9)',
    position: 'absolute',
    inset: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 16,
  },
  headerTitle: {fontSize: 20, fontWeight: 'bold', marginLeft: 10},
  userInfo: {alignItems: 'center', marginTop: 20},
  avatar: {
    backgroundColor: '#FF3130',
    borderRadius: 50,
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {fontSize: 24, fontWeight: 'bold', color: 'white'},
  userName: {fontSize: 22, fontWeight: 'bold', marginTop: 8},
  bookingsContainer: {padding: 16},
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  bookingDate: {fontSize: 16, fontWeight: 'bold', marginLeft: 8},
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  timeSlotBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginTop: 4,
  },
  timeSlotText: {color: 'white', fontSize: 12},
  bookingDetails: {marginLeft: 10},
  bookingText: {fontSize: 14, marginBottom: 6},
  boldText: {fontWeight: 'bold'},
  noBookings: {justifyContent: 'center', alignItems: 'center', marginTop: 20},
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: {fontSize: 18, color: '#EF4444', marginLeft: 8},
  errorText: {textAlign: 'center', color: 'red', fontSize: 16, marginTop: 20},
});

export default ProfileScreen;
