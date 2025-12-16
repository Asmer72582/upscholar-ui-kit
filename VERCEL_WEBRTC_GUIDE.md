# WebRTC Production Deployment Guide for Vercel

## Overview
This guide addresses common WebRTC camera/audio issues in production environments, specifically for Vercel deployments.

## ✅ Current Implementation Status

### HTTPS Validation
- ✅ HTTPS requirement check implemented in `MeetingRoom.tsx:135-139`
- ✅ Proper error messaging for HTTP connections
- ✅ Localhost exception for development

### Media Permissions Handling
- ✅ Graceful fallback from video+audio to audio-only
- ✅ Proper error handling for permission denials
- ✅ User-friendly toast notifications

### WebRTC Configuration
- ✅ Google STUN servers configured
- ✅ Proper peer connection error handling
- ✅ Socket.io connection with timeouts

## 🔧 Vercel-Specific Settings Required

### 1. Environment Variables
Add these to your Vercel project settings:

```bash
# Required for WebRTC
VITE_SOCKET_URL=wss://your-backend-domain.com
# Ensure this uses wss:// (WebSocket Secure) protocol
```

### 2. Vercel Configuration (vercel.json)
Create/update `vercel.json` in your project root:

```json
{
  "rewrites": [
    {
      "source": "/meeting/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; connect-src 'self' wss://your-backend-domain.com https://your-backend-domain.com; media-src 'self' blob:;"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=()"
        }
      ]
    }
  ]
}
```

**Note**: Replace `your-backend-domain.com` with your actual backend URL.

### 3. SSL Certificate Validation
Vercel automatically provides SSL certificates, but verify:

1. **Custom Domain**: Ensure your custom domain has SSL enabled
2. **Force HTTPS**: Enable "Force HTTPS" in Vercel project settings
3. **Certificate Status**: Check domain certificate is valid

## 🐛 Common Issues and Solutions

### Issue 1: Camera Not Showing (Black Screen)
**Symptoms**: Camera permission granted but video shows black screen

**Solutions**:
1. **Check HTTPS**: Ensure URL starts with `https://`
2. **Browser Permissions**: Check site-specific camera permissions
3. **Camera in Use**: Ensure no other app is using the camera
4. **iOS Safari**: Requires user gesture to access camera

### Issue 2: No Audio
**Symptoms**: Microphone permission granted but no audio

**Solutions**:
1. **Check Audio Constraints**: Verify echo cancellation settings
2. **Browser Permissions**: Check microphone permissions
3. **Audio Context**: Some browsers require user interaction

### Issue 3: WebRTC Connection Failed
**Symptoms**: Peer connection fails to establish

**Solutions**:
1. **STUN Servers**: Verify STUN servers are accessible
2. **Firewall**: Check corporate/school firewall settings
3. **TURN Server**: Consider adding TURN server for strict NAT

## 🔍 Debugging Steps

### 1. Browser Console Checks
```javascript
// Check HTTPS
console.log('Protocol:', window.location.protocol);
console.log('HTTPS:', window.location.protocol === 'https:');

// Check Media Devices
navigator.mediaDevices.enumerateDevices().then(devices => {
  console.log('Media Devices:', devices);
});

// Test Media Access
navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then(stream => console.log('Success:', stream))
  .catch(err => console.error('Error:', err));
```

### 2. Use the Diagnostic Page
Open `/webrtc-test.html` in your production environment to test:
- HTTPS connection
- Media device enumeration
- Camera/microphone access
- WebRTC peer connection

### 3. Network Tab Inspection
- Check WebSocket connections (should use `wss://`)
- Verify no mixed content warnings
- Check for blocked requests

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] HTTPS validation implemented
- [ ] Media permissions handling tested
- [ ] STUN servers configured
- [ ] Error handling implemented
- [ ] Diagnostic page created

### Post-Deployment
- [ ] Test on HTTPS domain
- [ ] Verify camera access
- [ ] Verify microphone access
- [ ] Test peer connections
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Test on different browsers

## 📱 Mobile-Specific Considerations

### iOS Safari
- Requires user gesture to access media
- May need specific video constraints
- Check for iOS version compatibility

### Android Chrome
- May have different permission flows
- Check for manufacturer-specific restrictions

## 🛠️ Advanced Configuration

### Adding TURN Server (if needed)
For environments with strict NAT/firewall:

```javascript
const peer = new Peer({
  initiator,
  trickle: true,
  stream,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      // Add TURN server if needed
      {
        urls: 'turn:your-turn-server.com:3478',
        username: 'your-username',
        credential: 'your-password'
      }
    ]
  }
});
```

## 📞 Support
If issues persist after following this guide:

1. Check browser-specific documentation
2. Test with the diagnostic page
3. Review browser console logs
4. Verify network connectivity
5. Check firewall/proxy settings

Remember: WebRTC requires HTTPS in production (except localhost) and proper media permissions for camera/microphone access.