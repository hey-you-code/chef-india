import React, {
  useRef,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {usePostBookingRatingsMutation} from '../../features/chefBook/chefBookingApiSlice';

const RatingBottomSheet = ({
  closeBottomSheet,
  bookingId,
  refreshBooking = null,
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [postBookingRatings, {isLoading, isError}] =
    usePostBookingRatingsMutation();
  const handleStarPress = selectedRating => {
    setRating(selectedRating);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;

    setIsSubmitting(true);
    try {
      //   await onSubmit({ rating, review });
      //   bottomSheetRef.current?.close();
      const response = await postBookingRatings({
        bookingId,
        ratings: rating,
        reviews: review,
      }).unwrap();

      //   console.log('response: ', response);

      closeBottomSheet();
      if (refreshBooking !== null) {
        refreshBooking();
      }
    } catch (error) {
      console.log('error: ', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await postBookingRatings({
        bookingId,
        ratings: 3,
        reviews: '',
      }).unwrap();

      closeBottomSheet();
    } catch (error) {
      console.log('error: ', error);
    }
  };

  //   console.log('ratings: ', rating);

  return (
    <View style={styles.contentContainer}>
      <Text style={styles.title}>Rate Your Experience</Text>
      <Text style={styles.subtitle}>
        How was your last booking with the chef?
      </Text>

      <View style={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            activeOpacity={0.7}>
            <AntDesign
              name={star <= rating ? 'star' : 'staro'}
              size={40}
              color={star <= rating ? '#FF0000' : '#CCCCCC'}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.reviewInput}
        placeholder="Tell us more about your experience..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={4}
        value={review}
        onChangeText={setReview}
      />

      <TouchableOpacity
        style={[
          styles.submitButton,
          {backgroundColor: '#22c55e'},
          rating === 0 && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        activeOpacity={0.8}>
        <Text style={styles.submitButtonText}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.submitButton,
          {marginTop: 20, backgroundColor: '#FF0000'},
        ]}
        onPress={handleCancel}
        // disabled={rating === 0 || isSubmitting}
        activeOpacity={0.8}>
        <Text style={styles.submitButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  background: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  handleIndicator: {
    backgroundColor: '#FF0000',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 24,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 32,
  },
  reviewInput: {
    width: '100%',
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#FAFAFA',
  },
  submitButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RatingBottomSheet;
