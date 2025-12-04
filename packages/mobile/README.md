# Toyota Inventory Mobile App

This directory is set up for the React Native mobile application.

## Setup Instructions

### Option 1: Using React Native CLI

```bash
# Initialize a new React Native project
npx react-native init ToyotaInventoryMobile --template react-native-template-typescript

# Copy the generated files into this directory
```

### Option 2: Using Expo

```bash
# Initialize with Expo
npx create-expo-app ToyotaInventoryMobile -t typescript

# Copy the generated files into this directory
```

## Features to Implement

- [ ] Vehicle inventory browsing
- [ ] Barcode/VIN scanning
- [ ] Customer management
- [ ] Sales tracking
- [ ] Push notifications
- [ ] Offline support

## Shared Types

The mobile app will use shared types from `@toyota-inventory/common`.

## API Integration

The mobile app will connect to the same backend API as the web application.
