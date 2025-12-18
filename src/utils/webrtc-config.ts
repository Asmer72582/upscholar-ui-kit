/**
 * Production-ready WebRTC configuration
 * Uses browser-safe simple-peer-light for production builds
 */

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  iceTransportPolicy?: 'all' | 'relay';
  bundlePolicy?: 'balanced' | 'max-bundle' | 'max-compat';
  rtcpMuxPolicy?: 'require' | 'negotiate';
}

// Production STUN/TURN servers
export const PRODUCTION_ICE_SERVERS: RTCIceServer[] = [
  // Google STUN servers (free, reliable)
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
  
  // Additional reliable STUN servers
  { urls: 'stun:stun.services.mozilla.com' },
  { urls: 'stun:stun.voip.blackberry.com:3478' },
  
  // TURN servers (for strict NAT/firewall traversal)
  // Note: Replace with your own TURN server credentials for production
  // {
  //   urls: 'turn:your-turn-server.com:3478',
  //   username: 'your-username',
  //   credential: 'your-password'
  // }
];

// Development STUN servers (minimal set)
export const DEVELOPMENT_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' }
];

export const getWebRTCConfig = (isProduction: boolean): WebRTCConfig => ({
  iceServers: isProduction ? PRODUCTION_ICE_SERVERS : DEVELOPMENT_ICE_SERVERS,
  iceTransportPolicy: 'all',
  bundlePolicy: 'balanced',
  rtcpMuxPolicy: 'require'
});

// Browser-safe peer options for production
export const getPeerOptions = (isProduction: boolean, initiator: boolean, stream?: MediaStream) => ({
  initiator,
  trickle: true,
  stream,
  config: getWebRTCConfig(isProduction),
  // Browser-safe options
  objectMode: false,
  allowHalfTrickle: true,
  // Disable Node.js-specific features
  wrtc: null, // Explicitly disable Node.js wrtc
});

// Check if we're in a secure context (required for WebRTC)
export const isSecureContext = (): boolean => {
  return window.isSecureContext || 
         window.location.protocol === 'https:' || 
         window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

// Validate WebRTC support
export const checkWebRTCSupport = (): { supported: boolean; error?: string } => {
  if (!window.RTCPeerConnection) {
    return { supported: false, error: 'RTCPeerConnection not supported' };
  }
  
  if (!window.RTCSessionDescription) {
    return { supported: false, error: 'RTCSessionDescription not supported' };
  }
  
  if (!window.RTCIceCandidate) {
    return { supported: false, error: 'RTCIceCandidate not supported' };
  }
  
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return { supported: false, error: 'getUserMedia not supported' };
  }
  
  if (!isSecureContext()) {
    return { supported: false, error: 'WebRTC requires HTTPS or localhost' };
  }
  
  return { supported: true };
};