import {
  View,
  Text,
  TextInput,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import React, {useState, useEffect, useCallback, useMemo} from 'react';
import MenuItem from './MenuItem';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  useFilterMenuMutation,
  useGetMenuQuery,
  useLazySearchMenuByItemNameQuery,
} from '../../features/menu/menuApiSlice';
import {useBottomSheet} from '../../contexts/BottomSheetContext';
import {
  decreaseNumberOfItems,
  increaseNumberOfItems,
  setFormData,
} from '../../features/slices/chefbookingSlice';
import {useDispatch, useSelector} from 'react-redux';

const {width} = Dimensions.get('window');

const Menu = ({actionApplicable, menuType, country, preview = true}) => {
  const [page, setPage] = useState(1);
  const {formData} = useSelector(state => state.chefBooking);
  const limit = 5; // Number of items per page
  const [menuItems, setMenuItems] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // State for filtering
  const [activeFilter, setActiveFilter] = useState(preview ? 'Starters' : null);
  const [filteredItems, setFilteredItems] = useState([]);

  const filters = ['Starters', 'Main Course', 'Desserts', 'Drinks'];

  const queryParams = useMemo(
    () => ({menuType, country, page, limit}),
    [menuType, country, page, limit],
  );

  // Fetch menu items from API
  const {data, error, isLoading, isFetching} = useGetMenuQuery(queryParams, {
    skip: preview || (page === 1 && menuItems.length > 0),
  });

  // console.log("data from backend: ", data?.data?.menu?.items[0])

  // Append new menu items when fetched
  useEffect(() => {
    if (data?.data?.menu?.items) {
      setMenuItems(prevItems => [...prevItems, ...data.data.menu.items]);
    }
  }, [data]);

  // Load more items when reaching the end of the list
  const loadMore = useCallback(() => {
    if (!isFetching && data?.data?.pagination?.totalItems !== 0) {
      setPage(prevPage => prevPage + 1);
    }
  }, [isFetching, data]);

  const [
    trigger,
    {data: searchData, error: searchError, isLoading: searchIsLoading},
  ] = useLazySearchMenuByItemNameQuery();

  // Debounce search query changes and trigger suggestions
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim() !== '') {
        trigger({
          search: searchQuery,
          menuType,
          country,
          page: 1,
          limit: 10,
        });
        setShowSearchResults(true);
      } else {
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [searchQuery, menuType, country, trigger]);

  // Process search results to flatten the items
  const searchItems = useMemo(() => {
    if (!searchData?.data?.menus) return [];
    return searchData.data.menus.flatMap(menu => menu.items);
  }, [searchData]);

  // Get the filterMenu mutation
  const [filterMenu, {isLoading: isFiltering, error: filterError}] =
    useFilterMenuMutation();

  // Handle filter tab press: if the same filter is tapped, clear it.
  const handleFilterPress = async filter => {
    if (activeFilter === filter && !preview) {
      // Clear the filter if it's already active
      setActiveFilter(null);
      setFilteredItems([]);
    } else {
      setActiveFilter(filter);
      try {
        const response = await filterMenu({
          tag: filter, // Note: We pass 'tag' per your endpoint.
          menuType,
          country,
          page: 1,
          limit: 10,
        }).unwrap();
        const items = response?.data?.menus
          ? response.data.menus.flatMap(menu => menu.items)
          : [];
        setFilteredItems(items);
      } catch (error) {
        console.error('Error filtering menu:', error);
      }
    }
  };

  // Determine which items to show:
  // - If search is active, show searchItems.
  // - Else if filter is active, show filteredItems.
  // - Otherwise, show the main menuItems.
  const isSearchActive = searchQuery.trim() !== '' && searchData;
  const isFilterActive = activeFilter !== null;
  const displayedItems = isSearchActive
    ? searchItems
    : isFilterActive
    ? filteredItems
    : menuItems;

  useEffect(() => {
    if (preview) {
      handleFilterPress(activeFilter);
    }
  }, [activeFilter]);

  // --- List header component: renders search suggestions (if available)
  const ListHeaderComponent = () => {
    if (!showSearchResults) return null;
    return (
      <View
        style={{
          backgroundColor: '#fff',
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}>
        {searchItems.slice(0, 4).map(item => (
          <TouchableOpacity
            key={item._id}
            onPress={() => {
              // When a suggestion is tapped, fill the search field,
              // trigger a search, and hide the suggestions.
              setSearchQuery(item.name);
              trigger({
                search: item.name,
                menuType,
                country,
                page: 1,
                limit: 10,
              });
              setShowSearchResults(false);
            }}
            style={{
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: '#eee',
            }}>
            <Text style={{fontSize: 16}}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const {openBottomSheet, closeBottomSheet} = useBottomSheet();

  const handlePress = tag => {
    openBottomSheet(
      <BottomSheetContent closeBottomSheet={closeBottomSheet} tag={tag} />,
      ['40%'],
      'EDITPROFILE',
    );
  };

  console.log('items: ', JSON.stringify(formData?.menu?.items, null, 2));

  return (
    <View style={{flex: 1}}>
      {/* Search Bar */}

      <View style={!preview ? {padding: 16} : {padding: 0}}>
        {!preview ? (
          <View style={{position: 'relative'}}>
            <TextInput
              placeholder="Search Menu Items"
              placeholderTextColor="gray"
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={{
                borderWidth: 1,
                borderColor: 'gray',
                borderRadius: 8,
                padding: 12,
                paddingRight: 40, // reserve space for an icon
              }}
            />
            {searchQuery.trim() !== '' ? (
              // Render a close icon when there is text.
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setShowSearchResults(false);
                }}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: [{translateY: -12}],
                }}>
                <Ionicons name="close" color="gray" size={24} />
              </TouchableOpacity>
            ) : (
              // Otherwise, render a search icon.
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: [{translateY: -12}],
                }}>
                <Ionicons name="search" color="gray" size={24} />
              </TouchableOpacity>
            )}
          </View>
        ) : null}

        {/* Filter Tabs */}
        {!showSearchResults && (
          <View style={{marginTop: 10, marginBottom: 10}}>
            <FlatList
              horizontal
              data={filters}
              keyExtractor={item => item}
              removeClippedSubviews={false}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              renderItem={({item}) => {
                const isActive = activeFilter === item;
                return (
                  <TouchableOpacity
                    onPress={() => handleFilterPress(item)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      backgroundColor: isActive ? 'black' : '#eee',
                      marginHorizontal: 8,
                      marginTop: 8,
                      borderRadius: 20,
                    }}>
                    <Text style={{color: isActive ? 'white' : 'black'}}>
                      {item}
                    </Text>
                    {isActive && !preview && (
                      <Ionicons
                        name="close"
                        color="white"
                        size={16}
                        style={{marginLeft: 8}}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        )}

        {/* Loading indicator for search */}
        {searchIsLoading && (
          <ActivityIndicator
            size="small"
            color="red"
            style={{marginVertical: 8}}
          />
        )}

        {/* Error handling for search */}
        {searchError && searchQuery.trim() !== '' && (
          <Text style={{color: 'red', marginVertical: 8}}>
            Error fetching suggestions
          </Text>
        )}

        {/* Loading indicator for filtering */}
        {isFiltering && activeFilter && (
          <ActivityIndicator
            size="small"
            color="red"
            style={{marginVertical: 8}}
          />
        )}

        {/* Error handling for filtering */}
        {filterError && activeFilter && (
          <Text style={{color: 'red', marginVertical: 8}}>
            Error fetching filtered results
          </Text>
        )}
      </View>

      {/* Main List: the ListHeaderComponent will render search suggestions (if any) and then the menu items */}
      {isLoading && menuItems.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#FF3130"
          style={{marginTop: 20}}
        />
      ) : error ? (
        <Text style={{textAlign: 'center', color: 'red', marginTop: 20}}>
          Failed to load menu
        </Text>
      ) : (
        <FlatList
          data={displayedItems}
          keyExtractor={item => item._id}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={false}
          renderItem={({item}) => (
            <View
              style={{width: width * 0.95}}
              className="items-center mx-auto">
              <MenuItem
                id={item._id}
                name={item.name}
                description={item.description}
                price={item.price}
                image={item.image}
                tags={item.tags?.map(tag => tag.toLowerCase())}
                actionApplicable={actionApplicable}
                preview={preview}
              />
            </View>
          )}
          // Disable pagination when in search or filter mode
          onEndReached={!isSearchActive && !isFilterActive ? loadMore : null}
          onEndReachedThreshold={!isSearchActive && !isFilterActive ? 0.5 : 0}
          // Attach the search suggestions as a header so they scroll together with the list.
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={
            !preview ? (
              !isSearchActive ? (
                // !isFilterActive &&
                isFetching ? (
                  <View style={{height: 100}}>
                    <ActivityIndicator size="small" color="#FF3130" />
                  </View>
                ) : (
                  <View style={{height: 140}}>
                    {data?.data?.pagination?.totalItems === 0 ? (
                      <Text
                        style={{
                          textAlign: 'center',
                          marginTop: 8,
                          fontSize: 24,
                          fontWeight: '600',
                        }}>
                        END OF THE LIST
                      </Text>
                    ) : (
                      !activeFilter &&
                      !isLoading && (
                        <TouchableOpacity
                          onPress={loadMore}
                          style={{
                            width: width * 0.4,
                            backgroundColor: 'black',
                            padding: 12,
                            alignSelf: 'center',
                            marginTop: 16,
                            borderRadius: 16,
                          }}>
                          <Text
                            style={{
                              color: 'white',
                              textAlign: 'center',
                              fontSize: 20,
                            }}>
                            {isFetching ? 'Loading...' : 'Load More...'}
                          </Text>
                        </TouchableOpacity>
                      )
                    )}
                  </View>
                )
              ) : (
                <View style={{height: 130, marginTop: 10}} />
              )
            ) : (
              <View style={{height: 130, marginTop: 10}}>
                {actionApplicable && !isFiltering ? (
                  <TouchableOpacity
                    onPress={() => handlePress(activeFilter)}
                    style={{
                      width: width * 0.6,
                      backgroundColor: '#FF3130',
                      padding: 12,
                      alignSelf: 'center',
                      marginTop: 16,
                      borderRadius: 16,
                    }}>
                    <Text
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: 20,
                      }}>
                      Add Extra {activeFilter}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            )
          }
        />
      )}
    </View>
  );
};

export default Menu;

const BottomSheetContent = ({closeBottomSheet, tag}) => {
  const {user} = useSelector(state => state.user);
  const {formData} = useSelector(state => state.chefBooking);
  const dispatch = useDispatch();

  // Local state to hold the counter for items with the given tag
  const [counter, setCounter] = useState(0);

  console.log('formData: ', formData);

  // Calculate initial counter value from formData when the component mounts or formData changes
  useEffect(() => {
    if (formData?.menu?.numberOfItems) {
      const count = formData.menu.items.reduce((acc, item) => {
        if (item.itemTags && item.itemTags.includes(tag)) {
          return acc + Number(item.itemCount || 0);
        }
        return acc;
      }, 0);
      setCounter(count);
    }
  }, [formData, tag]);

  // Increase the counter (and update formData accordingly)
  const handleIncrement = () => {
    dispatch(increaseNumberOfItems({itemTags: [tag]}));
    // Uncomment and adjust the following line to update formData in your store:
    // dispatch(updateMenuItemCount({ tag, count: newCount }));
  };

  // Decrease the counter (and update formData accordingly)
  const handleDecrement = () => {
    dispatch(decreaseNumberOfItems({itemTags: [tag]}));
  };

  return (
    <View style={{flex: 1, padding: 20, backgroundColor: 'white'}}>
      {/* Display the current number of items for the given tag */}

      <Text className="text-lg mb-4 font-semibold">Add aditional {tag}</Text>

      {formData?.menu?.numberOfItems[tag.toLowerCase()] > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            width: width * 0.8,
            marginHorizontal: 'auto',
          }}
          className=" px-6 py-4">
          <Text className="rounded-2xl font-medium" style={{fontSize: 22}}>
            Total {tag}
          </Text>

          <Text className="rounded-2xl font-medium " style={{fontSize: 22}}>
            {formData?.menu?.numberOfItems[tag.toLowerCase()]}
          </Text>
        </View>
      ) : undefined}

      {/* Counter UI */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          // marginBottom: 30,
          // backgroundColor: '#f2f2f2',
          paddingVertical: 10,
          paddingHorizontal: 20,
          borderRadius: 10,
        }}>
        <TouchableOpacity onPress={handleDecrement}>
          <Ionicons name="remove-circle-outline" size={40} color="black" />
        </TouchableOpacity>
        <Text style={{fontSize: 24, marginHorizontal: 20}}>
          {formData?.menu?.numberOfItems[tag.toLowerCase()] ?? 0}
        </Text>
        <TouchableOpacity onPress={handleIncrement}>
          <Ionicons name="add-circle-outline" size={40} color="black" />
        </TouchableOpacity>
      </View>

      {/* Done Button */}
      <TouchableOpacity
        onPress={() => closeBottomSheet()}
        style={{
          marginTop: 30,
          backgroundColor: '#FF3130',
          paddingVertical: 15,
          borderRadius: 10,
          alignItems: 'center',
          shadowColor: '#000',
          shadowOpacity: 0.2,
          shadowRadius: 4,
          elevation: 2,
        }}>
        <Text style={{color: 'white', fontSize: 18, fontWeight: '600'}}>
          Done
        </Text>
      </TouchableOpacity>
    </View>
  );
};
