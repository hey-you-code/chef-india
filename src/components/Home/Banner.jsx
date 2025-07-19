import React, { useRef, useEffect, useState } from 'react';
import { View, FlatList, Image, Dimensions } from 'react-native';

const Banner = () => {
  const flatListRef = useRef(null);
  const screenWidth = Dimensions.get('window').width;

  // Sample Data
  const images = [
    {
      id: '1',
      uri: 'https://i.pinimg.com/736x/20/98/13/209813e33c5f411ddfd49d98eef34c14.jpg',
    },
    {
      id: '2',
      uri: 'https://i.pinimg.com/736x/6a/59/fe/6a59fec3c73ddd85e97a12f4e1034a73.jpg',
    },
    {
      id: '3',
      uri: 'https://i.pinimg.com/736x/ec/75/1f/ec751f453b9bd675a91ef0faaa8890fd.jpg'
    }
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = ({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  };

  const viewabilityConfig = { viewAreaCoveragePercentThreshold: 50 };

  // Auto-scroll functionality with looping in the same direction
  useEffect(() => {
    const interval = setInterval(() => {
      let nextIndex = (activeIndex + 1) % images.length; // Loop forward
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * screenWidth,
        animated: true,
      });
      setActiveIndex(nextIndex);
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [activeIndex]);

  return (
    <View className="mt-5">
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View
            className="rounded-xl overflow-hidden"
            style={{ width: screenWidth  }}
          >
            <Image
              source={{ uri: item.uri }}
              style={{
                aspectRatio: 5/2
              }}
              className="w-[98%] rounded-xl mx-auto object-cover"
            />
          </View>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />
      
      {/* Indicator */}
      <View className="flex-row justify-center mt-2">
        {images.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 mx-1 rounded-full ${index === activeIndex ? 'bg-black ' : 'bg-gray-400 '}`}
          />
        ))}
      </View>
    </View>
  );
};

export default Banner;
