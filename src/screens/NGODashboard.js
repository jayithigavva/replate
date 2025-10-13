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
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const NGODashboard = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastPickupCount, setLastPickupCount] = useState(0);

  useEffect(() => {
    loadPickups();
    
    // Set up real-time updates - check for new pickups every 10 seconds
    const interval = setInterval(() => {
      console.log('Auto-refreshing pickups for NGO...');
      loadPickups(true); // Silent refresh (no loading spinner)
    }, 10000); // 10 seconds
    
    return () => clearInterval(interval);
  }, [lastPickupCount]);

  const loadPickups = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const response = await fetch(`${API_BASE_URL}/ngo-dashboard?ngoId=${user.id}`);
      const data = await response.json();

      if (data.success) {
        const newPickups = data.pickups || [];
        
        // Check if there are NEW pickups (not just initial load)
        if (lastPickupCount > 0 && newPickups.length > lastPickupCount) {
          const newCount = newPickups.length - lastPickupCount;
          Alert.alert(
            '🔔 New Pickup Available!', 
            `${newCount} new pickup${newCount > 1 ? 's' : ''} ready for collection!`,
            [{ text: 'View', style: 'default' }]
          );
        }
        
        setPickups(newPickups);
        setLastPickupCount(newPickups.length);
      } else {
        // If endpoint fails, show empty (this is fine for new setup)
        console.log('No pickups available yet');
        setPickups([]);
      }
    } catch (error) {
      console.log('Failed to load pickups - this is normal for new setup');
      setPickups([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
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

  const acceptPickup = async (pickupId) => {
    Alert.alert(
      'Accept Pickup',
      'Are you sure you want to accept this pickup?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => updatePickupStatus(pickupId, 'accepted')
        }
      ]
    );
  };

  const renderPickupItem = ({ item }) => {
    // Extract restaurant name from email or use full email
    const restaurantName = item.restaurant_name || item.restaurant?.email || 'Restaurant';
    const formattedDate = new Date(item.created_at).toLocaleString();

    return (
      <View style={styles.pickupCard}>
        <View style={styles.pickupHeader}>
          <Text style={styles.restaurantName}>🍽️ {restaurantName}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status || 'Available'}</Text>
          </View>
        </View>
        
        <Text style={styles.pickupTime}>📅 {formattedDate}</Text>
        
        {item.food_type && (
          <Text style={styles.foodType}>🥗 {item.food_type}</Text>
        )}
        
        {item.quantity && (
          <Text style={styles.quantity}>📦 Quantity: {item.quantity}</Text>
        )}
        
        {item.expiry_time && (
          <Text style={styles.expiry}>⏰ Expires: {new Date(item.expiry_time).toLocaleTimeString()}</Text>
        )}
        
        {item.notes && (
          <Text style={styles.notes}>📝 {item.notes}</Text>
        )}
        
        {item.description && (
          <Text style={styles.pickupDescription}>{item.description}</Text>
        )}
        
        {item.address && (
          <Text style={styles.pickupAddress}>📍 {item.address}</Text>
        )}

        <View style={styles.pickupActions}>
          <TouchableOpacity
            style={styles.acceptButton}
            onPress={() => acceptPickup(item.id)}
          >
            <Text style={styles.acceptButtonText}>✅ Accept Pickup</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Available Pickups</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Pickup Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>{pickups.length}</Text>
          <Text style={styles.summaryLabel}>Available Pickups</Text>
        </View>
      </View>

      {/* Pickups List */}
      <FlatList
        data={pickups}
        renderItem={renderPickupItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF6600"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No pickups available right now</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
      />
    </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  summarySection: {
    backgroundColor: '#111111',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  summaryCard: {
    alignItems: 'center',
  },
  summaryNumber: {
    color: '#FF6600',
    fontSize: 42,
    fontWeight: 'bold',
  },
  summaryLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 5,
  },
  listContainer: {
    padding: 15,
  },
  pickupCard: {
    backgroundColor: '#111111',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6600',
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  restaurantName: {
    color: '#FF6600',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  pickupTime: {
    color: '#CCCCCC',
    fontSize: 13,
    marginBottom: 8,
  },
  foodType: {
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 6,
  },
  quantity: {
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 6,
  },
  expiry: {
    color: '#FF9800',
    fontSize: 14,
    marginBottom: 6,
  },
  notes: {
    color: '#CCCCCC',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  pickupDescription: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  pickupAddress: {
    color: '#CCCCCC',
    fontSize: 13,
    marginBottom: 15,
  },
  pickupActions: {
    marginTop: 10,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#CCCCCC',
    fontSize: 14,
  },
});

export default NGODashboard;
