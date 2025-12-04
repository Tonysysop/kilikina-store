# Firestore Security Rules Setup

You're seeing the "Missing or insufficient permissions" error because Firestore security rules need to be configured.

## Quick Fix (5 minutes)

### Option 1: Using Firebase Console (Recommended)

1. **Go to Firebase Console**: https://console.firebase.google.com
2. **Select your project**: `Kilikina Accessories` (or your project name)
3. **Navigate to Firestore Database**:
   - Click on "Firestore Database" in the left sidebar
   - Click on the "Rules" tab at the top
4. **Update the rules**:
   - Replace the existing rules with the content from `firestore.rules` file
   - Or copy-paste this:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /inventory/{itemId} {
      allow read, write: if true;
    }
    match /sales/{saleId} {
      allow read, write: if true;
    }
  }
}
```

5. **Click "Publish"** to save the rules

### Option 2: Using Firebase CLI

If you have Firebase CLI installed:

```bash
firebase deploy --only firestore:rules
```

## Verification

After updating the rules:
1. Refresh your app
2. The error should disappear
3. You should be able to add, edit, and delete inventory items

## Security Note

⚠️ **Important**: The current rules allow anyone to read/write to your database. This is fine for development but **NOT for production**.

### For Production:
- Add Firebase Authentication to your app
- Update security rules to require authentication
- Use the production rules commented in `firestore.rules`

## Cloudinary Setup

While you're in setup mode, don't forget to configure Cloudinary:

1. **Sign up**: https://cloudinary.com (free tier available)
2. **Get credentials**:
   - Go to Dashboard
   - Copy your "Cloud Name"
3. **Create upload preset**:
   - Go to Settings > Upload
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set "Signing Mode" to "Unsigned"
   - Copy the preset name
4. **Update `.env.local`**:
   ```
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset_name
   ```

## Troubleshooting

### Still getting permission errors?
- Make sure you clicked "Publish" in Firebase Console
- Wait 30 seconds for rules to propagate
- Clear browser cache and refresh

### Can't find Firestore Database?
- You may need to create a Firestore database first
- Click "Create database" and choose "Start in test mode"
- Select a location close to your users

### Need help?
Check the Firebase documentation: https://firebase.google.com/docs/firestore/security/get-started
