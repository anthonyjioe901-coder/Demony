# Demony Mobile App Deployment Guide

## Prerequisites

### Android (Play Store)
- Android Studio installed
- Java JDK 17+
- Google Play Console account ($25 one-time fee)

### iOS (App Store)
- macOS with Xcode installed
- Apple Developer account ($99/year)
- Valid provisioning profiles and certificates

---

## Initial Setup

### 1. Install Dependencies
```bash
cd packages/mobile
npm install
```

### 2. Build Web Assets
```bash
npm run build
```

### 3. Add Platforms
```bash
# Android
npm run android:add

# iOS (macOS only)
npm run ios:add
```

---

## Android Deployment (Play Store)

### 1. Generate Release Keystore
```bash
npm run android:keystore
```
You'll be prompted to create a password. **SAVE THIS PASSWORD** - you need it for every release.

### 2. Configure Signing
Edit `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file('demony-release-key.keystore')
            storePassword System.getenv('KEYSTORE_PASSWORD')
            keyAlias 'demony'
            keyPassword System.getenv('KEY_PASSWORD')
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

### 3. Set Environment Variables
```bash
# Windows PowerShell
$env:KEYSTORE_PASSWORD = "your_keystore_password"
$env:KEY_PASSWORD = "your_key_password"

# Or create local.properties in android folder
```

### 4. Build Release Bundle
```bash
npm run android:build:release
```
Output: `android/app/build/outputs/bundle/release/app-release.aab`

### 5. Upload to Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill in store listing (title, description, screenshots)
4. Upload the `.aab` file to Production > Releases
5. Submit for review

---

## iOS Deployment (App Store)

### 1. Open in Xcode
```bash
npm run ios:build
npm run ios:open
```

### 2. Configure Signing in Xcode
1. Select the project in navigator
2. Go to "Signing & Capabilities"
3. Select your Team
4. Enable "Automatically manage signing"
5. Set Bundle Identifier: `com.demony.app`

### 3. Create App in App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. My Apps > + > New App
3. Fill in app information

### 4. Archive and Upload
1. In Xcode: Product > Archive
2. When complete, Organizer opens
3. Click "Distribute App"
4. Select "App Store Connect"
5. Upload

### 5. Submit for Review
1. In App Store Connect, go to your app
2. Fill in version information
3. Add screenshots for all device sizes
4. Submit for review

---

## Fastlane Automation (Optional)

### Install Fastlane
```bash
# macOS/Linux
gem install fastlane

# Or with Homebrew
brew install fastlane
```

### Android Fastlane Setup
Create `android/fastlane/Fastfile`:
```ruby
default_platform(:android)

platform :android do
  desc "Deploy to Play Store"
  lane :deploy do
    gradle(
      task: "bundle",
      build_type: "Release"
    )
    upload_to_play_store(
      track: "production",
      aab: "app/build/outputs/bundle/release/app-release.aab"
    )
  end
end
```

### iOS Fastlane Setup
Create `ios/App/fastlane/Fastfile`:
```ruby
default_platform(:ios)

platform :ios do
  desc "Deploy to App Store"
  lane :deploy do
    build_app(
      scheme: "App",
      export_method: "app-store"
    )
    upload_to_app_store(
      skip_screenshots: true,
      skip_metadata: true
    )
  end
end
```

---

## App Store Assets Needed

### Screenshots (Required)
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1242 x 2688)  
- iPhone 5.5" (1242 x 2208)
- iPad Pro 12.9" (2048 x 2732)

### Play Store Screenshots
- Phone: 1080 x 1920 (minimum)
- 7" Tablet: 1200 x 1920
- 10" Tablet: 1800 x 2560

### App Icon
- iOS: 1024 x 1024 (no transparency)
- Android: 512 x 512

### Feature Graphic (Play Store)
- 1024 x 500

---

## Environment Variables for CI/CD

```env
# Android
KEYSTORE_PASSWORD=your_keystore_password
KEY_PASSWORD=your_key_password
GOOGLE_PLAY_JSON_KEY=path/to/play-store-key.json

# iOS
APPLE_ID=your@email.com
APP_STORE_CONNECT_API_KEY_ID=your_key_id
APP_STORE_CONNECT_ISSUER_ID=your_issuer_id
APP_STORE_CONNECT_API_KEY=your_private_key
```

---

## Checklist Before Submission

### Both Platforms
- [ ] App icon set
- [ ] Splash screen configured
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Contact email

### Play Store
- [ ] Content rating questionnaire completed
- [ ] Data safety form filled
- [ ] Target audience selected
- [ ] Store listing complete

### App Store
- [ ] Age rating set
- [ ] App privacy details filled
- [ ] Export compliance answered
- [ ] Screenshots for all sizes
