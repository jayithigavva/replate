import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Switch,
  Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          // TODO: Implement account deletion
          Alert.alert('Feature Coming Soon', 'Account deletion will be available in a future update.');
        }},
      ]
    );
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact us?',
      [
        { 
          text: 'Call Now', 
          onPress: () => Linking.openURL('tel:+918465968724')
        },
        { 
          text: 'Send Email', 
          onPress: () => Linking.openURL('mailto:support@replate.app?subject=Support Request')
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'Replate - Food Waste Reduction App\n\n' +
      '🔒 YOUR PRIVACY MATTERS\n\n' +
      'Data We Collect:\n' +
      '• Email and authentication info\n' +
      '• Location data (for pickup coordination)\n' +
      '• Food images (for AI analysis)\n' +
      '• Usage statistics\n\n' +
      'How We Use It:\n' +
      '• Connect restaurants with NGOs\n' +
      '• AI food safety detection\n' +
      '• Improve our services\n' +
      '• Send notifications about pickups\n\n' +
      'We Never:\n' +
      '• Sell your data\n' +
      '• Share without permission\n' +
      '• Track you unnecessarily\n\n' +
      'Your Rights:\n' +
      '• Delete your data anytime\n' +
      '• Export your information\n' +
      '• Opt out of communications\n\n' +
      'Contact: support@replate.app\n' +
      'Phone: +91 8465968724',
      [{ text: 'I Understand', style: 'default' }],
      { cancelable: true }
    );
  };

  const handleTermsOfService = () => {
    Alert.alert(
      'Terms of Service',
      'Replate Terms of Service\n\n' +
      '📜 AGREEMENT\n\n' +
      'By using Replate, you agree to:\n\n' +
      '1. Food Safety:\n' +
      '• Restaurants ensure food quality\n' +
      '• Use AI as guidance, not absolute\n' +
      '• Follow local health regulations\n\n' +
      '2. Liability:\n' +
      '• Replate facilitates connections only\n' +
      '• Users responsible for food safety\n' +
      '• AI provides estimates, not guarantees\n\n' +
      '3. Usage:\n' +
      '• Use for food waste reduction\n' +
      '• Accurate information required\n' +
      '• Respect other users\n\n' +
      '4. Account:\n' +
      '• One account per user/organization\n' +
      '• Keep credentials secure\n' +
      '• Report issues promptly\n\n' +
      'For full terms, visit: www.replate.app/terms\n' +
      'Contact: +91 8465968724',
      [{ text: 'Agree', style: 'default' }],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* User Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.userInfo}>
          <View style={styles.userDetail}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}</Text>
          </View>
          <View style={styles.userDetail}>
            <Text style={styles.label}>Member Since</Text>
            <Text style={styles.value}>
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Push Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#333333', true: '#FF6600' }}
            thumbColor={notifications ? '#FFFFFF' : '#CCCCCC'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Location Sharing</Text>
          <Switch
            value={locationSharing}
            onValueChange={setLocationSharing}
            trackColor={{ false: '#333333', true: '#FF6600' }}
            thumbColor={locationSharing ? '#FFFFFF' : '#CCCCCC'}
          />
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: '#333333', true: '#FF6600' }}
            thumbColor={darkMode ? '#FFFFFF' : '#CCCCCC'}
          />
        </View>
      </View>

      {/* Statistics */}
      {user?.role === 'restaurant' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Food Items Saved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Meals Donated</Text>
            </View>
          </View>
        </View>
      )}

      {user?.role === 'ngo' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Impact</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>Pickups Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>People Fed</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Actions</Text>
        
        <TouchableOpacity style={styles.actionButton} onPress={() => {
          Alert.alert('Feature Coming Soon', 'Password change will be available in a future update.');
        }}>
          <Text style={styles.actionButtonText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleContactSupport}>
          <Text style={styles.actionButtonText}>📞 Contact Support</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handlePrivacyPolicy}>
          <Text style={styles.actionButtonText}>🔒 Privacy Policy</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleTermsOfService}>
          <Text style={styles.actionButtonText}>📜 Terms of Service</Text>
        </TouchableOpacity>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Danger Zone</Text>
        
        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleDeleteAccount}>
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, styles.dangerButton]} onPress={handleSignOut}>
          <Text style={[styles.actionButtonText, styles.dangerButtonText]}>Sign Out</Text>
        </TouchableOpacity>
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
  title: {
    color: '#FF6600',
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#111111',
    margin: 10,
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    color: '#FF6600',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  userInfo: {
    gap: 15,
  },
  userDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  label: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#222222',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FF6600',
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
  },
  actionButton: {
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#4d1a1a',
    borderWidth: 1,
    borderColor: '#F44336',
  },
  dangerButtonText: {
    color: '#F44336',
  },
});

export default ProfileScreen;
