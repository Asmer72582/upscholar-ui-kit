/// <reference types="vite/client" />

declare global {
  interface Window {
    Razorpay: new (options: any) => { open: () => void };
  }
}
