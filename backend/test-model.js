#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FoodSpoilageModel = require('./ai/FoodSpoilageModel');

console.log('🧪 Testing Food Spoilage Detection Model');
console.log('=========================================\n');

async function testModel() {
  try {
    // Initialize the model
    console.log('📦 Loading model...');
    const model = new FoodSpoilageModel();
    await model.loadModel();
    
    if (!model.isLoaded) {
      console.error('❌ Failed to load model');
      return;
    }
    
    console.log('✅ Model loaded successfully\n');
    
    // Get model summary
    console.log('📊 Model Architecture:');
    model.getModelSummary();
    console.log('\n');
    
    // Test with sample images if available
    const testImages = [
      { path: '../assets/samples/fresh_apple.png', expected: 'safe' },
      { path: '../assets/samples/fresh_banana.png', expected: 'safe' },
      { path: '../assets/samples/rotten_apple.png', expected: 'spoiled' },
      { path: '../assets/samples/rotten_banana.png', expected: 'spoiled' },
      { path: '../training-data/safe/fresh_apple.jpg', expected: 'safe' },
      { path: '../training-data/spoiled/rotten_apple.jpg', expected: 'spoiled' }
    ];
    
    console.log('🔍 Testing with sample images:\n');
    
    let totalTests = 0;
    let correctPredictions = 0;
    
    for (const testImage of testImages) {
      const fullPath = path.join(__dirname, testImage.path);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`⏭️  Skipping ${testImage.path} (file not found)`);
        continue;
      }
      
      totalTests++;
      
      console.log(`Testing: ${path.basename(testImage.path)}`);
      
      try {
        const imageBuffer = fs.readFileSync(fullPath);
        const result = await model.analyzeFood(imageBuffer);
        
        const isCorrect = result.status === testImage.expected;
        correctPredictions += isCorrect ? 1 : 0;
        
        console.log(`  Expected: ${testImage.expected}`);
        console.log(`  Predicted: ${result.status}`);
        console.log(`  Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log(`  Result: ${isCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`);
        console.log(`  Message: ${result.message}`);
        console.log('');
        
      } catch (error) {
        console.log(`  ❌ Error testing image: ${error.message}\n`);
      }
    }
    
    // Summary
    console.log('=' .repeat(50));
    console.log('📈 Test Summary:');
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Correct Predictions: ${correctPredictions}`);
    console.log(`   Incorrect Predictions: ${totalTests - correctPredictions}`);
    
    if (totalTests > 0) {
      const accuracy = (correctPredictions / totalTests * 100).toFixed(1);
      console.log(`   Accuracy: ${accuracy}%`);
      
      if (accuracy < 50) {
        console.log('\n⚠️  WARNING: Low accuracy! Model may need retraining.');
        console.log('   Run: cd backend && node train-ai.js ../dataset');
      } else if (accuracy < 80) {
        console.log('\n⚠️  Model accuracy is moderate. Consider retraining with more data.');
      } else {
        console.log('\n✅ Model is performing well!');
      }
    } else {
      console.log('\n⚠️  No test images found. Add images to test the model.');
      console.log('   Expected locations:');
      console.log('   - assets/samples/');
      console.log('   - training-data/safe/');
      console.log('   - training-data/spoiled/');
    }
    
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testModel().then(() => {
  console.log('\n✅ Test complete!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});


