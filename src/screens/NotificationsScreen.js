import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const NotificationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Fetch real notifications from backend
      const response = await fetch(`${API_BASE_URL}/notifications/${user.id}`);
      const data = await response.json();
      
      if (data.success) {
        setNotifications(data.notifications || []);
      } else {
        // If endpoint doesn't exist yet or error, show empty
        setNotifications([]);
      }
    } catch (error) {
      // No notifications yet - this is expected for new users
      console.log('No notifications available (this is normal for new accounts)');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const markAsRead = async (notificationId) => {
    try {
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
      
      // TODO: Make API call to mark as read
      // await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      //   method: 'PUT',
      // });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'pickup':
        return '🚚';
      case 'scan':
        return '🔍';
      case 'confirmation':
        return '✅';
      case 'route':
        return '🗺️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'pickup':
        return '#FF6600';
      case 'scan':
        return '#4CAF50';
      case 'confirmation':
        return '#2196F3';
      case 'route':
        return '#9C27B0';
      default:
        return '#FF6600';
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !item.read && styles.unreadCard
      ]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationHeader}>
        <View style={styles.notificationIcon}>
          <Text style={styles.iconText}>{getNotificationIcon(item.type)}</Text>
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
        {!item.read && <View style={styles.unreadDot} />}
      </View>
      <Text style={styles.notificationMessage}>{item.message}</Text>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />

      {notifications.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                'Clear All',
                'Are you sure you want to mark all notifications as read?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', onPress: () => {
                    setNotifications(prev => 
                      prev.map(notif => ({ ...notif, read: true }))
                    );
                  }},
                ]
              );
            }}
          >
            <Text style={styles.clearButtonText}>Mark All as Read</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#111111',
  },
  title: {
    color: '#FF6600',
    fontSize: 24,
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 10,
  },
  notificationCard: {
    backgroundColor: '#111111',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#333333',
  },
  unreadCard: {
    borderLeftColor: '#FF6600',
    backgroundColor: '#1a1a1a',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#222222',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  notificationTime: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6600',
  },
  notificationMessage: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
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
  footer: {
    padding: 20,
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  clearButton: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default NotificationsScreen;
