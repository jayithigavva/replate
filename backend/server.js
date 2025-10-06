const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { createClient } = require('@supabase/supabase-js');
const FoodSpoilageModel = require('./ai/FoodSpoilageModel');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Custom AI Model
let customAIModel = null;
try {
  customAIModel = new FoodSpoilageModel();
  console.log('✅ Custom AI model initialized');
} catch (error) {
  console.log('⚠️ Custom AI model not available:', error.message);
}

// Initialize Supabase client (optional for testing)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_URL !== 'your_supabase_project_url') {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  console.log('✅ Supabase connected');
} else {
  console.log('⚠️ Supabase not configured - using mock database');
}


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Custom AI Model Configuration
// All food analysis is handled by the custom AI model

// Analyze food image using ONLY Custom AI Model
async function analyzeFoodImage(imageBuffer) {
  try {
    if (!customAIModel) {
      throw new Error('Custom AI model not available');
    }
    
    console.log('🤖 Analyzing food with Custom AI Model...');
    const analysis = await customAIModel.analyzeFood(imageBuffer);
    
    if (!analysis || !analysis.status) {
      throw new Error('Custom AI analysis failed');
    }
    
    console.log('✅ Custom AI analysis completed successfully');
    return analysis;
    
  } catch (error) {
    console.error('❌ Custom AI analysis error:', error);
    return {
      status: 'safe',
      confidence: 0.5,
      message: 'Custom AI model unavailable. Please check for visible signs of spoilage and use your judgment.',
      indicators: ['ai_model_unavailable'],
      foodType: 'unknown',
      recommendations: ['Check for visible signs of spoilage', 'Use your senses to assess freshness', 'Contact support if issue persists'],
      freshness: 'unknown'
    };
  }
}

// Custom AI Model handles all analysis - no external APIs needed

// All food analysis is handled by the Custom AI Model
// No external APIs or mock functions needed

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Scan food endpoint
app.post('/scan-food', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Analyze the image
    const analysis = await analyzeFoodImage(req.file.buffer);
    
    // Handle image storage and database saving
    let imageUrl = '';
    let scanId = `scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    if (supabase) {
      // Upload image to Supabase Storage
      const fileName = `food-scan-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('food-images')
        .upload(fileName, req.file.buffer, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (!uploadError) {
        imageUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/food-images/${fileName}`;
      }

      // Save scan result to database
      const { data: scanData, error: scanError } = await supabase
        .from('food_scans')
        .insert({
          user_id: userId,
          image_url: imageUrl,
          status: analysis.status,
          ai_confidence: analysis.confidence
        })
        .select()
        .single();

      if (!scanError) {
        scanId = scanData.id;
      }
    } else {
      console.log('📊 Mock mode: Scan result not saved to database');
    }

    res.json({
      success: true,
      scanId: scanId,
      status: analysis.status,
      confidence: analysis.confidence,
      message: analysis.message,
      imageUrl: imageUrl,
      foodType: analysis.foodType,
      freshness: analysis.freshness,
      indicators: analysis.indicators,
      recommendations: analysis.recommendations
    });

  } catch (error) {
    console.error('Scan food error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark food ready for pickup
app.post('/ready-pickup', async (req, res) => {
  try {
    const { restaurantId, location, address, description } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID required' });
    }

    let pickupId = `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (supabase) {
      // Verify user is a restaurant
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', restaurantId)
        .single();

      if (userError || !user || user.role !== 'restaurant') {
        return res.status(400).json({ error: 'Invalid restaurant ID' });
      }

      // Create pickup record
      const { data: pickupData, error: pickupError } = await supabase
        .from('pickups')
        .insert({
          restaurant_id: restaurantId,
          status: 'ready',
          location: location ? `POINT(${location.longitude} ${location.latitude})` : null,
          address: address || '',
          description: description || ''
        })
        .select()
        .single();

      if (!pickupError) {
        pickupId = pickupData.id;
      }
    } else {
      console.log('📊 Mock mode: Pickup not saved to database');
    }

    res.json({
      success: true,
      pickupId: pickupId,
      message: 'Food marked as ready for pickup'
    });

  } catch (error) {
    console.error('Ready pickup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get NGO dashboard data
app.get('/ngo-dashboard', async (req, res) => {
  try {
    const { ngoId } = req.query;

    if (!ngoId) {
      return res.status(400).json({ error: 'NGO ID required' });
    }

    let pickups = [];
    let groupedPickups = {};

    if (supabase) {
      // Verify user is an NGO
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', ngoId)
        .single();

      if (userError || !user || user.role !== 'ngo') {
        return res.status(400).json({ error: 'Invalid NGO ID' });
      }

      // Get all ready pickups with restaurant details
      const { data: pickupData, error: pickupsError } = await supabase
        .from('pickups')
        .select(`
          *,
          restaurant:restaurant_id (
            id,
            email,
            created_at
          )
        `)
        .eq('status', 'ready')
        .order('created_at', { ascending: false });

      if (!pickupsError) {
        pickups = pickupData;
      }
    } else {
      // Mock data for testing
      pickups = [
        {
          id: 'mock-pickup-1',
          restaurant_id: 'mock-restaurant-1',
          status: 'ready',
          address: '123 Main St, City',
          description: 'Fresh vegetables ready for pickup',
          created_at: new Date().toISOString(),
          restaurant: {
            id: 'mock-restaurant-1',
            email: 'restaurant@example.com',
            created_at: new Date().toISOString()
          }
        }
      ];
      console.log('📊 Mock mode: Using sample pickup data');
    }

    // Group pickups by location for route optimization
    groupedPickups = pickups.reduce((groups, pickup) => {
      const key = pickup.address || 'Unknown Location';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(pickup);
      return groups;
    }, {});

    res.json({
      success: true,
      pickups: pickups,
      groupedPickups: groupedPickups,
      totalPickups: pickups.length
    });

  } catch (error) {
    console.error('NGO dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update pickup status (for NGOs)
app.put('/pickup/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, ngoId } = req.body;

    if (!status || !ngoId) {
      return res.status(400).json({ error: 'Status and NGO ID required' });
    }

    // Verify user is an NGO
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', ngoId)
      .single();

    if (userError || !user || user.role !== 'ngo') {
      return res.status(400).json({ error: 'Invalid NGO ID' });
    }

    // Update pickup status
    const { data: pickupData, error: pickupError } = await supabase
      .from('pickups')
      .update({ 
        status: status,
        ngo_id: ngoId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (pickupError) {
      console.error('Database error:', pickupError);
      return res.status(500).json({ error: 'Failed to update pickup status' });
    }

    res.json({
      success: true,
      pickup: pickupData,
      message: 'Pickup status updated successfully'
    });

  } catch (error) {
    console.error('Update pickup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chatbot endpoint
app.post('/chatbot', async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ error: 'User ID and message required' });
    }

    // Save user message (if Supabase is available)
    if (supabase) {
      await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message: message,
          is_user: true
        });
    }

    // Simple chatbot responses (you can enhance this with AI)
    let botResponse = '';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('storage') || lowerMessage.includes('preserve')) {
      botResponse = 'To preserve food longer: store in airtight containers, keep refrigerated below 4°C, use within 2-3 days for cooked food, and freeze leftovers within 2 hours of cooking.';
    } else if (lowerMessage.includes('safe') || lowerMessage.includes('fresh')) {
      botResponse = 'Check for: unusual odors, mold, slimy texture, or discoloration. When in doubt, it\'s better to discard food to prevent foodborne illness.';
    } else if (lowerMessage.includes('temperature') || lowerMessage.includes('cold')) {
      botResponse = 'Maintain proper temperatures: refrigerate at 4°C or below, freeze at -18°C or below, and keep hot food above 60°C.';
    } else {
      botResponse = 'I can help with food safety tips! Ask me about storage, preservation, temperature control, or how to tell if food is safe to eat.';
    }

    // Save bot response (if Supabase is available)
    if (supabase) {
      await supabase
        .from('chat_messages')
        .insert({
          user_id: userId,
          message: botResponse,
          is_user: false
        });
    }

    res.json({
      success: true,
      response: botResponse
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history
app.get('/chat-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let messages = [];

    if (supabase) {
      const { data: messageData, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (!error) {
        messages = messageData;
      }
    } else {
      // Mock chat history for testing
      messages = [
        {
          id: 'mock-message-1',
          user_id: userId,
          message: 'Hello! How can I help with food safety?',
          is_user: false,
          created_at: new Date().toISOString()
        }
      ];
      console.log('📊 Mock mode: Using sample chat history');
    }

    res.json({
      success: true,
      messages: messages
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Replate backend server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
