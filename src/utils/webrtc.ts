// Enhanced WebRTC Media Handler for Production
export const getMediaStream = async (constraints: MediaStreamConstraints = { video: true, audio: true }): Promise<MediaStream> => {
  try {
    // Check if we're in a secure context (HTTPS)
    if (!window.isSecureContext) {
      throw new Error('WebRTC requires HTTPS. Please use a secure connection.');
    }

    // Check if media devices are available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error('Media devices not available in this browser');
    }

    // Enhanced constraints for production
    const enhancedConstraints: MediaStreamConstraints = {
      video: constraints.video ? {
        width: { min: 640, ideal: 1280, max: 1920 },
        height: { min: 480, ideal: 720, max: 1080 },
        frameRate: { ideal: 30, max: 60 }
      } : false,
      audio: constraints.audio ? {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        sampleRate: 44100,
        channelCount: 2
      } : false
    };

    console.log('🎥 Requesting media with constraints:', enhancedConstraints);
    const stream = await navigator.mediaDevices.getUserMedia(enhancedConstraints);
    
    // Log stream details
    console.log('✅ Media stream obtained:');
    stream.getTracks().forEach(track => {
      console.log(`  - ${track.kind} track:`, {
        id: track.id,
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState
      });
    });

    return stream;
  } catch (error) {
    console.error('❌ Media access error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'NotAllowedError') {
        throw new Error('Camera/microphone permission denied. Please allow access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        throw new Error('No camera/microphone found. Please check your device.');
      } else if (error.name === 'NotReadableError') {
        throw new Error('Camera/microphone is already in use by another application.');
      } else if (error.name === 'OverconstrainedError') {
        throw new Error('Camera/microphone constraints not supported by your device.');
      } else {
        throw new Error(`Media access failed: ${error.message}`);
      }
    } else {
      throw new Error('Unknown media access error');
    }
  }
};

// Production-safe media constraints
export const getProductionMediaConstraints = () => {
  return {
    video: {
      width: { min: 640, ideal: 1280, max: 1920 },
      height: { min: 480, ideal: 720, max: 1080 },
      frameRate: { ideal: 30, max: 30 } // Lower frame rate for better performance
    },
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: 44100
    }
  };
};

// Check browser compatibility
export const checkWebRTCSupport = () => {
  const support = {
    hasWebRTC: !!(window.RTCPeerConnection),
    hasMediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    hasGetUserMedia: !!(navigator.mediaDevices?.getUserMedia),
    isSecureContext: window.isSecureContext,
    protocol: window.location.protocol
  };

  console.log('🔍 WebRTC Support Check:', support);
  return support;
};

// Request permissions explicitly
export const requestMediaPermissions = async () => {
  try {
    console.log('🔐 Requesting media permissions...');
    
    // First, check if we need to request permissions
    if (navigator.permissions) {
      try {
        const cameraPermission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        console.log('📹 Camera permission:', cameraPermission.state);
        console.log('🎤 Microphone permission:', microphonePermission.state);
        
        if (cameraPermission.state === 'denied' || microphonePermission.state === 'denied') {
          throw new Error('Permissions denied. Please allow camera and microphone access.');
        }
      } catch (permissionError) {
        console.warn('Permissions API not available, proceeding with getUserMedia');
      }
    }
    
    // Test with minimal constraints first
    const testStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    testStream.getTracks().forEach(track => track.stop());
    
    console.log('✅ Media permissions granted');
    return true;
  } catch (error) {
    console.error('❌ Permission request failed:', error);
    throw error;
  }
};