#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const TrainingDataManager = require('./ai/TrainingDataManager');

// AI Training Script for Replate
class AITrainer {
  constructor() {
    this.trainingManager = new TrainingDataManager();
  }

  // Train with your dataset
  async trainWithDataset(datasetPath) {
    console.log('🤖 Starting AI Model Training for Food Spoilage Detection');
    console.log('================================================');
    
    try {
      // Load training data from your dataset
      console.log('📊 Loading training data...');
      const sampleCount = await this.trainingManager.loadTrainingDataFromFiles(datasetPath);
      
      if (sampleCount === 0) {
        console.log('❌ No training data found. Please check your dataset structure.');
        console.log('Expected structure:');
        console.log('  dataset/');
        console.log('    ├── safe/');
        console.log('    │   ├── fresh_food_1.jpg');
        console.log('    │   ├── fresh_food_2.jpg');
        console.log('    │   └── ...');
        console.log('    └── spoiled/');
        console.log('        ├── moldy_food_1.jpg');
        console.log('        ├── spoiled_food_2.jpg');
        console.log('        └── ...');
        return false;
      }
      
      // Show training statistics
      const stats = this.trainingManager.getTrainingStats();
      console.log('📈 Training Statistics:');
      console.log(`   Total Samples: ${stats.totalSamples}`);
      console.log(`   Safe Samples: ${stats.safeSamples}`);
      console.log(`   Spoiled Samples: ${stats.spoiledSamples}`);
      console.log(`   Balance: ${(stats.balance * 100).toFixed(1)}% difference`);
      
      if (stats.totalSamples < 10) {
        console.log('⚠️  Warning: Need at least 10 samples for good training');
        console.log('   Current samples:', stats.totalSamples);
        return false;
      }
      
      // Train the model
      console.log('🚀 Starting model training...');
      const success = await this.trainingManager.trainModel();
      
      if (success) {
        console.log('✅ Model training completed successfully!');
        console.log('💾 Model saved to: ./backend/models/food-spoilage-model.json');
        console.log('🎯 Your AI model is ready to detect food spoilage!');
        return true;
      } else {
        console.log('❌ Model training failed');
        return false;
      }
      
    } catch (error) {
      console.error('❌ Training error:', error);
      return false;
    }
  }

  // Test the trained model
  async testModel(testImagePath) {
    try {
      console.log('🧪 Testing trained model...');
      
      const imageBuffer = fs.readFileSync(testImagePath);
      const analysis = await this.trainingManager.analyzeFood(imageBuffer);
      
      console.log('📊 Test Results:');
      console.log(`   Status: ${analysis.status}`);
      console.log(`   Confidence: ${(analysis.confidence * 100).toFixed(1)}%`);
      console.log(`   Message: ${analysis.message}`);
      
      if (analysis.indicators && analysis.indicators.length > 0) {
        console.log(`   Indicators: ${analysis.indicators.join(', ')}`);
      }
      
      if (analysis.recommendations && analysis.recommendations.length > 0) {
        console.log(`   Recommendations: ${analysis.recommendations.join(', ')}`);
      }
      
      return analysis;
      
    } catch (error) {
      console.error('❌ Test error:', error);
      return null;
    }
  }

  // Show help
  showHelp() {
    console.log('🤖 Replate AI Training Script');
    console.log('============================');
    console.log('');
    console.log('Usage:');
    console.log('  node train-ai.js <dataset-path>');
    console.log('');
    console.log('Example:');
    console.log('  node train-ai.js ./my-food-dataset');
    console.log('');
    console.log('Dataset Structure:');
    console.log('  dataset/');
    console.log('    ├── safe/          # Fresh food images');
    console.log('    │   ├── apple.jpg');
    console.log('    │   ├── bread.jpg');
    console.log('    │   └── ...');
    console.log('    └── spoiled/       # Spoiled food images');
    console.log('        ├── moldy_bread.jpg');
    console.log('        ├── rotten_apple.jpg');
    console.log('        └── ...');
    console.log('');
    console.log('Supported formats: JPG, JPEG, PNG');
    console.log('Minimum samples: 10 (5 safe + 5 spoiled recommended)');
  }
}

// Main execution
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    const trainer = new AITrainer();
    trainer.showHelp();
    return;
  }
  
  const datasetPath = args[0];
  
  if (!fs.existsSync(datasetPath)) {
    console.log('❌ Dataset path does not exist:', datasetPath);
    return;
  }
  
  const trainer = new AITrainer();
  const success = await trainer.trainWithDataset(datasetPath);
  
  if (success) {
    console.log('');
    console.log('🎉 Training completed! Your AI model is ready.');
    console.log('📱 You can now use the Replate app to detect food spoilage.');
    console.log('');
    console.log('Next steps:');
    console.log('1. Start the backend: cd backend && npm run dev');
    console.log('2. Start the frontend: npm start');
    console.log('3. Test with food images on your phone!');
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = AITrainer;
