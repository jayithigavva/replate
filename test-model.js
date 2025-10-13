#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const fetch = require('node-fetch');

// Test the AI model with a local image
async function testModel(imagePath) {
  try {
    console.log('🧪 Testing AI Model...');
    console.log('📸 Image:', imagePath);
    
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Error: Image file not found:', imagePath);
      process.exit(1);
    }

    const formData = new FormData();
    formData.append('image', fs.createReadStream(imagePath));
    formData.append('userId', 'test-user-123');

    console.log('🚀 Sending to AI model...\n');

    const response = await fetch('http://localhost:3000/scan-food', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.success) {
      console.log('═══════════════════════════════════════');
      console.log('         AI ANALYSIS RESULT');
      console.log('═══════════════════════════════════════');
      console.log('');
      console.log(`Status:      ${data.status === 'safe' ? '✅ SAFE TO EAT' : '⚠️  NOT SAFE - SPOILED'}`);
      console.log(`Food Type:   🍎 ${data.foodType || 'Unknown'}`);
      console.log(`Confidence:  🎯 ${data.confidence || 'N/A'}`);
      console.log(`Issues:      📊 ${data.detectedIssues || 'None detected'}`);
      console.log('');
      console.log('═══════════════════════════════════════');
      console.log('');
      
      if (data.recommendations) {
        console.log('💡 Recommendations:');
        console.log(data.recommendations);
        console.log('');
      }
    } else {
      console.error('❌ Error:', data.error || 'Failed to analyze food');
    }

  } catch (error) {
    console.error('❌ Error testing model:', error.message);
  }
}

// Get image path from command line
const imagePath = process.argv[2];

if (!imagePath) {
  console.log('');
  console.log('🎯 AI Model Tester - Test your food spoilage model!');
  console.log('');
  console.log('Usage:');
  console.log('  node test-model.js <path-to-image>');
  console.log('');
  console.log('Example:');
  console.log('  node test-model.js dataset/Test/freshapples/a_f001.png');
  console.log('  node test-model.js dataset/Test/rottenapples/a_r001.png');
  console.log('');
  console.log('Available test images:');
  console.log('  ✅ Fresh: dataset/Test/freshapples/, freshbanana/, freshtomato/');
  console.log('  ⚠️  Rotten: dataset/Test/rottenapples/, rottenbanana/, rottentomato/');
  console.log('');
  process.exit(1);
}

testModel(imagePath);



