/**
 * Browser-native WebRTC peer implementation
 * Uses native RTCPeerConnection API instead of simple-peer
 */

export interface BrowserPeerOptions {
  initiator: boolean;
  stream?: MediaStream;
  trickle?: boolean;
  config?: RTCConfiguration;
}

export interface BrowserPeerInstance {
  // Core peer connection
  pc: RTCPeerConnection;
  
  // Event handlers
  on(event: string, handler: Function): void;
  off(event: string, handler: Function): void;
  emit(event: string, ...args: any[]): void;
  
  // WebRTC methods
  signal(data: any): void;
  send(data: any): void;
  addStream(stream: MediaStream): void;
  removeStream(stream: MediaStream): void;
  replaceTrack(oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack, stream: MediaStream): void;
  destroy(): void;
  
  // Properties
  destroyed: boolean;
  connected: boolean;
}

class BrowserPeer implements BrowserPeerInstance {
  public pc: RTCPeerConnection;
  public destroyed = false;
  public connected = false;
  
  private events: { [key: string]: Function[] } = {};
  private dataChannel: RTCDataChannel | null = null;
  private makingOffer = false;
  private ignoreOffer = false;
  private polite = true; // For perfect negotiation
  
  constructor(private options: BrowserPeerOptions) {
    if (!this.isSecureContext()) {
      throw new Error('WebRTC requires HTTPS or localhost. Current protocol: ' + window.location.protocol);
    }
    
    if (!window.RTCPeerConnection) {
      throw new Error('WebRTC is not supported in this browser');
    }
    
    this.pc = new RTCPeerConnection(options.config || {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });
    
    this.setupEventHandlers();
    
    if (options.stream) {
      this.addStream(options.stream);
    }
    
    if (options.initiator) {
      this.createDataChannel();
    }
  }
  
  private isSecureContext(): boolean {
    return window.isSecureContext || 
           window.location.protocol === 'https:' || 
           window.location.hostname === 'localhost' ||
           window.location.hostname === '127.0.0.1';
  }
  
  private setupEventHandlers(): void {
    this.pc.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('signal', {
          type: 'candidate',
          candidate: event.candidate
        });
      }
    };
    
    this.pc.onconnectionstatechange = () => {
      this.connected = this.pc.connectionState === 'connected';
      this.emit('connect');
    };
    
    this.pc.ontrack = (event) => {
      this.emit('stream', event.streams[0]);
    };
    
    this.pc.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel();
    };
  }
  
  private createDataChannel(): void {
    this.dataChannel = this.pc.createDataChannel('data', {
      ordered: true
    });
    this.setupDataChannel();
  }
  
  private setupDataChannel(): void {
    if (!this.dataChannel) return;
    
    this.dataChannel.onopen = () => {
      this.emit('connect');
    };
    
    this.dataChannel.onmessage = (event) => {
      this.emit('data', event.data);
    };
    
    this.dataChannel.onerror = (error) => {
      this.emit('error', error);
    };
  }
  
  on(event: string, handler: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }
  
  off(event: string, handler: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(h => h !== handler);
    }
  }
  
  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(handler => handler(...args));
    }
  }
  
  async signal(data: any): Promise<void> {
    try {
      if (data.type === 'offer') {
        if (this.makingOffer || this.pc.signalingState !== 'stable') return;
        
        await this.pc.setRemoteDescription(data);
        const answer = await this.pc.createAnswer();
        await this.pc.setLocalDescription(answer);
        
        this.emit('signal', {
          type: 'answer',
          sdp: this.pc.localDescription
        });
      } else if (data.type === 'answer') {
        await this.pc.setRemoteDescription(data);
      } else if (data.type === 'candidate') {
        await this.pc.addIceCandidate(data.candidate);
      }
    } catch (error) {
      this.emit('error', error);
    }
  }
  
  send(data: any): void {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(data));
    }
  }
  
  addStream(stream: MediaStream): void {
    stream.getTracks().forEach(track => {
      this.pc.addTrack(track, stream);
    });
  }
  
  removeStream(stream: MediaStream): void {
    const senders = this.pc.getSenders();
    senders.forEach(sender => {
      if (sender.track && stream.getTracks().includes(sender.track)) {
        this.pc.removeTrack(sender);
      }
    });
  }
  
  replaceTrack(oldTrack: MediaStreamTrack, newTrack: MediaStreamTrack, stream: MediaStream): void {
    const sender = this.pc.getSenders().find(s => s.track === oldTrack);
    if (sender) {
      sender.replaceTrack(newTrack);
    }
  }
  
  async destroy(): Promise<void> {
    this.destroyed = true;
    this.connected = false;
    
    if (this.dataChannel) {
      this.dataChannel.close();
    }
    
    this.pc.close();
    
    this.emit('close');
  }
}

export function createBrowserPeer(options: BrowserPeerOptions): BrowserPeerInstance {
  return new BrowserPeer(options);
}