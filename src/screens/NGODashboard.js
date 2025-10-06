import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const NGODashboard = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [groupedPickups, setGroupedPickups] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPickup, setSelectedPickup] = useState(null);

  useEffect(() => {
    loadPickups();
  }, []);

  const loadPickups = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/ngo-dashboard?ngoId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        setPickups(data.pickups);
        setGroupedPickups(data.groupedPickups);
      } else {
        Alert.alert('Error', data.error || 'Failed to load pickups');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPickups();
    setRefreshing(false);
  };

  const updatePickupStatus = async (pickupId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pickup/${pickupId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: status,
          ngoId: user.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Pickup status updated successfully');
        loadPickups(); // Refresh the list
      } else {
        Alert.alert('Error', data.error || 'Failed to update pickup status');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to update pickup status');
    }
  };

  const renderPickupItem = ({ item }) => (
    <View style={styles.pickupCard}>
      <View style={styles.pickupHeader}>
        <Text style={styles.restaurantEmail}>{item.restaurant?.email}</Text>
        <Text style={styles.pickupTime}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
      
      <Text style={styles.pickupDescription}>{item.description}</Text>
      
      {item.address && (
        <Text style={styles.pickupAddress}>📍 {item.address}</Text>
      )}

      <View style={styles.pickupActions}>
        <TouchableOpacity
          style={styles.collectButton}
          onPress={() => updatePickupStatus(item.id, 'collected')}
        >
          <Text style={styles.collectButtonText}>✅ Collected</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => updatePickupStatus(item.id, 'cancelled')}
        >
          <Text style={styles.cancelButtonText}>❌ Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderGroupedPickup = (location, pickupList) => (
    <View key={location} style={styles.groupCard}>
      <Text style={styles.groupTitle}>📍 {location}</Text>
      <Text style={styles.groupCount}>{pickupList.length} pickup(s)</Text>
      
      {pickupList.map((pickup) => (
        <View key={pickup.id} style={styles.groupItem}>
          <Text style={styles.groupItemText}>
            {pickup.restaurant?.email} - {new Date(pickup.created_at).toLocaleTimeString()}
          </Text>
          <TouchableOpacity
            style={styles.groupActionButton}
            onPress={() => updatePickupStatus(pickup.id, 'collected')}
          >
            <Text style={styles.groupActionText}>Collect</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  // Get coordinates for map (mock data for now)
  const getMapRegion = () => {
    if (pickups.length === 0) {
      return {
        latitude: 37.7749,
        longitude: -122.4194,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };
    }

    // Calculate center point from pickups
    const avgLat = pickups.reduce((sum, pickup) => sum + (pickup.location?.latitude || 37.7749), 0) / pickups.length;
    const avgLng = pickups.reduce((sum, pickup) => sum + (pickup.location?.longitude || -122.4194), 0) / pickups.length;

    return {
      latitude: avgLat,
      longitude: avgLng,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>NGO Dashboard</Text>
      </View>

      {/* Map View */}
      <View style={styles.mapSection}>
        <Text style={styles.sectionTitle}>Pickup Locations</Text>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            region={getMapRegion()}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {pickups.map((pickup) => (
              <Marker
                key={pickup.id}
                coordinate={{
                  latitude: pickup.location?.latitude || 37.7749,
                  longitude: pickup.location?.longitude || -122.4194,
                }}
                title={pickup.restaurant?.email}
                description={pickup.description}
                pinColor="#FF6600"
              />
            ))}
          </MapView>
        </View>
      </View>

      {/* Pickup Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.sectionTitle}>Pickup Summary</Text>
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{pickups.length}</Text>
            <Text style={styles.summaryLabel}>Total Pickups</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{Object.keys(groupedPickups).length}</Text>
            <Text style={styles.summaryLabel}>Locations</Text>
          </View>
        </View>
      </View>

      {/* Grouped Pickups */}
      {Object.keys(groupedPickups).length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Optimized Routes</Text>
          {Object.entries(groupedPickups).map(([location, pickupList]) =>
            renderGroupedPickup(location, pickupList)
          )}
        </View>
      )}

      {/* All Pickups List */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Pickups</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={pickups}
          renderItem={renderPickupItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No pickups available</Text>
              <Text style={styles.emptySubtext}>Pull down to refresh</Text>
            </View>
          }
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    backgroundColor: '#111111',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  mapSection: {
    backgroundColor: '#111111',
    margin: 10,
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    color: '#FF6600',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  mapContainer: {
    height: 250,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  summarySection: {
    backgroundColor: '#111111',
    margin: 10,
    padding: 20,
    borderRadius: 15,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#222222',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  summaryNumber: {
    color: '#FF6600',
    fontSize: 32,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    backgroundColor: '#111111',
    margin: 10,
    padding: 20,
    borderRadius: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  refreshText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  groupCard: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  groupTitle: {
    color: '#FF6600',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  groupCount: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 10,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  groupItemText: {
    color: '#FFFFFF',
    fontSize: 14,
    flex: 1,
  },
  groupActionButton: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  groupActionText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pickupCard: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  restaurantEmail: {
    color: '#FF6600',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickupTime: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  pickupDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 10,
  },
  pickupAddress: {
    color: '#CCCCCC',
    fontSize: 12,
    marginBottom: 15,
  },
  pickupActions: {
    flexDirection: 'row',
    gap: 10,
  },
  collectButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  collectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#CCCCCC',
    fontSize: 14,
  },
});

export default NGODashboard;
