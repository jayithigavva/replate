const tf = require('@tensorflow/tfjs-node');
const FoodSpoilageModel = require('./FoodSpoilageModel');

// AI Training Data Manager
class TrainingDataManager {
  constructor() {
    this.trainingData = [];
    this.model = new FoodSpoilageModel();
  }

  // Add training data from your dataset
  addTrainingData(imageBuffer, isSpoiled, metadata = {}) {
    this.trainingData.push({
      imageBuffer,
      isSpoiled,
      metadata,
      timestamp: Date.now()
    });
    
    console.log(`📊 Added training sample: ${isSpoiled ? 'Spoiled' : 'Safe'} (Total: ${this.trainingData.length})`);
  }

  // Load training data from your files
  async loadTrainingDataFromFiles(dataDirectory) {
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Check if it's the new structure (safe/spoiled) or old structure (fresh*/rotten*)
      const safeDir = path.join(dataDirectory, 'safe');
      const spoiledDir = path.join(dataDirectory, 'spoiled');
      
      if (fs.existsSync(safeDir) && fs.existsSync(spoiledDir)) {
        // New structure: safe/ and spoiled/ folders
        const safeFiles = fs.readdirSync(safeDir);
        for (const file of safeFiles) {
          if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const imagePath = path.join(safeDir, file);
            const imageBuffer = fs.readFileSync(imagePath);
            this.addTrainingData(imageBuffer, false, { source: file });
          }
        }
        
        const spoiledFiles = fs.readdirSync(spoiledDir);
        for (const file of spoiledFiles) {
          if (file.match(/\.(jpg|jpeg|png)$/i)) {
            const imagePath = path.join(spoiledDir, file);
            const imageBuffer = fs.readFileSync(imagePath);
            this.addTrainingData(imageBuffer, true, { source: file });
          }
        }
      } else {
        // Old structure: fresh* and rotten* subfolders
        const trainDir = path.join(dataDirectory, 'Train');
        if (fs.existsSync(trainDir)) {
          const subdirs = fs.readdirSync(trainDir);
          
          for (const subdir of subdirs) {
            const subdirPath = path.join(trainDir, subdir);
            if (fs.statSync(subdirPath).isDirectory()) {
              const isSpoiled = subdir.startsWith('rotten');
              const files = fs.readdirSync(subdirPath);
              
              for (const file of files) {
                if (file.match(/\.(jpg|jpeg|png)$/i)) {
                  const imagePath = path.join(subdirPath, file);
                  const imageBuffer = fs.readFileSync(imagePath);
                  this.addTrainingData(imageBuffer, isSpoiled, { source: `${subdir}/${file}` });
                }
              }
            }
          }
        }
      }
      
      console.log(`✅ Loaded ${this.trainingData.length} training samples`);
      
      // Balance and limit dataset for memory management
      const maxSamples = 1000; // Much smaller for memory efficiency
      const safeSamples = this.trainingData.filter(item => !item.isSpoiled);
      const spoiledSamples = this.trainingData.filter(item => item.isSpoiled);
      
      console.log(`📊 Dataset loaded: ${safeSamples.length} safe, ${spoiledSamples.length} spoiled`);
      
      // Take equal samples from each class
      const samplesPerClass = Math.min(maxSamples / 2, Math.min(safeSamples.length, spoiledSamples.length));
      const balancedSafe = safeSamples.slice(0, samplesPerClass);
      const balancedSpoiled = spoiledSamples.slice(0, samplesPerClass);
      
      this.trainingData = [...balancedSafe, ...balancedSpoiled];
      
      // Shuffle the data
      this.trainingData = this.trainingData.sort(() => Math.random() - 0.5);
      
      console.log(`✅ Balanced dataset: ${this.trainingData.length} samples (${balancedSafe.length} safe, ${balancedSpoiled.length} spoiled)`);
      
      return this.trainingData.length;
      
    } catch (error) {
      console.error('Error loading training data:', error);
      return 0;
    }
  }

  // Train the model with your data
  async trainModel() {
    if (this.trainingData.length < 10) {
      console.log('⚠️ Need at least 10 training samples. Current:', this.trainingData.length);
      return false;
    }
    
    console.log(`🚀 Training model with ${this.trainingData.length} samples...`);
    
    try {
      const history = await this.model.trainModel(this.trainingData);
      console.log('✅ Model training completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Training failed:', error);
      return false;
    }
  }

  // Analyze food using trained model
  async analyzeFood(imageBuffer) {
    return await this.model.analyzeFood(imageBuffer);
  }

  // Get training statistics
  getTrainingStats() {
    const safeCount = this.trainingData.filter(item => !item.isSpoiled).length;
    const spoiledCount = this.trainingData.filter(item => item.isSpoiled).length;
    
    return {
      totalSamples: this.trainingData.length,
      safeSamples: safeCount,
      spoiledSamples: spoiledCount,
      balance: Math.abs(safeCount - spoiledCount) / Math.max(safeCount, spoiledCount)
    };
  }

  // Export training data for backup
  exportTrainingData() {
    return {
      samples: this.trainingData.length,
      stats: this.getTrainingStats(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = TrainingDataManager;
