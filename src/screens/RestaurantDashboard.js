import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  TextInput,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config/api';

const RestaurantDashboard = ({ navigation }) => {
  const { user, signOut } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [pickupReady, setPickupReady] = useState(false);

  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/chat-history/${user.id}`);
      const data = await response.json();
      if (data.success) {
        setChatHistory(data.messages);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setScanResult(null);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setScanResult(null);
    }
  };

  const scanFood = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'food.jpg',
      });
      formData.append('userId', user.id);

      const response = await fetch(`${API_BASE_URL}/scan-food`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = await response.json();

      if (data.success) {
        setScanResult(data);
        if (data.status === 'safe') {
          setPickupReady(true);
        }
      } else {
        Alert.alert('Error', data.error || 'Failed to scan food');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to scan food');
    } finally {
      setLoading(false);
    }
  };

  const markReadyForPickup = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ready-pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: user.id,
          description: scanResult ? `Food scan result: ${scanResult.status}` : 'Food ready for pickup',
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Food marked as ready for pickup! NGOs will be notified.');
        setPickupReady(false);
      } else {
        Alert.alert('Error', data.error || 'Failed to mark food as ready');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to mark food as ready');
    }
  };

  const sendChatMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      message: chatMessage,
      is_user: true,
      created_at: new Date().toISOString(),
    };

    setChatHistory(prev => [...prev, userMessage]);
    setChatMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          message: chatMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage = {
          id: Date.now() + 1,
          message: data.response,
          is_user: false,
          created_at: new Date().toISOString(),
        };
        setChatHistory(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
    }
  };

  const renderChatMessage = ({ item }) => (
    <View style={[
      styles.chatMessage,
      item.is_user ? styles.userMessage : styles.botMessage
    ]}>
      <Text style={[
        styles.chatText,
        item.is_user ? styles.userChatText : styles.botChatText
      ]}>
        {item.message}
      </Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.email}</Text>
      </View>

      {/* Image Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Food Image</Text>
        <View style={styles.imageButtons}>
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Text style={styles.imageButtonText}>📷 Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Text style={styles.imageButtonText}>📸 Camera</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.image} />
            <TouchableOpacity
              style={[styles.scanButton, loading && styles.buttonDisabled]}
              onPress={scanFood}
              disabled={loading}
            >
              <Text style={styles.scanButtonText}>
                {loading ? 'Scanning...' : '🔍 Scan Food'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Scan Results */}
      {scanResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Analysis Result</Text>
          <View style={[
            styles.resultContainer,
            scanResult.status === 'safe' ? styles.safeResult : styles.spoiledResult
          ]}>
            <Text style={styles.resultStatus}>
              {scanResult.status === 'safe' ? '✅ Safe to Eat' : '❌ Spoiled - Do Not Eat'}
            </Text>
            <Text style={styles.resultMessage}>{scanResult.message}</Text>
            <Text style={styles.confidenceText}>
              AI Confidence: {Math.round(scanResult.confidence * 100)}%
            </Text>
            
            {/* Show detected food type if available */}
            {scanResult.foodType && (
              <Text style={styles.foodTypeText}>
                Detected: {scanResult.foodType}
              </Text>
            )}
            
            {/* Show freshness level if available */}
            {scanResult.freshness && (
              <Text style={styles.freshnessText}>
                Freshness: {scanResult.freshness}
              </Text>
            )}
            
            {/* Show spoilage indicators if available */}
            {scanResult.indicators && scanResult.indicators.length > 0 && (
              <View style={styles.indicatorsContainer}>
                <Text style={styles.indicatorsTitle}>Detected Issues:</Text>
                {scanResult.indicators.map((indicator, index) => (
                  <Text key={index} style={styles.indicatorText}>
                    • {indicator}
                  </Text>
                ))}
              </View>
            )}
            
            {/* Safety warning for spoiled food */}
            {scanResult.status === 'spoiled' && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ This food shows signs of spoilage and should not be consumed
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Ready for Pickup */}
      {pickupReady && (
        <View style={styles.section}>
          <TouchableOpacity style={styles.pickupButton} onPress={markReadyForPickup}>
            <Text style={styles.pickupButtonText}>🚚 Ready for Pickup</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Chatbot */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Food Safety Assistant</Text>
        <View style={styles.chatContainer}>
          <FlatList
            data={chatHistory}
            renderItem={renderChatMessage}
            keyExtractor={(item) => item.id.toString()}
            style={styles.chatHistory}
          />
          <View style={styles.chatInput}>
            <TextInput
              style={styles.chatTextInput}
              placeholder="Ask about food safety..."
              placeholderTextColor="#666"
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendChatMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  section: {
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
  imageButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  imageButton: {
    flex: 1,
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageContainer: {
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 15,
  },
  scanButton: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  scanButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#666666',
  },
  resultContainer: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  safeResult: {
    backgroundColor: '#1a4d1a',
    borderColor: '#4CAF50',
  },
  spoiledResult: {
    backgroundColor: '#4d1a1a',
    borderColor: '#F44336',
  },
  resultStatus: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  resultMessage: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  confidenceText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  foodTypeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  freshnessText: {
    color: '#FFCCCC',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 5,
  },
  indicatorsContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 8,
  },
  indicatorsTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  indicatorText: {
    color: '#FFCCCC',
    fontSize: 12,
    marginBottom: 2,
  },
  warningContainer: {
    marginTop: 10,
    padding: 10,
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  warningText: {
    color: '#FFCCCC',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  pickupButton: {
    backgroundColor: '#FF6600',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  pickupButtonText: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatContainer: {
    height: 300,
  },
  chatHistory: {
    flex: 1,
    marginBottom: 10,
  },
  chatMessage: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#FF6600',
    alignSelf: 'flex-end',
  },
  botMessage: {
    backgroundColor: '#222222',
    alignSelf: 'flex-start',
  },
  chatText: {
    fontSize: 14,
  },
  userChatText: {
    color: '#000000',
  },
  botChatText: {
    color: '#FFFFFF',
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 10,
    color: '#FFFFFF',
    marginRight: 10,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#FF6600',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
});

export default RestaurantDashboard;
