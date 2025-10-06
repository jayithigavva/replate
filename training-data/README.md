# 🤖 Replate Custom AI Training Dataset

## 📁 Folder Structure
```
training-data/
├── safe/          # Fresh food images
└── spoiled/       # Spoiled food images
```

## 📸 How to Add Images

### Option 1: Drag & Drop
1. Open Finder
2. Navigate to this folder: `/Users/jayithigavva/replateapp/training-data/`
3. Drag your images to the appropriate folders

### Option 2: Terminal
```bash
# Copy images to safe folder (fresh food)
cp /path/to/fresh_images/* safe/

# Copy images to spoiled folder (spoiled food)
cp /path/to/spoiled_images/* spoiled/
```

## 📋 Requirements
- **Formats**: JPG, JPEG, PNG
- **Minimum**: 5 images in each folder
- **Recommended**: 20+ images in each folder
- **Quality**: Clear, well-lit images

## 🚀 Training Your Model
```bash
cd /Users/jayithigavva/replateapp/backend
node train-ai.js ../training-data
```

## 📊 Expected Results
After training, your model will be saved to:
`backend/models/food-spoilage-model.json`

## 🎯 Testing
Test your trained model with:
```bash
node train-ai.js test-image.jpg
```
