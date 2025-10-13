import React, { useState, useEffect, useRef } from 'react';
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
  Platform,
  Modal,
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
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupDetails, setPickupDetails] = useState({
    foodType: '',
    quantity: '',
    expiryTime: '',
    notes: '',
  });

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

  const sampleImages = [
    { id: 1, name: 'Fresh Apple', uri: require('../../assets/samples/fresh_apple.png'), expected: 'fresh' },
    { id: 2, name: 'Fresh Banana', uri: require('../../assets/samples/fresh_banana.png'), expected: 'fresh' },
    { id: 3, name: 'Rotten Apple', uri: require('../../assets/samples/rotten_apple.png'), expected: 'spoiled' },
    { id: 4, name: 'Rotten Banana', uri: require('../../assets/samples/rotten_banana.png'), expected: 'spoiled' },
  ];

  const trySampleImage = (sample) => {
    setSelectedImage({
      uri: sample.uri,
      name: sample.name,
      isSample: true, // Flag to identify sample images
    });
    setScanResult(null);
    Alert.alert('Sample Selected', `Try scanning: ${sample.name}\n\nExpected: ${sample.expected === 'fresh' ? '✅ Safe to Eat' : '⚠️ Spoiled'}`);
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
      // For sample images (bundled assets), we need to get the actual URI
      let imageUri = selectedImage.uri;
      
      // If it's a sample image (require()), convert it to string URI
      if (selectedImage.isSample) {
        // For bundled assets, Image.resolveAssetSource gives us the actual URI
        const { Image: RNImage } = require('react-native');
        const resolvedAsset = RNImage.resolveAssetSource(selectedImage.uri);
        if (resolvedAsset && resolvedAsset.uri) {
          imageUri = resolvedAsset.uri;
        }
      }

      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/png',
        name: selectedImage.name || 'food.jpg',
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
      console.error('Scan error:', error);
      Alert.alert('Error', 'Failed to scan food: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openPickupModal = () => {
    // Pre-fill food type if AI detected it
    if (scanResult && scanResult.foodType) {
      setPickupDetails(prev => ({ ...prev, foodType: scanResult.foodType }));
    }
    setShowPickupModal(true);
  };

  const submitPickupRequest = async () => {
    // Validation
    if (!pickupDetails.foodType || !pickupDetails.quantity) {
      Alert.alert('Missing Information', 'Please fill in food type and quantity');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/ready-pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId: user.id,
          restaurantEmail: user.email,
          foodType: pickupDetails.foodType,
          quantity: pickupDetails.quantity,
          expiryTime: pickupDetails.expiryTime,
          notes: pickupDetails.notes,
          aiScanResult: scanResult ? scanResult.status : 'not_scanned',
          aiConfidence: scanResult ? scanResult.confidence : 0,
          imageUrl: selectedImage ? selectedImage.uri : null,
          description: `${pickupDetails.foodType} - ${pickupDetails.quantity}`,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert(
          '✅ Success!', 
          `Your food donation is now listed!\n\n📢 All NGOs in your area have been notified.\n\n🗺️ Your location is now visible on the NGO map.\n\n📱 You'll get a notification when an NGO accepts the pickup.`,
          [{ text: 'OK', onPress: () => {
            setShowPickupModal(false);
            setPickupReady(false);
            setPickupDetails({ foodType: '', quantity: '', expiryTime: '', notes: '' });
          }}]
        );
      } else {
        Alert.alert('Error', data.error || 'Failed to create pickup');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create pickup request. Please try again.');
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome, {user?.email}</Text>
      </View>

      <ScrollView style={styles.scrollContent} contentContainerStyle={styles.scrollContainer}>
        {/* Image Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📸 Upload Food Image</Text>
          
          {/* Drag & Drop Area */}
          <TouchableOpacity 
            style={styles.dragDropArea} 
            onPress={pickImage}
            activeOpacity={0.7}
          >
            <Text style={styles.dragDropIcon}>📤</Text>
            <Text style={styles.dragDropText}>Tap to Upload Image</Text>
            <Text style={styles.dragDropSubtext}>or choose an option below</Text>
          </TouchableOpacity>

          <View style={styles.imageButtons}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonText}>📷 Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
              <Text style={styles.imageButtonText}>📸 Camera</Text>
            </TouchableOpacity>
          </View>

          {/* Sample Images Section */}
          <View style={styles.sampleSection}>
            <Text style={styles.sampleTitle}>🎯 Try Sample Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sampleScroll}>
              {sampleImages.map((sample) => (
                <TouchableOpacity
                  key={sample.id}
                  style={styles.sampleCard}
                  onPress={() => trySampleImage(sample)}
                >
                  <Image source={sample.uri} style={styles.sampleImage} />
                  <Text style={styles.sampleName}>{sample.name}</Text>
                  <Text style={styles.sampleExpected}>
                    {sample.expected === 'fresh' ? '✅ Fresh' : '⚠️ Spoiled'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

        {selectedImage && (
          <View style={styles.imageContainer}>
            <Image 
              source={selectedImage.isSample ? selectedImage.uri : { uri: selectedImage.uri }} 
              style={styles.image} 
            />
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
              {scanResult.status === 'safe' ? '✅ SAFE TO DONATE' : '❌ NOT SAFE - DO NOT DONATE'}
            </Text>
            <Text style={styles.confidenceText}>
              Confidence: {Math.round(scanResult.confidence * 100)}%
            </Text>
            
            {/* Safety warning for spoiled food */}
            {scanResult.status === 'spoiled' && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ This food should not be donated
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Ready for Pickup - Available Always */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.pickupButton} onPress={openPickupModal}>
          <Text style={styles.pickupButtonText}>🚚 Create Food Donation</Text>
        </TouchableOpacity>
        {scanResult && scanResult.status === 'safe' && (
          <Text style={styles.pickupHint}>
            ✅ AI Verified Safe • 📢 NGOs will be notified instantly
          </Text>
        )}
        {!scanResult && (
          <Text style={styles.pickupHint}>
            💡 Optional: Scan food first for AI verification • 📢 NGOs will be notified instantly
          </Text>
        )}
      </View>

        {/* Chatbot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💬 Food Safety Assistant</Text>
          <View style={styles.chatContainer}>
            <View style={styles.chatHistory}>
              {chatHistory.map((item) => (
                <View
                  key={item.id.toString()}
                  style={[
                    styles.chatMessage,
                    item.is_user ? styles.userMessage : styles.botMessage
                  ]}
                >
                  <Text style={[
                    styles.chatText,
                    item.is_user ? styles.userChatText : styles.botChatText
                  ]}>
                    {item.message}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.chatInput}>
              <TextInput
                style={styles.chatTextInput}
                placeholder="Ask: Why is my food brown?"
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

      {/* Pickup Details Modal */}
      <Modal
        visible={showPickupModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPickupModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🚚 Pickup Details</Text>
            <Text style={styles.modalSubtitle}>Fill in the details for NGO donors</Text>

            <Text style={styles.inputLabel}>Food Type *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cooked rice and vegetables, Pizza, Curry"
              placeholderTextColor="#666"
              value={pickupDetails.foodType}
              onChangeText={(text) => setPickupDetails({...pickupDetails, foodType: text})}
            />

            <Text style={styles.inputLabel}>Quantity * </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 20 servings, 5kg, 10 plates"
              placeholderTextColor="#666"
              value={pickupDetails.quantity}
              onChangeText={(text) => setPickupDetails({...pickupDetails, quantity: text})}
            />

            <Text style={styles.inputLabel}>Pickup By (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 8 PM today, Within 2 hours"
              placeholderTextColor="#666"
              value={pickupDetails.expiryTime}
              onChangeText={(text) => setPickupDetails({...pickupDetails, expiryTime: text})}
            />

            <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Allergens, special instructions, container type, etc."
              placeholderTextColor="#666"
              value={pickupDetails.notes}
              onChangeText={(text) => setPickupDetails({...pickupDetails, notes: text})}
              multiline
              numberOfLines={3}
            />

            {scanResult ? (
              <View style={[styles.scanBadge, scanResult.status === 'safe' ? styles.safeBadge : styles.spoiledBadge]}>
                <Text style={styles.scanBadgeText}>
                  {scanResult.status === 'safe' ? '✅ SAFE' : '⚠️ NOT SAFE'} • {Math.round(scanResult.confidence * 100)}% Confidence
                </Text>
              </View>
            ) : (
              <View style={[styles.scanBadge, styles.notScannedBadge]}>
                <Text style={styles.scanBadgeText}>
                  ℹ️ Not scanned - Food safety verification is optional but recommended
                </Text>
              </View>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPickupModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={submitPickupRequest}
              >
                <Text style={styles.submitButtonText}>✅ Confirm Pickup</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalInfo}>
              📱 NGOs will be instantly notified{'\n'}
              🗺️ Your location will appear on their map{'\n'}
              🔔 You'll be notified when someone accepts
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 20,
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
  dragDropArea: {
    backgroundColor: '#0a0a0a',
    borderWidth: 2,
    borderColor: '#FF6600',
    borderStyle: 'dashed',
    borderRadius: 15,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    minHeight: 150,
  },
  dragDropIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  dragDropText: {
    color: '#FF6600',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dragDropSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
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
  pickupHint: {
    color: '#CCCCCC',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#111111',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    maxHeight: '90%',
  },
  modalTitle: {
    color: '#FF6600',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#222222',
    borderRadius: 10,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  scanBadge: {
    backgroundColor: '#1a4d1a',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  safeBadge: {
    backgroundColor: '#1a4d1a',
    borderColor: '#4CAF50',
  },
  spoiledBadge: {
    backgroundColor: '#4d1a1a',
    borderColor: '#f44336',
  },
  notScannedBadge: {
    backgroundColor: '#1a3d4d',
    borderColor: '#2196F3',
  },
  scanBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#333333',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FF6600',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalInfo: {
    color: '#999999',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 16,
  },
  chatContainer: {
    minHeight: 300,
    maxHeight: 400,
  },
  chatHistory: {
    minHeight: 200,
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#0a0a0a',
    borderRadius: 10,
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
  sampleSection: {
    marginTop: 20,
    marginBottom: 10,
  },
  sampleTitle: {
    color: '#FF6600',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sampleScroll: {
    flexDirection: 'row',
  },
  sampleCard: {
    backgroundColor: '#222222',
    borderRadius: 12,
    marginRight: 15,
    padding: 10,
    alignItems: 'center',
    width: 140,
    borderWidth: 2,
    borderColor: '#333333',
  },
  sampleImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  sampleName: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  sampleExpected: {
    color: '#CCCCCC',
    fontSize: 11,
    textAlign: 'center',
  },
});

export default RestaurantDashboard;
