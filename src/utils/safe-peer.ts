/**
 * Browser-safe simple-peer wrapper for production
 * Uses vite-compatible-simple-peer instead of the Node.js version
 */

import Peer from 'vite-compatible-simple-peer';
import { getPeerOptions, isSecureContext } from './webrtc-config';

export interface SafePeerOptions {
  initiator: boolean;
  stream?: MediaStream;
  trickle?: boolean;
  config?: RTCConfiguration;
}

export class SafePeer {
  private peer: Peer.Instance;
  private isDestroyed = false;

  constructor(options: SafePeerOptions) {
    if (!isSecureContext()) {
      throw new Error('WebRTC requires HTTPS or localhost. Current protocol: ' + window.location.protocol);
    }

    // Use browser-safe peer options
    const peerOptions = {
      ...options,
      trickle: options.trickle !== false, // Default to true
      config: options.config || {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      },
      // Browser-specific options
      wrtc: undefined, // Disable Node.js wrtc
      objectMode: false,
    };

    this.peer = new Peer(peerOptions);
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.peer.on('error', (error: Error) => {
      console.error('SafePeer error:', error);
      // Don't throw, just log and let the app handle it
    });
  }

  // Proxy all Peer methods
  on(event: string, callback: (...args: unknown[]) => void): void {
    if (this.isDestroyed) return;
    this.peer.on(event, callback);
  }

  signal(data: Peer.SignalData): void {
    if (this.isDestroyed) return;
    try {
      this.peer.signal(data);
    } catch (error) {
      console.error('Signal error:', error);
    }
  }

  send(data: string | ArrayBuffer | ArrayBufferView | Blob): void {
    if (this.isDestroyed) return;
    try {
      this.peer.send(data);
    } catch (error) {
      console.error('Send error:', error);
    }
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    
    try {
      this.peer.destroy();
    } catch (error) {
      console.error('Destroy error:', error);
    }
  }

  // Get underlying peer (use with caution)
  getPeer(): Peer.Instance {
    return this.peer;
  }

  // Get destroyed status
  get destroyed(): boolean {
    return this.isDestroyed || (this.peer as { destroyed?: boolean }).destroyed || false;
  }
}

// Factory function for creating safe peers
export const createSafePeer = (options: SafePeerOptions): SafePeer => {
  return new SafePeer(options);
};

// Export type for TypeScript
export type SafePeerInstance = SafePeer;