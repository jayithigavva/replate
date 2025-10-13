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
let modelReady = false;

async function initializeAIModel() {
  try {
    customAIModel = new FoodSpoilageModel();
    console.log('🤖 Loading AI model...');
    await customAIModel.loadModel();
    modelReady = true;
    console.log('✅ Custom AI model loaded and ready');
  } catch (error) {
    console.log('⚠️ Custom AI model not available:', error.message);
  }
}

// Start loading the model immediately
initializeAIModel();

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
    const { 
      restaurantId, 
      restaurantEmail,
      foodType,
      quantity,
      expiryTime,
      notes,
      aiScanResult,
      aiConfidence,
      imageUrl,
      description,
      location,
      address
    } = req.body;

    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant ID required' });
    }

    let pickupId = `pickup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    if (supabase) {
      // Verify user is a restaurant
      const { data: user, error: userError} = await supabase
        .from('users')
        .select('role')
        .eq('id', restaurantId)
        .single();

      if (userError || !user || user.role !== 'restaurant') {
        console.error('User validation error:', userError);
        return res.status(400).json({ error: 'Invalid restaurant ID' });
      }

      // Create pickup record with ALL fields
      const { data: pickupData, error: pickupError } = await supabase
        .from('pickups')
        .insert({
          restaurant_id: restaurantId,
          status: 'available',
          food_type: foodType || '',
          quantity: quantity || '',
          expiry_time: expiryTime || null,
          notes: notes || '',
          ai_scan_result: aiScanResult || 'not_scanned',
          ai_confidence: aiConfidence || 0,
          image_url: imageUrl || null,
          description: description || `${foodType} - ${quantity}`,
          location: location ? `POINT(${location.longitude} ${location.latitude})` : null,
          address: address || ''
        })
        .select()
        .single();

      if (pickupError) {
        console.error('Pickup creation error:', pickupError);
        return res.status(500).json({ error: 'Failed to create pickup', details: pickupError.message });
      }

      if (pickupData) {
        pickupId = pickupData.id;
        console.log('✅ Pickup created successfully:', pickupId);
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
    res.status(500).json({ error: 'Internal server error', details: error.message });
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

      // Get all available pickups with restaurant details
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
        .in('status', ['available', 'ready', 'accepted'])
        .order('created_at', { ascending: false });

      // Add restaurant name from email
      if (pickupData) {
        pickupData.forEach(pickup => {
          if (pickup.restaurant?.email) {
            // Extract name from email (before @)
            pickup.restaurant_name = pickup.restaurant.email.split('@')[0];
          }
        });
      }

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

    // SUPER COMPREHENSIVE Food Safety Chatbot - 100+ Questions
    let botResponse = '';
    const lowerMessage = message.toLowerCase();

    // 🥩 CHICKEN SPECIFIC QUESTIONS
    if (lowerMessage.includes('raw chicken') && (lowerMessage.includes('fridge') || lowerMessage.includes('store') || lowerMessage.includes('long'))) {
      botResponse = '🐔 Raw Chicken Storage:\n\n**Refrigerator**: 1-2 days max\n**Freezer**: 9-12 months\n\n**Storage Tips**:\n• Keep in original packaging or sealed container\n• Place on bottom shelf (prevent drips)\n• Never wash before storing\n• Store away from ready-to-eat foods\n\n**Signs of Spoilage**:\n• Gray or yellow color\n• Slimy texture\n• Sour or ammonia smell\n• Tacky/sticky surface\n\n**When in doubt, throw it out!**';
    }
    else if (lowerMessage.includes('chicken curry') && lowerMessage.includes('freeze')) {
      botResponse = '🍛 Freezing Cooked Chicken Curry:\n\n**Yes, you can freeze it!**\n\n**Storage Times**:\n• Fridge: 3-4 days\n• Freezer: 2-3 months\n\n**Best Practices**:\n• Cool completely before freezing\n• Use airtight containers or freezer bags\n• Leave 1-2cm space for expansion\n• Label with date\n• Remove excess air\n\n**Thawing**:\n• Overnight in fridge (safest)\n• Use within 24 hours after thawing\n\n**Reheating**:\n• Heat to 74°C (steaming hot)\n• Stir well\n• Only reheat once';
    }
    else if ((lowerMessage.includes('thaw') || lowerMessage.includes('defrost')) && lowerMessage.includes('counter')) {
      botResponse = '⚠️ NEVER Thaw on Counter!\n\n**Why It\'s Dangerous**:\n• Bacteria multiply rapidly at room temp\n• Outer parts enter danger zone while inside still frozen\n• High risk of food poisoning\n\n**Safe Thawing Methods**:\n\n1. **Refrigerator** (Best):\n   • Takes 24hrs for 2kg\n   • Safest method\n   • Can take 1-2 days\n\n2. **Cold Water**:\n   • In sealed bag\n   • Change water every 30 min\n   • Cook immediately after\n\n3. **Microwave**:\n   • Use defrost setting\n   • Cook immediately\n   • May partially cook meat\n\n**Never**: Counter, hot water, or room temperature!';
    }
    else if (lowerMessage.includes('ground beef') || lowerMessage.includes('mince')) {
      botResponse = '🥩 Ground Beef/Mince Storage:\n\n**Fridge**: 1-2 days only!\n**Freezer**: 3-4 months\n\n**Why Short Fridge Life?**\n• More surface area = more bacteria\n• Processed = higher contamination risk\n\n**Storage Tips**:\n• Use within 1-2 days of purchase\n• Freeze if not using soon\n• Store at 1-2°C\n• Keep wrapped tightly\n\n**Refreezing**:\n• ❌ Don\'t refreeze thawed raw mince\n• ✅ Can freeze cooked mince\n\n**Cook to 71°C minimum**\n**Color**: Brown in center is fine after cooking\n**Smell**: Any sour/off smell = discard';
    }
    else if (lowerMessage.includes('steak') && lowerMessage.includes('leftover')) {
      botResponse = '🥩 Leftover Cooked Steak:\n\n**Storage**:\n• Fridge: 3-4 days max\n• Freezer: 2-3 months\n\n**Best Practices**:\n• Cool within 2 hours\n• Wrap tightly in foil/plastic\n• Store in airtight container\n• Slice before storing (optional)\n\n**Reheating**:\n• Low heat to avoid drying\n• Microwave: 30-second intervals\n• Oven: 120°C, cover with foil\n• Pan: Low heat with butter\n\n**Quality Tips**:\n• Add sauce when reheating\n• Don\'t overheat (gets tough)\n• Best consumed within 1-2 days for quality';
    }
    else if (lowerMessage.includes('fish') || lowerMessage.includes('seafood') || lowerMessage.includes('salmon') || lowerMessage.includes('shrimp') || lowerMessage.includes('prawn')) {
      botResponse = '🐟 Seafood Storage & Safety:\n\n**Raw Fish/Seafood**:\n• Fridge: 1-2 days MAX\n• Freezer: 3-6 months\n• Keep on ice in fridge\n• Bottom shelf only\n\n**Cooked Seafood**:\n• Fridge: 3-4 days\n• Freezer: 2-3 months\n\n**Fresh Seafood Signs**:\n✅ Clear, bright eyes\n✅ Firm, elastic flesh\n✅ Mild ocean smell\n✅ Bright red/pink gills\n\n**Spoiled Signs**:\n❌ Fishy/ammonia smell\n❌ Slimy texture\n❌ Dull, sunken eyes\n❌ Discolored flesh\n\n**Store shrimp**: In sealed bag on ice, use within 1-2 days\n**Thaw fish**: In fridge overnight, never at room temp';
    }
    else if (lowerMessage.includes('lamb chops') || lowerMessage.includes('lamb')) {
      botResponse = '🐑 Lamb Storage:\n\n**Raw Lamb**:\n• Chops: 3-5 days (fridge)\n• Ground lamb: 1-2 days (fridge)\n• Freezer: 6-9 months\n\n**Storage**:\n• Original packaging or sealed\n• Bottom shelf of fridge\n• Away from cooked foods\n\n**Freezing Tips**:\n• Wrap in freezer paper\n• Then in freezer bag\n• Remove all air\n• Label with date\n\n**Thawing**:\n• In fridge: 24 hours per kg\n• Cook within 3-5 days after thawing\n\n**Cooked Lamb**:\n• Fridge: 3-4 days\n• Freezer: 2-3 months';
    }
    else if (lowerMessage.includes('marinate') && lowerMessage.includes('overnight')) {
      botResponse = '🥘 Marinating Meat Safely:\n\n**Yes, overnight marinating is SAFE!**\n\n**Rules**:\n• ✅ Always in refrigerator (≤4°C)\n• ✅ Covered container\n• ✅ Up to 24-48 hours\n\n**Never**:\n• ❌ Marinate at room temperature\n• ❌ Reuse marinade from raw meat\n• ❌ Leave longer than 2 days\n\n**Marinade Safety**:\n• Acid-based: Up to 12 hours (can \"cook\" meat)\n• Oil-based: Up to 48 hours\n• Yogurt-based: 24 hours max\n\n**Using Marinade**:\n• Discard used marinade OR\n• Boil for 3 minutes if reusing as sauce\n\n**Best containers**: Glass or food-grade plastic';
    }
    else if (lowerMessage.includes('store packaging') || lowerMessage.includes('original package')) {
      botResponse = '📦 Freezing in Store Packaging:\n\n**Short-term (< 2 months)**: ✅ OK\n**Long-term (> 2 months)**: ❌ Repackage\n\n**Why?**\n• Store wrap allows air penetration\n• Causes freezer burn\n• Not moisture-vapor resistant\n\n**Best Practice**:\n• Overwrap with freezer paper/foil\n• Or transfer to freezer bags\n• Remove ALL air\n• Label with date & contents\n\n**Freezer Burn Prevention**:\n• Double-wrap meat\n• Use vacuum sealer if available\n• Keep freezer at -18°C or below\n• Use within recommended times';
    }
    // 🥚 EGG SPECIFIC QUESTIONS  
    else if (lowerMessage.includes('egg') && lowerMessage.includes('refrigerator')) {
      botResponse = '🥚 Egg Refrigerator Storage:\n\n**Fresh Eggs**: 3-5 weeks in fridge\n**Hard-boiled**: 1 week\n\n**Storage Tips**:\n• Keep in original carton (not door)\n• Store pointed end down\n• Don\'t wash before storing\n• Fridge temp: 4°C or below\n\n**Freshness Test**:\n• **Float test**: Fresh eggs sink, old eggs float\n• **Crack test**: Fresh has thick white, old is watery\n• **Smell test**: No odor = fresh\n\n**After Expiry**:\n• Can use 3-5 weeks past date if stored properly\n• Always do fresh test first';
    }
    else if (lowerMessage.includes('wash eggs')) {
      botResponse = '🚫 DON\'T Wash Eggs Before Storing!\n\n**Why?**\n• Eggs have natural protective coating\n• Washing removes this barrier\n• Bacteria can enter through shell pores\n• Reduces shelf life\n\n**When to Wash**:\n✅ Just before cooking/cracking\n❌ NOT before storing\n\n**If Eggs Are Dirty**:\n• Wipe with dry cloth\n• Or use barely damp paper towel\n• Don\'t soak or rinse\n\n**Store**: In original carton in fridge';
    }
    // 🥛 DAIRY SPECIFIC
    else if (lowerMessage.includes('freeze milk')) {
      botResponse = '🥛 Freezing Milk:\n\n**Yes, you can freeze milk!**\n\n**How**:\n• Pour out 1 cup (milk expands)\n• Seal tightly\n• Freeze up to 3 months\n\n**Thawing**:\n• In fridge for 1-2 days\n• Shake well after thawing\n• Use within 5-7 days\n\n**Quality Notes**:\n• Texture may separate (shake well)\n• Best for cooking, not drinking\n• Low-fat milk freezes better than whole\n\n**Alternatives**:\n• Ice cube trays for small portions\n• Freeze in recipe-sized amounts';
    }
    else if (lowerMessage.includes('butter') && (lowerMessage.includes('outside') || lowerMessage.includes('room temp'))) {
      botResponse = '🧈 Butter at Room Temperature:\n\n**Salted Butter**: 1-2 days (OK)\n**Unsalted Butter**: Use butter dish with lid, 1 day max\n\n**Safe Room Temp Storage**:\n• Use butter crock/dish with lid\n• Keep away from heat/sunlight\n• Only small amounts (1-2 days worth)\n• Change butter regularly\n\n**Refrigerator** (Best):\n• 1-3 months\n• Keep wrapped\n• In butter compartment\n\n**Freezer**:\n• Up to 12 months\n• Wrap tightly\n\n**Signs of Spoilage**:\n• Sour/rancid smell\n• Yellow/dark discoloration\n• Mold growth';
    }
    else if (lowerMessage.includes('paneer')) {
      botResponse = '🧀 Homemade Paneer Storage:\n\n**Fresh Paneer**:\n• In water: 2-3 days (change water daily)\n• Wrapped: 2-3 days in fridge\n• Frozen: 6 months\n\n**Storage Method**:\n1. Submerge in water in airtight container OR\n2. Wrap in damp cloth, then plastic\n3. Keep refrigerated at ≤4°C\n\n**Freezing**:\n• Cut into cubes\n• Flash freeze on tray\n• Transfer to freezer bag\n• Texture changes slightly\n\n**Signs of Spoilage**:\n• Sour smell\n• Slimy texture\n• Mold spots\n• Yellow discoloration';
    }
    else if (lowerMessage.includes('condensed milk')) {
      botResponse = '🥫 Condensed Milk Storage:\n\n**Unopened**: 1 year+ (pantry)\n**Opened**: Transfer to container, fridge 2 weeks\n\n**After Opening**:\n• ❌ Don\'t store in can\n• ✅ Transfer to glass/plastic container\n• Keep refrigerated\n• Cover tightly\n\n**Freezing**:\n• Can freeze up to 3 months\n• Texture may change\n• Thaw in fridge\n\n**Spoilage Signs**:\n• Color change (dark/yellow)\n• Lumpy texture\n• Separated\n• Sour smell\n• Mold';
    }
    else if (lowerMessage.includes('ghee') && lowerMessage.includes('room temp')) {
      botResponse = '🧈 Ghee Storage:\n\n**Room Temperature**: ✅ YES, it\'s safe!\n\n**Storage Duration**:\n• Room temp: 3 months\n• Refrigerator: 6-12 months\n\n**Why It\'s Safe**:\n• No milk solids (removed during clarification)\n• Low moisture content\n• Naturally antimicrobial\n\n**Best Practices**:\n• Use clean, dry spoon always\n• Keep in airtight container\n• Away from heat/sunlight\n• Don\'t mix old and new ghee\n\n**Signs of Spoilage** (rare):\n• Rancid smell\n• Color change\n• Mold (very rare)';
    }
    else if (lowerMessage.includes('whipped cream')) {
      botResponse = '🍰 Whipped Cream Storage:\n\n**Fresh Whipped Cream**:\n• Fridge: 1-2 days max\n• Don\'t freeze (texture breaks)\n\n**Storage**:\n• Airtight container\n• Refrigerate immediately\n• Don\'t leave out > 2 hours\n\n**Aerosol Whipped Cream**:\n• Unopened: Use by date\n• Opened: 2-3 weeks (fridge)\n\n**Signs of Spoilage**:\n• Sour smell/taste\n• Separated/watery\n• Mold\n• Off color\n\n**Tip**: Add 1 tsp sugar per cup to stabilize homemade whipped cream';
    }
    else if (lowerMessage.includes('cottage cheese')) {
      botResponse = '🧀 Cottage Cheese Safety:\n\n**NEVER leave out of fridge!**\n\n**Storage**:\n• Unopened: Use by date\n• Opened: 5-7 days max\n• Must stay refrigerated (≤4°C)\n• Never at room temp > 2 hours\n\n**Spoilage Signs**:\n• Sour smell (more than usual)\n• Mold (any color)\n• Pink/yellow tint\n• Excessive liquid\n• Bitter taste\n\n**Food Safety**:\n• High moisture = bacteria growth\n• Keep cold always\n• Use clean spoon\n• Check date regularly';
    }
    // 🍎 FRUIT SPECIFIC
    else if (lowerMessage.includes('apple') && (lowerMessage.includes('fridge') || lowerMessage.includes('room'))) {
      botResponse = '🍎 Apple Storage:\n\n**Room Temp**: 1 week\n**Refrigerator**: 4-6 weeks\n\n**Best Practice**: Refrigerate for longer freshness\n\n**Storage Tips**:\n• Crisper drawer\n• Separate from strong-smelling foods\n• Don\'t store with vegetables (releases ethylene)\n• Keep in perforated plastic bag\n\n**Room Temp**:\n• Cool, dark place\n• Check daily for soft spots\n• 1 bad apple spoils the bunch!\n\n**Cut Apples**:\n• Sprinkle with lemon juice\n• Airtight container\n• Use within 3-4 days';
    }
    else if (lowerMessage.includes('banana') && lowerMessage.includes('ripen')) {
      botResponse = '🍌 Banana Storage:\n\n**Unripe (Green)**: Room temp, 2-5 days to ripen\n**Ripe (Yellow)**: 2-3 days room temp, 5-7 days fridge\n**Overripe (Spotted)**: Freeze for smoothies/baking\n\n**Ripening Tips**:\n• Keep at room temperature\n• Paper bag speeds ripening\n• Store with apple to ripen faster\n\n**Slow Ripening**:\n• Refrigerate (skin darkens but fruit stays good)\n• Separate from bunch\n• Wrap stem in plastic\n\n**Freezing**:\n• Peel first\n• Freeze whole or sliced\n• Up to 3 months\n• Perfect for smoothies!';
    }
    else if (lowerMessage.includes('mango') && lowerMessage.includes('refrigerate')) {
      botResponse = '🥭 Mango Storage:\n\n**Unripe Mangoes**: ❌ DON\'T refrigerate\n**Ripe Mangoes**: ✅ Refrigerate\n\n**Ripening Process**:\n• Room temp: 2-7 days\n• Paper bag: Faster ripening\n• Once ripe: Refrigerate\n\n**Ripe Mango Storage**:\n• Fridge: 5-7 days\n• Freezer (chopped): 6 months\n\n**How to Tell if Ripe**:\n• Slight give when squeezed\n• Sweet aroma at stem\n• Skin color changes (variety dependent)\n\n**Cut Mango**:\n• Airtight container\n• Fridge: 2-3 days\n• Add lemon juice to prevent browning';
    }
    else if (lowerMessage.includes('berries') || lowerMessage.includes('strawberr') || lowerMessage.includes('blueberr')) {
      botResponse = '🍓 Berry Storage (Prevent Mold):\n\n**Key Rule**: Don\'t wash until eating!\n\n**Storage Method**:\n1. Sort out any damaged berries\n2. Line container with paper towel\n3. Single layer if possible\n4. Cover loosely\n5. Refrigerate immediately\n\n**Duration**:\n• Strawberries: 1-2 days\n• Blueberries: 5-7 days\n• Raspberries: 1-2 days\n• Blackberries: 1-2 days\n\n**Vinegar Bath** (extends life):\n• Mix 3:1 water:vinegar\n• Soak 5 minutes\n• Rinse, dry completely\n• Adds 2-3 days\n\n**Freezing**:\n• Wash & dry completely\n• Flash freeze on tray\n• Store in freezer bags\n• 6-12 months';
    }
    else if (lowerMessage.includes('grapes') && lowerMessage.includes('wash')) {
      botResponse = '🍇 Grape Storage:\n\n**DON\'T wash before storing!**\n\n**Why?**\n• Moisture promotes mold\n• Wash just before eating\n\n**Proper Storage**:\n• Keep in original bag/container\n• Refrigerate immediately\n• Crisper drawer\n• Don\'t remove from stem\n\n**Duration**: 7-14 days in fridge\n\n**Washing Before Eating**:\n• Rinse under cold water\n• Or soak in water briefly\n• Dry with paper towel\n\n**Freezing**:\n• Wash and dry completely\n• Spread on tray\n• Freeze, then bag\n• Great for frozen snacks!';
    }
    else if (lowerMessage.includes('watermelon') && lowerMessage.includes('cut')) {
      botResponse = '🍉 Cut Watermelon Storage:\n\n**Fridge**: 3-5 days\n**Freezer (cubed)**: 10-12 months\n\n**Storage Method**:\n• Airtight container or plastic wrap\n• Keep cut side down\n• Refrigerate within 2 hours\n\n**Quality Tips**:\n• Drain excess juice daily\n• Keep away from strong smells\n• Don\'t store with melon seeds\n\n**Freezing**:\n• Cut into cubes\n• Remove seeds\n• Freeze on tray, then bag\n• Best for smoothies (texture changes)\n\n**Whole Watermelon**:\n• Room temp: 7-10 days\n• Fridge: 2-3 weeks';
    }
    else if (lowerMessage.includes('avocado') && lowerMessage.includes('cut')) {
      botResponse = '🥑 Cut Avocado Storage:\n\n**Prevent Browning**:\n1. Brush cut surface with lemon/lime juice\n2. Wrap tightly in plastic wrap\n3. Press plastic directly on flesh\n4. Refrigerate\n\n**Duration**: 1-2 days (with pit)\n\n**Other Methods**:\n• Store with onion (in container)\n• Submerge in water (24 hours max)\n• Brush with olive oil\n\n**Whole Avocado**:\n• Unripe: Room temp until soft\n• Ripe: Fridge 3-5 days\n\n**Freezing**:\n• Mash with lemon juice\n• Or puree\n• Up to 6 months\n• Texture changes (best for guacamole)';
    }
    else if (lowerMessage.includes('apples and bananas together')) {
      botResponse = '🍎🍌 Storing Apples & Bananas Together:\n\n**DON\'T store together!**\n\n**Why?**\n• Apples release ethylene gas\n• Accelerates banana ripening\n• Bananas ripen too fast\n• Apples stay fine\n\n**Ethylene Producers** (separate these):\n• Apples, pears\n• Bananas, avocados\n• Tomatoes, peaches\n\n**Ethylene Sensitive** (keep away):\n• Leafy greens\n• Broccoli, carrots\n• Cucumbers\n\n**Pro Tip**:\n• Use ethylene effect intentionally\n• Store unripe fruits with apple to ripen faster!';
    }
    // 🥕 VEGETABLE SPECIFIC
    else if (lowerMessage.includes('potato') && (lowerMessage.includes('fridge') || lowerMessage.includes('refrigerate'))) {
      botResponse = '🥔 Potato Storage:\n\n**DON\'T refrigerate raw potatoes!**\n\n**Why?**\n• Cold converts starch to sugar\n• Changes taste (sweeter)\n• Texture becomes gritty\n• Can produce harmful compounds when cooked\n\n**Best Storage**:\n• Cool (7-10°C), dark place\n• Well-ventilated\n• Paper bag or basket\n• Away from onions\n• 2-3 weeks\n\n**Boiled/Cooked Potatoes**:\n✅ Can refrigerate 3-5 days\n\n**Signs of Bad Potatoes**:\n• Green patches (solanine - toxic)\n• Sprouting heavily\n• Soft/wrinkled\n• Foul smell';
    }
    else if (lowerMessage.includes('onion') && lowerMessage.includes('fresh')) {
      botResponse = '🧅 Onion Storage:\n\n**Whole Onions**:\n• Cool, dry, dark place\n• Well-ventilated (mesh bag/basket)\n• Away from potatoes\n• 2-3 months\n\n**Cut Onions**:\n• Airtight container\n• Fridge: 7-10 days\n• Wrap tightly\n\n**Green Onions/Scallions**:\n• Fridge in plastic bag\n• Or stand in water (change daily)\n• 1-2 weeks\n\n**DON\'T**:\n• Store with potatoes (both spoil faster)\n• Refrigerate whole onions (unless very hot climate)\n• Keep in plastic bags (need air flow)\n\n**Freezing**: Chop and freeze 3-6 months';
    }
    else if (lowerMessage.includes('tomato') && lowerMessage.includes('refrigerator')) {
      botResponse = '🍅 Tomato Storage:\n\n**Unripe Tomatoes**: ❌ Don\'t refrigerate\n**Ripe Tomatoes**: Can refrigerate (but affects flavor)\n\n**Best Practice**:\n• Room temp until fully ripe\n• Stem side down\n• Out of direct sunlight\n\n**Ripe Tomatoes**:\n• Room temp: 2-3 days\n• Fridge: 1 week (flavor dulls)\n• Bring to room temp before eating\n\n**Cut Tomatoes**:\n• Must refrigerate\n• Airtight container\n• Use within 1-2 days\n\n**Cherry Tomatoes**:\n• Can refrigerate\n• Last longer than large tomatoes\n\n**Ripening**: Place in paper bag with banana';
    }
    else if (lowerMessage.includes('leafy green') || (lowerMessage.includes('lettuce') || lowerMessage.includes('spinach'))) {
      botResponse = '🥬 Leafy Greens Storage:\n\n**Duration**: 3-7 days depending on type\n\n**Storage Method**:\n1. DON\'T wash before storing\n2. Remove any damaged leaves\n3. Wrap in paper towel\n4. Place in plastic bag/container\n5. Refrigerate in crisper drawer\n\n**Types**:\n• Spinach: 3-5 days\n• Lettuce: 5-7 days\n• Kale: 5-7 days\n• Arugula: 2-3 days\n\n**Washing**:\n• Just before use\n• Cold running water\n• Spin/pat dry\n\n**Signs of Spoilage**:\n• Slimy texture\n• Brown/yellow edges\n• Foul smell\n• Wilted beyond recovery';
    }
    else if (lowerMessage.includes('carrot')) {
      botResponse = '🥕 Carrot Storage:\n\n**Best Method**:\n• Remove green tops immediately\n• Store in plastic bag\n• Crisper drawer\n• 3-4 weeks\n\n**With Tops Attached**: Spoils in 3-5 days\n**Without Tops**: Lasts 3-4 weeks\n\n**Keep Crisp**:\n• Store in water in container (change daily)\n• Or wrap in damp paper towel\n\n**Peeled/Cut Carrots**:\n• Submerge in water\n• Change water every 2 days\n• Use within 1 week\n\n**Freezing**:\n• Blanch 3 minutes first\n• Cool in ice water\n• Dry and freeze\n• Up to 12 months';
    }
    else if (lowerMessage.includes('wash vegetables before')) {
      botResponse = '💦 When to Wash Vegetables:\n\n**WASH**: Just before eating/cooking\n**DON\'T WASH**: Before storing\n\n**Why Wait?**\n• Moisture promotes mold/bacteria\n• Removes protective coating\n• Reduces shelf life\n• Speeds decay\n\n**Exception - Wash Before Storing**:\n• Very dirty root vegetables\n• Then dry COMPLETELY before storing\n\n**Herbs** (Special Case):\n• Wash and dry completely OR\n• Store unwashed in damp towel\n\n**Mushrooms**:\n• NEVER wash before storing\n• Wipe with damp cloth if dirty\n• Wash just before cooking';
    }
    else if (lowerMessage.includes('coriander') || lowerMessage.includes('parsley') || lowerMessage.includes('herbs')) {
      botResponse = '🌿 Fresh Herb Storage:\n\n**Method 1 - Bouquet Style**:\n1. Trim stems\n2. Place in glass with water\n3. Cover loosely with plastic bag\n4. Change water every 2 days\n5. Lasts 1-2 weeks\n\n**Method 2 - Damp Towel**:\n1. Wrap in damp paper towel\n2. Place in plastic bag\n3. Refrigerate\n4. Lasts 5-7 days\n\n**Herbs**:\n• Cilantro/Coriander: Bouquet method\n• Parsley: Bouquet method\n• Mint: Refrigerate in damp towel\n• Curry leaves: Dry, then freeze\n\n**Freezing**:\n• Chop and freeze in oil (ice cube trays)\n• Or freeze whole in bags\n• Up to 6 months';
    }
    else if (lowerMessage.includes('mushroom')) {
      botResponse = '🍄 Mushroom Storage:\n\n**Key Rule**: Keep DRY!\n\n**Storage Method**:\n• Paper bag (not plastic!)\n• Refrigerator\n• Don\'t wash before storing\n• 5-7 days\n\n**Why Paper Bag?**\n• Absorbs excess moisture\n• Allows breathing\n• Prevents sliminess\n\n**Before Cooking**:\n• Wipe with damp cloth OR\n• Quick rinse & pat dry\n• Don\'t soak\n\n**Signs of Spoilage**:\n• Slimy texture\n• Dark spots\n• Shriveled/wrinkled\n• Strong smell\n\n**Freezing**:\n• Sauté first\n• Then freeze\n• Up to 10-12 months';
    }
    else if (lowerMessage.includes('garlic') && (lowerMessage.includes('fridge') || lowerMessage.includes('pantry'))) {
      botResponse = '🧄 Garlic Storage:\n\n**Whole Bulbs**: Pantry (NOT fridge)\n**Peeled Cloves**: Refrigerate\n\n**Pantry Storage**:\n• Cool, dry, dark place\n• Good air circulation\n• Mesh bag or basket\n• 3-6 months\n\n**Refrigerator**:\n❌ Whole bulbs (sprout faster)\n✅ Peeled cloves: 1 week\n✅ Chopped garlic: 2-3 days\n\n**Signs of Bad Garlic**:\n• Sprouting (green shoots - still safe, bitter)\n• Soft/mushy cloves\n• Brown/dark spots\n• Mold\n\n**Freezing**:\n• Whole cloves: 10-12 months\n• Minced in oil: 3 months';
    }
    else if (lowerMessage.includes('ginger') || lowerMessage.includes('turmeric')) {
      botResponse = '🫚 Ginger & Turmeric Storage:\n\n**Fresh Ginger**:\n• Unpeeled: Room temp 1 week, fridge 3 weeks\n• Peeled: Fridge in paper towel, 1 week\n• Freezer: 6 months\n\n**Fresh Turmeric**:\n• Similar to ginger\n• Fridge in paper towel\n• 2-3 weeks\n\n**Best Storage**:\n• Dry, airy place\n• Paper bag in crisper drawer\n• Don\'t wash before storing\n\n**Freezing Ginger**:\n• Freeze whole (grate while frozen!)\n• Or chop, then freeze\n• No thawing needed for cooking\n\n**Signs of Spoilage**:\n• Mold\n• Soft/mushy spots\n• Wrinkled/shriveled\n• Off smell';
    }
    else if (lowerMessage.includes('bell pepper') || lowerMessage.includes('capsicum')) {
      botResponse = '🫑 Bell Pepper Storage:\n\n**Whole Peppers**:\n• Fridge: 1-2 weeks\n• Crisper drawer\n• In plastic bag\n• Don\'t wash before storing\n\n**Cut Peppers**:\n• Remove seeds\n• Airtight container\n• Fridge: 2-3 days\n\n**Room Temp**: 2-3 days only\n\n**Freezing**:\n1. Wash and dry\n2. Remove seeds/stems\n3. Slice or dice\n4. Flash freeze on tray\n5. Transfer to bags\n6. Up to 6 months\n7. Use from frozen for cooking\n\n**Signs of Spoilage**:\n• Soft/mushy spots\n• Wrinkled skin\n• Mold\n• Slimy texture';
    }
    else if (lowerMessage.includes('boiled potato') || lowerMessage.includes('cooked potato')) {
      botResponse = '🥔 Cooked Potato Storage:\n\n**Refrigerator**: ✅ YES, it\'s SAFE!\n\n**Storage**:\n• Fridge: 3-5 days\n• Airtight container\n• Cool completely first\n• Keep skins on (lasts longer)\n\n**Reheating**:\n• Microwave with damp towel\n• Oven at 180°C\n• Pan-fry for crispy\n• Add moisture (butter/oil)\n\n**Mashed Potatoes**:\n• Fridge: 3-5 days\n• Freezer: 10-12 months\n\n**Safety Note**:\n• Don\'t leave at room temp > 2 hours\n• Reheat to 74°C\n\n**Signs of Spoilage**:\n• Mold\n• Sour smell\n• Slimy texture';
    }
    // 🍞 GRAINS & PASTA
    else if (lowerMessage.includes('flour') && (lowerMessage.includes('fridge') || lowerMessage.includes('pantry'))) {
      botResponse = '🌾 Flour Storage:\n\n**All-purpose/Maida**: Pantry ✅\n**Whole wheat/Atta**: Fridge/Freezer ✅\n\n**Pantry Storage**:\n• Airtight container\n• Cool, dry place\n• 6-8 months (white flour)\n• 3 months (whole wheat)\n\n**Refrigerator/Freezer**:\n• Best for whole grain flours\n• Up to 1 year\n• Prevents rancidity\n• Let come to room temp before using\n\n**Signs of Spoilage**:\n• Rancid/musty smell\n• Discoloration\n• Bugs/weevils\n• Clumping (moisture)\n\n**Tip**: Buy smaller quantities for freshness';
    }
    else if (lowerMessage.includes('pasta') && (lowerMessage.includes('leftover') || lowerMessage.includes('cooked'))) {
      botResponse = '🍝 Cooked Pasta Storage:\n\n**Plain Pasta**:\n• Fridge: 3-5 days\n• Toss with oil to prevent sticking\n\n**With Sauce**:\n• Fridge: 3-4 days\n• Airtight container\n\n**Freezing**:\n• Plain pasta: Not recommended (mushy)\n• With sauce: 1-2 months\n\n**Storage Tips**:\n• Cool completely first\n• Refrigerate within 2 hours\n• Add sauce before freezing\n\n**Reheating**:\n• Microwave with splash of water\n• Stovetop with sauce\n• Boiling water dip (plain pasta)\n\n**Safety**:\n• Reheat to steaming hot\n• Only reheat once';
    }
    else if (lowerMessage.includes('chapati') || lowerMessage.includes('roti')) {
      botResponse = '🫓 Chapati/Roti Storage:\n\n**Room Temperature**: 1-2 days\n**Refrigerator**: 1 week\n**Freezer**: 1-2 months\n\n**Room Temp Storage**:\n• Wrap in clean cloth\n• Then in airtight container\n• Cool, dry place\n\n**Refrigerator**:\n• Aluminum foil or cloth\n• Stack with butter/ghee between\n• Prevents drying\n\n**Freezer Method**:\n1. Cool completely\n2. Stack with parchment paper between\n3. Wrap tightly in foil\n4. Freezer bag\n5. Thaw at room temp\n6. Heat on tawa before serving\n\n**Reheating**: Tawa, oven, or microwave with damp towel';
    }
    else if (lowerMessage.includes('noodles') && lowerMessage.includes('fridge')) {
      botResponse = '🍜 Cooked Noodles Storage:\n\n**Plain Noodles**: 3-5 days (fridge)\n**With Sauce**: 3-4 days (fridge)\n\n**Storage Tips**:\n• Toss with small amount of oil\n• Airtight container\n• Refrigerate within 2 hours\n• Keep sauce separate if possible\n\n**Reheating**:\n• Boiling water dip: 30 seconds\n• Microwave: Add water, cover\n• Stir-fry: Quick reheat\n\n**Instant Noodles (cooked)**:\n• Fridge: 2-3 days only\n• Gets soggy quickly\n\n**Freezing**:\n• Not recommended for most noodles\n• Becomes mushy when thawed';
    }
    // COLOR QUESTIONS
    else if (lowerMessage.includes('brown') || lowerMessage.includes('color') || lowerMessage.includes('discolor')) {
      botResponse = '🍎 Brown coloring can mean different things:\n\n• **Fruits like apples/bananas**: Natural oxidation (safe but less fresh)\n• **Meat turning brown**: Oxidation - check smell and texture too\n• **Vegetables browning**: May indicate age or spoilage\n• **Rice/grains turning brown**: Likely mold - discard immediately\n\nTip: Fresh food should have vibrant, natural colors. Dark spots, unusual discoloration, or dullness often indicate spoilage.';
    }
   // STORAGE QUESTIONS
    else if (lowerMessage.includes('storage') || lowerMessage.includes('preserve') || lowerMessage.includes('store')) {
      botResponse = '🏪 Food Storage Best Practices:\n\n• **Refrigerate** perishables within 2 hours (1 hour if temp > 32°C)\n• **Airtight containers** prevent contamination\n• **Cooked food**: 3-4 days in fridge, 2-3 months in freezer\n• **Raw meat**: 1-2 days in fridge, 4-12 months frozen\n• **Vegetables**: Crisper drawer, separate from fruits\n• **Leftovers**: Cool quickly, store in shallow containers\n\nTemp rules: Fridge ≤ 4°C, Freezer ≤ -18°C';
    }
    // FRESHNESS CHECKS
    else if (lowerMessage.includes('safe') || lowerMessage.includes('fresh') || lowerMessage.includes('check')) {
      botResponse = '✅ Signs of Fresh Food:\n\n**Smell**: Fresh, pleasant odor\n**Texture**: Firm, not slimy/mushy\n**Color**: Bright, natural colors\n**No mold**: Check carefully\n\n❌ Discard if:\n• Foul/sour smell\n• Slimy or sticky surface\n• Mold (any color)\n• Fizzing or bubbling\n• Way past expiry date\n\nWhen in doubt, throw it out!';
    }
    // TEMPERATURE
    else if (lowerMessage.includes('temperature') || lowerMessage.includes('cold') || lowerMessage.includes('hot')) {
      botResponse = '🌡️ Temperature Safety Zones:\n\n**Danger Zone**: 4°C - 60°C (bacteria grows rapidly)\n\n**Cold Storage**:\n• Fridge: ≤ 4°C\n• Freezer: ≤ -18°C\n\n**Hot Storage**:\n• Keep above 60°C\n• Reheat to 74°C minimum\n\n**Thawing**: Use fridge (not counter!)';
    }
    // RICE SPECIFIC
    else if (lowerMessage.includes('rice')) {
      botResponse = '🍚 Rice Safety Tips:\n\n• **Cooked rice**: Max 1-2 days in fridge\n• **Cool quickly**: Within 1 hour of cooking\n• **Reheat thoroughly**: Until steaming hot (74°C+)\n• **Never reheat** more than once\n• **Warning**: Rice contains Bacillus cereus spores that survive cooking\n\nSigns of bad rice: Sour smell, hard/dry texture, slimy feel';
    }
    // MEAT & PROTEIN
    else if (lowerMessage.includes('meat') || lowerMessage.includes('chicken') || lowerMessage.includes('fish') || lowerMessage.includes('protein')) {
      botResponse = '🍖 Meat & Protein Safety:\n\n**Raw Meat Storage**:\n• Chicken/Fish: 1-2 days (fridge)\n• Beef/Pork: 3-5 days (fridge)\n• Always on bottom shelf\n\n**Warning Signs**:\n• Gray/greenish color\n• Slimy texture\n• Sour/ammonia smell\n• Sticky surface\n\n**Cooking Temps**:\n• Chicken: 74°C\n• Ground meat: 71°C\n• Fish: 63°C';
    }
    // VEGETABLES & FRUITS
    else if (lowerMessage.includes('vegetable') || lowerMessage.includes('fruit') || lowerMessage.includes('produce')) {
      botResponse = '🥗 Fruits & Vegetables:\n\n**Storage**:\n• Leafy greens: 3-5 days\n• Root vegetables: 1-2 weeks\n• Tomatoes: Room temp until ripe\n• Berries: 1-2 days (very perishable)\n\n**Spoilage Signs**:\n• Wilting/browning\n• Soft spots/mushiness\n• Mold (any amount - discard)\n• Foul smell\n• Excessive moisture\n\n**Tip**: Wash before eating, not before storing!';
    }
    // MILK & DAIRY
    else if (lowerMessage.includes('milk') || lowerMessage.includes('dairy') || lowerMessage.includes('yogurt') || lowerMessage.includes('cheese')) {
      botResponse = '🥛 Dairy Products:\n\n**Milk**:\n• Unopened: Use by date\n• Opened: 5-7 days max\n• Bad if: Sour smell, lumpy, curdled\n\n**Cheese**:\n• Hard cheese: Trim 1cm around mold\n• Soft cheese: Discard if moldy\n\n**Yogurt**:\n• Check date, no separation\n• Mold = throw away\n\n**Always** refrigerate at ≤ 4°C!';
    }
    // BREAD & BAKERY
    else if (lowerMessage.includes('bread') || lowerMessage.includes('bakery') || lowerMessage.includes('mold')) {
      botResponse = '🍞 Bread & Baked Goods:\n\n**Mold Warning**:\n• Visible mold = THROW AWAY\n• Mold spreads invisibly\n• Don\'t just remove moldy part\n\n**Storage**:\n• Room temp: 2-4 days\n• Fridge: 1 week (but texture changes)\n• Freezer: 2-3 months\n\n**Signs of spoilage**:\n• Any mold spots\n• Stale/hard texture\n• Off smell\n• Discoloration';
    }
    // LEFTOVERS
    else if (lowerMessage.includes('leftover') || lowerMessage.includes('reheating') || lowerMessage.includes('reheat')) {
      botResponse = '♻️ Leftover Safety:\n\n**Storage Rules**:\n• Refrigerate within 2 hours\n• Use within 3-4 days\n• Store in shallow containers\n• Label with date\n\n**Reheating**:\n• Heat to 74°C (steaming hot)\n• Stir frequently\n• Only reheat once\n• Use within 2 hours after reheating\n\n**Never reheat**:\n• Rice more than once\n• Food left out > 2 hours';
    }
    // EGGS
    else if (lowerMessage.includes('egg')) {
      botResponse = '🥚 Egg Safety:\n\n**Fresh Test**:\n• Float test: Fresh eggs sink\n• Sniff test: No sulfur smell\n\n**Storage**:\n• In fridge: 3-5 weeks\n• Cooked eggs: 1 week\n• Keep in original carton\n\n**Warning Signs**:\n• Cracked shells\n• Sulfur/rotten smell\n• Runny white (very old)\n• Discolored yolk\n\n**Cook thoroughly**: 71°C minimum';
    }
    // FREEZING
    else if (lowerMessage.includes('freeze') || lowerMessage.includes('frozen') || lowerMessage.includes('defrost') || lowerMessage.includes('thaw')) {
      botResponse = '❄️ Freezing & Thawing:\n\n**Freezer Tips**:\n• Set to -18°C or below\n• Use freezer bags/containers\n• Remove air to prevent freezer burn\n• Label with date\n\n**Safe Thawing**:\n1. **In fridge** (safest, slowest)\n2. **Cold water** (sealed bag, change water every 30 min)\n3. **Microwave** (cook immediately after)\n\n**Never**:\n• Thaw on counter\n• Refreeze thawed raw meat\n\n**Frozen Food Life**: 2-12 months depending on type';
    }
    // EXPIRY DATES
    else if (lowerMessage.includes('expiry') || lowerMessage.includes('best before') || lowerMessage.includes('use by') || lowerMessage.includes('date')) {
      botResponse = '📅 Understanding Food Dates:\n\n**Use By**: Safety date - DON\'T eat after\n**Best Before**: Quality date - safe but less fresh\n**Sell By**: For stores, not consumers\n\n**General Rules**:\n• **Meat/Fish**: Follow use-by strictly\n• **Canned goods**: 1-2 years past date (if undamaged)\n• **Dry goods**: Often safe past date\n• **Dairy**: Smell/taste test if close to date\n\n**Always check** for spoilage signs regardless of date!';
    }
    // FOOD POISONING
    else if (lowerMessage.includes('sick') || lowerMessage.includes('poison') || lowerMessage.includes('illness') || lowerMessage.includes('stomach')) {
      botResponse = '⚠️ Food Poisoning Signs:\n\n**Symptoms**:\n• Nausea, vomiting\n• Diarrhea\n• Stomach cramps\n• Fever\n\n**When to See Doctor**:\n• Severe symptoms\n• Lasts > 3 days\n• Blood in stool\n• Dehydration\n• High fever (>38.5°C)\n\n**Prevention**:\n• Wash hands thoroughly\n• Cook food properly\n• Avoid cross-contamination\n• Refrigerate promptly\n\n**High-risk groups**: Pregnant, elderly, young children, immunocompromised';
    }
    // CROSS-CONTAMINATION
    else if (lowerMessage.includes('cross') || lowerMessage.includes('contamination') || lowerMessage.includes('bacteria')) {
      botResponse = '🦠 Prevent Cross-Contamination:\n\n**Separate**:\n• Raw meat from other foods\n• Use different cutting boards\n• Don\'t reuse plates for cooked food\n\n**Clean**:\n• Wash hands: 20+ seconds\n• Sanitize surfaces\n• Clean utensils between tasks\n\n**Cook**:\n• Use food thermometer\n• No pink in poultry\n• Hot throughout\n\n**Chill**:\n• Refrigerate within 2 hours\n• Don\'t overfill fridge\n• Keep at ≤ 4°C';
    }
    // PIZZA & FAST FOOD
    else if (lowerMessage.includes('pizza') || lowerMessage.includes('burger') || lowerMessage.includes('fast food')) {
      botResponse = '🍕 Leftover Fast Food:\n\n**Pizza**:\n• Fridge: 3-4 days max\n• Reheat to 74°C\n• Don\'t leave out overnight\n\n**Burgers**:\n• Store in fridge within 2 hours\n• Use within 1-2 days\n• Remove lettuce/tomato first\n\n**French Fries**:\n• Best eaten fresh\n• Fridge: 3-5 days\n• Won\'t be as crispy\n\n**Rule**: If left out > 2 hours at room temp, discard!';
    }
    // CANNED FOOD
    else if (lowerMessage.includes('can') || lowerMessage.includes('canned') || lowerMessage.includes('tin')) {
      botResponse = '🥫 Canned Food Safety:\n\n**Before Opening**:\n• Check for dents/rust\n• No bulging (sign of bacteria)\n• No leaks or cracks\n• Within date if possible\n\n**After Opening**:\n• Transfer to container (don\'t store in can)\n• Refrigerate immediately\n• Use within 3-4 days\n\n**Warning Signs**:\n• Bulging/swollen can\n• Hissing when opened\n• Foul smell\n• Spurting liquid\n\n**These indicate botulism** - very dangerous!';
    }
    // SAUCES & CONDIMENTS
    else if (lowerMessage.includes('sauce') || lowerMessage.includes('ketchup') || lowerMessage.includes('mayo') || lowerMessage.includes('condiment')) {
      botResponse = '🍯 Sauces & Condiments:\n\n**Opened Storage**:\n• Most: Fridge after opening\n• Ketchup: 6 months (fridge)\n• Mayo: 2 months (fridge)\n• Soy sauce: 2-3 years\n• Hot sauce: 6 months\n\n**Signs of Spoilage**:\n• Mold on surface\n• Separation that won\'t remix\n• Off smell\n• Color change\n• Bubbling/fizzing\n\n**Tip**: Always use clean spoons, never double-dip!';
    }
    // GENERAL HELP
    else if (lowerMessage.includes('help') || lowerMessage.includes('can you') || lowerMessage.includes('how do')) {
      botResponse = '👋 I\'m your Food Safety Assistant!\n\n**Ask me about**:\n• 🎨 Color changes (\"why is my food brown?\")\n• 🏪 Storage tips\n• 🌡️ Temperature safety\n• 🍚 Specific foods (rice, meat, dairy, etc.)\n• ❄️ Freezing & thawing\n• 📅 Expiry dates\n• ♻️ Leftovers\n• 🦠 Food poisoning prevention\n• 🥫 Canned goods\n• And much more!\n\n**Just ask your question!**';
    }
    // DEFAULT RESPONSE
    else {
      botResponse = '🤔 I can help with food safety!\n\n**Popular questions**:\n• \"Why is my food brown?\"\n• \"How long can I store rice?\"\n• \"Is this safe to eat?\"\n• \"What temperature should my fridge be?\"\n• \"How do I store leftovers?\"\n• \"When should I throw food away?\"\n\n**Or ask anything about**:\nStorage, temperatures, spoilage signs, specific foods, reheating, freezing, expiry dates, and more!';
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


// Start server - listen on all interfaces so emulator can connect
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Replate backend server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/health`);
  console.log(`📱 Emulator access: http://10.0.2.2:${PORT}/health`);
});

module.exports = app;
