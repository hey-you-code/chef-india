import React, {useCallback, useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import {useGetBookingsQuery} from '../features/auth/authApiSlice';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {Dimensions} from 'react-native';
import {format} from 'date-fns';
import {Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {useBottomSheet} from '../contexts/BottomSheetContext';
import RatingBottomSheet from '../components/Home/RatingBottomSheet';

const {width: WIDTH} = Dimensions.get('window');

const BookingsScreen = ({navigation}) => {
  const {data, error, isLoading, refetch} = useGetBookingsQuery();
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('confirmed');

  const {openBottomSheet, closeBottomSheet} = useBottomSheet();

  const handleCallChef = phoneNumber => {
    try {
      if (!phoneNumber) {
        Alert.alert(
          'Contact Unavailable',
          'Chef phone number is not available',
        );
        return;
      }
      const parsedNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (parsedNumber.length < 10) {
        Alert.alert('Invalid Number', 'The provided phone number is invalid');
        return;
      }
      Linking.openURL(`tel:${parsedNumber}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to make a call at this moment');
      console.error('Call error:', error);
    }
  };

  const handleMessageChef = phoneNumber => {
    try {
      if (!phoneNumber) {
        Alert.alert(
          'Contact Unavailable',
          'Chef phone number is not available',
        );
        return;
      }
      const parsedNumber = phoneNumber.replace(/[^0-9]/g, '');
      if (parsedNumber.length < 10) {
        Alert.alert('Invalid Number', 'The provided phone number is invalid');
        return;
      }
      Linking.openURL(`sms:${parsedNumber}`);
    } catch (error) {
      Alert.alert('Error', 'Unable to open messages at this moment');
      console.error('Message error:', error);
    }
  };

  const handleOpenRatingBottomSheet = bookingId => {
    openBottomSheet(
      <RatingBottomSheet
        closeBottomSheet={closeBottomSheet}
        bookingId={bookingId}
        refreshBooking={async () => await refetch()}
      />,
      ['80%', '100%'],
      'RATINGSCREEN',
    );
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return format(date, 'do MMM yyyy');
  };

  const getMealType = timeSlot => {
    switch (timeSlot.toLowerCase()) {
      case 'morning':
        return 'Breakfast';
      case 'afternoon':
        return 'Lunch';
      case 'evening':
        return 'Dinner';
      default:
        return 'Meal';
    }
  };

  const renderBookingItem = booking => {
    const chefName =
      booking?.catering?.name ||
      `${booking?.chef?.firstName} ${booking?.chef?.lastName}` ||
      booking?.chef?.groupName ||
      'N/A';
    const chefPhoneNumber =
      booking?.catering?.phoneNumber || booking?.chef?.phoneNumber || 'N/A';

    const isCompleted = booking.bookingStatus === 'completed';

    return (
      <View key={booking._id} style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="restaurant-outline" size={20} color="#EF4444" />
          <Text style={styles.bookingType}>
            {booking.bookingType.toUpperCase()}
          </Text>
          <View className="bg-green-500" style={styles.statusBadge}>
            <Text className="text-white" style={styles.statusText}>
              {booking.bookingStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="overflow-hidden" style={styles.cardBody}>
          <View>
            {booking?.bookingType !== 'regular' && (
              <View style={styles.detailRow}>
                <Ionicons name="newspaper-outline" size={16} color="#6B7280" />
                <Text style={styles.detailText}>{booking.eventType}</Text>
              </View>
            )}

            <View style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#6B7280" />
              {booking.eventTimings.startDate ===
              booking.eventTimings.endDate ? (
                <Text style={styles.detailText}>
                  {formatDate(booking.eventTimings.startDate)}
                </Text>
              ) : (
                <Text style={styles.detailText}>
                  {formatDate(booking.eventTimings.startDate)} -
                  {formatDate(booking.eventTimings.endDate)}
                </Text>
              )}
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="time-outline" size={16} color="#6B7280" />
              {booking.eventTimings.timeSlots.map((slot, index) => (
                <View key={index}>
                  <Text style={styles.detailText}>
                    {booking.bookingType === 'regular'
                      ? getMealType(slot)
                      : slot}
                  </Text>
                </View>
              ))}
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text style={styles.detailText}>
                {booking.numberOfGuests} Guests
              </Text>
            </View>

            {!isCompleted && (
              <>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons
                    name="chef-hat"
                    size={16}
                    color="#6B7280"
                  />
                  <Text style={styles.detailText}>
                    Your chef Name - {chefName}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="call-outline" size={16} color="#6B7280" />
                  <Text style={styles.detailText}>{chefPhoneNumber}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.contactRow}>
                  <TouchableOpacity
                    onPress={() => handleCallChef(chefPhoneNumber)}
                    style={styles.contactButton}>
                    <Ionicons name="call-outline" size={16} color="#EF4444" />
                    <Text style={styles.contactText}>Call Chef</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleMessageChef(chefPhoneNumber)}
                    style={styles.contactButton}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={16}
                      color="#EF4444"
                    />
                    <Text style={styles.contactText}>Message</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
          {isCompleted ? (
            <View className="overflow-hidden">
              {booking?.ratingsGiven ? (
                <View className="flex-row items-center space-x-3">
                  <Text className="text-[22px] text-gray-400">
                    {parseFloat(booking?.ratings || 0).toFixed(1)}
                  </Text>
                  <Ionicons name="star" color="#9ca3af" size={24} />
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    // Add your rating logic here
                    handleOpenRatingBottomSheet(booking?._id);
                    // console.log('Add rating pressed');
                  }}
                  className="flex-row items-center space-x-2 bg-blue-500 px-4 py-2 rounded-lg">
                  <Text className="text-white font-medium text-[13px]">Add Rating</Text>
                  <Ionicons name="star-outline" color="white" size={20} />
                </TouchableOpacity>
              )}
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#EF4444" />
      </View>
    );
  }

  const confirmedBookings =
    data?.data?.bookings?.filter(
      booking => booking.bookingStatus === 'confirmed',
    ) || [];

  const completedBookings =
    data?.data?.bookings?.filter(
      booking => booking.bookingStatus === 'completed',
    ) || [];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        translucent={false}
        backgroundColor={'#F9FAFB'}
        barStyle={'dark-content'}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#EF4444"
          />
        }>
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => navigation.goBack()} className="">
            <Ionicons name="arrow-back" size={28} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, {flex: 1}]}>Your Bookings</Text>
        </View>

        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="warning-outline" size={40} color="#EF4444" />
            <Text style={styles.errorText}>Failed to load bookings</Text>
          </View>
        ) : (
          <>
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'confirmed' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('confirmed')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'confirmed' && styles.activeTabText,
                  ]}>
                  Confirmed
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'completed' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('completed')}>
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'completed' && styles.activeTabText,
                  ]}>
                  Completed
                </Text>
              </TouchableOpacity>
            </View>

            {activeTab === 'confirmed' ? (
              confirmedBookings.length > 0 ? (
                confirmedBookings.map(booking => renderBookingItem(booking))
              ) : (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={60} color="#D1D5DB" />
                  <Text style={styles.emptyText}>No confirmed bookings</Text>
                </View>
              )
            ) : completedBookings.length > 0 ? (
              completedBookings.map(booking => renderBookingItem(booking))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={60} color="#D1D5DB" />
                <Text style={styles.emptyText}>No completed bookings</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    // marginBottom: 24,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    padding: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  bookingType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    // color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  contactRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  contactText: {
    color: '#EF4444',
    marginLeft: 6,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 16,
    marginTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    marginTop: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#EF4444',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#EF4444',
    fontWeight: '600',
  },
});

export default BookingsScreen;
