const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

// Custom Food Spoilage Detection Model
class FoodSpoilageModel {
  constructor() {
    this.model = null;
    this.isLoaded = false;
  }

  // Create a custom CNN model for food spoilage detection
  createModel() {
    const model = tf.sequential({
      layers: [
        // Input layer - expecting 224x224x3 RGB images
        tf.layers.inputLayer({ inputShape: [224, 224, 3] }),
        
        // First convolutional block
        tf.layers.conv2d({
          filters: 32,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Second convolutional block
        tf.layers.conv2d({
          filters: 64,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Third convolutional block
        tf.layers.conv2d({
          filters: 128,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Fourth convolutional block
        tf.layers.conv2d({
          filters: 256,
          kernelSize: 3,
          activation: 'relu',
          padding: 'same'
        }),
        tf.layers.maxPooling2d({ poolSize: 2 }),
        tf.layers.dropout({ rate: 0.25 }),
        
        // Flatten and dense layers
        tf.layers.flatten(),
        tf.layers.dense({ units: 512, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        tf.layers.dense({ units: 256, activation: 'relu' }),
        tf.layers.dropout({ rate: 0.5 }),
        
        // Output layer - 2 classes: safe (0) and spoiled (1)
        tf.layers.dense({ units: 2, activation: 'softmax' })
      ]
    });

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.001),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    return model;
  }

  // Load pre-trained model or create new one
  async loadModel() {
    try {
      // Try to load existing model - the actual model.json is inside the directory
      const modelPath = path.join(__dirname, 'models', 'food-spoilage-model.json', 'model.json');
      if (fs.existsSync(modelPath)) {
        this.model = await tf.loadLayersModel(`file://${modelPath}`);
        // Compile the loaded model
        this.model.compile({
          optimizer: tf.train.adam(0.001),
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        });
        console.log('✅ Loaded existing food spoilage model');
      } else {
        // Create new model
        this.model = this.createModel();
        console.log('✅ Created new food spoilage model');
      }
      this.isLoaded = true;
    } catch (error) {
      console.error('Error loading model:', error);
      // Fallback to new model
      this.model = this.createModel();
      this.isLoaded = true;
    }
  }

  // Preprocess image for model input
  preprocessImage(imageBuffer) {
    // Convert buffer to tensor
    const imageTensor = tf.node.decodeImage(imageBuffer, 3);
    
    // Resize to 224x224 (standard input size)
    const resized = tf.image.resizeBilinear(imageTensor, [224, 224]);
    
    // Normalize pixel values to 0-1 range
    const normalized = resized.div(255.0);
    
    // Add batch dimension
    const batched = normalized.expandDims(0);
    
    // Clean up intermediate tensors
    imageTensor.dispose();
    resized.dispose();
    normalized.dispose();
    
    return batched;
  }

  // Analyze food image for spoilage
  async analyzeFood(imageBuffer) {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    try {
      // Preprocess image
      const processedImage = this.preprocessImage(imageBuffer);
      
      // Make prediction
      const prediction = this.model.predict(processedImage);
      const predictionArray = await prediction.data();
      
      // Clean up
      processedImage.dispose();
      prediction.dispose();
      
      // Extract results (model outputs: [safe_probability, spoiled_probability])
      const safeProbability = predictionArray[0];
      const spoiledProbability = predictionArray[1];
      
      // Improved accuracy: Use higher confidence threshold and better decision logic
      const probabilityDifference = Math.abs(safeProbability - spoiledProbability);
      const CONFIDENCE_THRESHOLD = 0.20; // Need at least 20% difference for confident prediction
      const SAFE_THRESHOLD = 0.60; // Safe needs to be at least 60% to be considered truly safe
      
      let isSafe, confidence;
      
      if (probabilityDifference < CONFIDENCE_THRESHOLD) {
        // Too close to call - be conservative (mark as not safe when uncertain for food safety)
        isSafe = false; // When uncertain, err on side of caution
        confidence = 0.5; // Low confidence
      } else if (safeProbability >= SAFE_THRESHOLD) {
        // Strong indication of safe food
        isSafe = true;
        confidence = safeProbability;
      } else if (spoiledProbability >= SAFE_THRESHOLD) {
        // Strong indication of spoiled food
        isSafe = false;
        confidence = spoiledProbability;
      } else {
        // Moderate confidence - use standard comparison
        isSafe = safeProbability > spoiledProbability;
        confidence = Math.max(safeProbability, spoiledProbability);
      }
      
      // Simple response: ONLY safe/spoiled + confidence
      return {
        status: isSafe ? 'safe' : 'spoiled',
        confidence: confidence
      };
      
    } catch (error) {
      console.error('Error analyzing food:', error);
      return {
        status: 'safe',
        confidence: 0.5
      };
    }
  }

  // Generate detailed analysis based on prediction
  generateDetailedAnalysis(isSafe, confidence, imageBuffer) {
    // Generate analysis directly from model predictions
    let message, indicators, recommendations, foodType;
    
    if (isSafe) {
      // Safe food - different messages based on confidence
      if (confidence > 0.9) {
        message = 'Food appears fresh and safe for consumption. No visible signs of spoilage detected.';
        indicators = [];
        foodType = 'Fresh produce';
        recommendations = [
          'Store in appropriate conditions',
          'Consume within recommended timeframe',
          'Follow proper food safety practices'
        ];
      } else if (confidence > 0.75) {
        message = 'Food appears mostly fresh and safe. Model is reasonably confident in this assessment.';
        indicators = ['possible minor discoloration'];
        foodType = 'Produce';
        recommendations = [
          'Visual inspection recommended',
          'Check for any unusual odors',
          'Consume within a few days'
        ];
      } else {
        message = 'Food appears safe but model confidence is moderate. Use additional senses to verify.';
        indicators = ['uncertain classification'];
        foodType = 'Food item';
        recommendations = [
          'Verify with smell and visual inspection',
          'Use your judgment',
          'When in doubt, throw it out'
        ];
      }
    } else {
      // Spoiled food - different messages based on confidence
      if (confidence > 0.9) {
        message = 'Clear signs of spoilage detected. Do not consume this food.';
        indicators = ['visible spoilage signs', 'potential mold or decay'];
        foodType = 'Spoiled food';
        recommendations = [
          'Do not consume',
          'Dispose of immediately',
          'Clean storage area',
          'Check other nearby foods'
        ];
      } else if (confidence > 0.75) {
        message = 'Signs of spoilage detected. Not recommended for consumption.';
        indicators = ['discoloration', 'potential spoilage'];
        foodType = 'Questionable food';
        recommendations = [
          'Do not consume',
          'Dispose safely',
          'When in doubt, throw it out'
        ];
      } else {
        message = 'Possible spoilage detected but model confidence is moderate. Exercise caution.';
        indicators = ['uncertain spoilage signs'];
        foodType = 'Food item';
        recommendations = [
          'Inspect carefully',
          'Check for odor and texture changes',
          'Better safe than sorry - consider discarding'
        ];
      }
    }
    
    return {
      status: isSafe ? 'safe' : 'spoiled',
      confidence: confidence,
      message: message,
      indicators: indicators,
      foodType: foodType,
      recommendations: recommendations
    };
  }

  // Train the model with your data
  async trainModel(trainingData) {
    if (!this.isLoaded) {
      await this.loadModel();
    }

    console.log('🚀 Starting model training...');
    
    // Prepare training data
    const { images, labels } = this.prepareTrainingData(trainingData);
    
    // Train the model
    const history = await this.model.fit(images, labels, {
      epochs: 10,
      batchSize: 32,
      validationSplit: 0.2,
      callbacks: {
        onEpochEnd: (epoch, logs) => {
          console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
        }
      }
    });
    
    // Save the trained model
    await this.saveModel();
    
    console.log('✅ Model training completed!');
    return history;
  }

  // Prepare training data from your dataset with batch processing
  prepareTrainingData(trainingData) {
    console.log(`🔄 Processing ${trainingData.length} images...`);
    
    // Process images one by one to avoid memory issues
    const imageTensors = [];
    const labels = [];
    
    for (let i = 0; i < trainingData.length; i++) {
      const item = trainingData[i];
      
      // Process image
      const processedImage = this.preprocessImage(item.imageBuffer);
      imageTensors.push(processedImage);
      
      // Create label (one-hot encoding)
      const label = item.isSpoiled ? [0, 1] : [1, 0]; // [safe, spoiled]
      labels.push(label);
      
      if ((i + 1) % 100 === 0) {
        console.log(`📦 Processed ${i + 1}/${trainingData.length} images`);
        // Force garbage collection periodically
        if (global.gc) {
          global.gc();
        }
      }
    }
    
    console.log(`✅ Processed all ${trainingData.length} images`);
    
    // Concatenate tensors to avoid extra dimension from stack()
    const imagesTensor = tf.concat(imageTensors, 0);
    const labelsTensor = tf.tensor2d(labels);
    
    // Clean up individual tensors
    imageTensors.forEach(tensor => tensor.dispose());
    
    return {
      images: imagesTensor,
      labels: labelsTensor
    };
  }

  // Save trained model
  async saveModel() {
    const modelDir = path.join(__dirname, 'models');
    if (!fs.existsSync(modelDir)) {
      fs.mkdirSync(modelDir, { recursive: true });
    }
    
    const modelPath = path.join(modelDir, 'food-spoilage-model.json');
    await this.model.save(`file://${modelPath}`);
    console.log('💾 Model saved successfully!');
  }

  // Get model summary
  getModelSummary() {
    if (this.model) {
      this.model.summary();
    }
  }
}

module.exports = FoodSpoilageModel;
