# Replate Frontend

A React Native mobile application for food waste reduction, connecting restaurants with NGOs to donate surplus food.

## 🚀 Features

### Authentication
- **Login/Signup**: Secure authentication with Supabase
- **Role-based Access**: Separate interfaces for restaurants and NGOs
- **Session Management**: Persistent login sessions

### Restaurant Dashboard
- **Food Scanning**: AI-powered food spoilage detection using camera/gallery
- **Safety Analysis**: Detailed analysis with confidence scores and indicators
- **Pickup Management**: Mark food as ready for NGO pickup
- **AI Chatbot**: Food safety assistant for questions and guidance
- **Impact Tracking**: View your contribution to reducing food waste

### NGO Dashboard
- **Pickup Management**: View and manage available food pickups
- **Interactive Map**: Visual representation of pickup locations
- **Route Optimization**: Grouped pickups for efficient collection
- **Status Updates**: Mark pickups as collected or cancelled
- **Impact Metrics**: Track meals provided to communities

### Additional Features
- **Profile Management**: User settings, preferences, and account information
- **Notifications**: Real-time updates for pickups and confirmations
- **Dark Theme**: Modern dark UI with orange accent colors
- **Error Handling**: Comprehensive error boundaries and loading states
- **Responsive Design**: Optimized for mobile devices

## 📱 Screens

1. **LoginScreen**: Authentication with role selection
2. **RestaurantDashboard**: Food scanning and management
3. **NGODashboard**: Pickup coordination and management
4. **ProfileScreen**: User settings and account management
5. **NotificationsScreen**: Real-time notifications and updates

## 🛠️ Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **React Navigation**: Navigation library with stack and tab navigators
- **Supabase**: Backend-as-a-Service for authentication and database
- **React Native Elements**: UI component library
- **Expo Camera**: Camera and image picker functionality
- **React Native Maps**: Interactive map integration

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on device/simulator**:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.js
│   └── LoadingScreen.js
├── config/             # Configuration files
│   └── api.js
├── context/            # React Context providers
│   └── AuthContext.js
└── screens/            # Screen components
    ├── LoginScreen.js
    ├── RestaurantDashboard.js
    ├── NGODashboard.js
    ├── ProfileScreen.js
    └── NotificationsScreen.js
```

## 🎨 Design System

### Colors
- **Primary**: #FF6600 (Orange)
- **Background**: #000000 (Black)
- **Surface**: #111111 (Dark Gray)
- **Secondary Surface**: #222222 (Medium Gray)
- **Text Primary**: #FFFFFF (White)
- **Text Secondary**: #CCCCCC (Light Gray)
- **Border**: #333333 (Dark Gray)

### Typography
- **Headers**: Bold, 18-24px
- **Body**: Regular, 14-16px
- **Captions**: Regular, 12-14px

## 🔧 Configuration

### API Configuration
The app connects to a backend API for food scanning and pickup management. Update the `API_BASE_URL` in `src/config/api.js` or set the `EXPO_PUBLIC_API_BASE_URL` environment variable.

### Supabase Setup
1. Create a Supabase project
2. Set up the database schema (see `supabase-schema.sql`)
3. Configure authentication settings
4. Update environment variables with your Supabase credentials

## 📱 Testing

### Manual Testing
1. **Authentication Flow**:
   - Test signup with different roles
   - Test login/logout functionality
   - Verify role-based navigation

2. **Restaurant Features**:
   - Test image capture/selection
   - Verify food scanning functionality
   - Test pickup marking
   - Test chatbot interaction

3. **NGO Features**:
   - Test pickup list loading
   - Verify map functionality
   - Test pickup status updates
   - Test route optimization

4. **General Features**:
   - Test navigation between screens
   - Verify notifications
   - Test profile management
   - Test error handling

## 🚀 Deployment

### Building for Production

1. **Configure EAS Build**:
   ```bash
   eas build:configure
   ```

2. **Build for iOS**:
   ```bash
   eas build --platform ios
   ```

3. **Build for Android**:
   ```bash
   eas build --platform android
   ```

### Environment Variables for Production
Update your production environment variables:
- `EXPO_PUBLIC_API_BASE_URL`: Your deployed backend URL
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key

## 🔍 Troubleshooting

### Common Issues

1. **Metro bundler issues**:
   ```bash
   npx expo start --clear
   ```

2. **Dependencies issues**:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS build issues**:
   - Ensure Xcode is up to date
   - Check iOS deployment target

4. **Android build issues**:
   - Ensure Android SDK is properly configured
   - Check Java version compatibility

## 📈 Future Enhancements

- [ ] Push notifications
- [ ] Offline mode support
- [ ] Advanced analytics dashboard
- [ ] Social sharing features
- [ ] Multi-language support
- [ ] Accessibility improvements
- [ ] Performance optimizations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
