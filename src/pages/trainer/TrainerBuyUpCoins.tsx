import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Coins,
  Check,
  Loader2,
  Shield,
  Zap,
  Star,
  CreditCard,
  Wallet,
  BookOpen,
  Users
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentService, UpCoinPackage } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const TrainerBuyUpCoins: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<UpCoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
    loadRazorpayScript();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await paymentService.getPackages();
      // Handle both array and object response
      if (Array.isArray(data)) {
        setPackages(data);
      } else if (data.packages && Array.isArray(data.packages)) {
        setPackages(data.packages);
      } else {
        setPackages([]);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load UpCoin packages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBuyPackage = async (packageId: string) => {
    if (!window.Razorpay) {
      toast({
        title: 'Error',
        description: 'Payment system not loaded. Please refresh the page.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setProcessingPayment(true);
      setSelectedPackage(packageId);

      // Create order
      const orderResponse = await paymentService.createOrder(packageId);
      const { order, key } = orderResponse;

      // Razorpay options with all payment methods enabled
      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'UpScholar',
        description: `Purchase ${order.upcoins} UpCoins`,
        image: 'https://api.dicebear.com/7.x/shapes/svg?seed=UpScholar',
        order_id: order.id,
        prefill: {
          name: user?.name || user?.firstName + ' ' + user?.lastName,
          email: user?.email,
          contact: '',
        },
        notes: {
          package: order.packageId,
          upcoins: order.upcoins,
        },
        theme: {
          color: '#4F46E5',
          backdrop_color: '#000000'
        },
        handler: async function (response: any) {
          try {
            // Verify payment
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.orderId,
            });

            if (verifyResponse.success) {
              toast({
                title: 'Success!',
                description: `${order.upcoins} UpCoins have been added to your wallet!`,
              });
              
              // Refresh user data to update wallet balance
              await refreshUser();
            }
          } catch (error: any) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Verification Failed',
              description: error.message || 'Please contact support if amount was deducted.',
              variant: 'destructive',
            });
          } finally {
            setProcessingPayment(false);
            setSelectedPackage(null);
          }
        },
        modal: {
          ondismiss: function() {
            setProcessingPayment(false);
            setSelectedPackage(null);
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment process.',
            });
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      console.error('Error initiating payment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
      setProcessingPayment(false);
      setSelectedPackage(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Coins className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">Buy UpCoins</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Purchase UpCoins to create more lectures and grow your teaching business
        </p>
        {user?.walletBalance !== undefined && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="font-semibold">Current Balance: {user.walletBalance} UpCoins</span>
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                How It Works
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Creating a lecture costs <strong>50 UpCoins</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Earn <strong>90% of lecture price</strong> when students enroll</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>10% platform fee on student enrollments</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Example Earnings
              </h3>
              <div className="space-y-2 text-sm">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-muted-foreground">Create 5 lectures (50 UC each)</p>
                  <p className="font-semibold text-red-600">Cost: -250 UC</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-muted-foreground">20 students enroll (50 UC each)</p>
                  <p className="font-semibold text-green-600">Earn: +900 UC (after 10% fee)</p>
                </div>
                <div className="bg-white p-3 rounded-lg border-2 border-blue-200">
                  <p className="text-muted-foreground">Net Profit</p>
                  <p className="font-bold text-blue-600 text-lg">+650 UC</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-6">Choose Your Package</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative transition-all hover:shadow-lg ${
                pkg.popular ? 'border-primary border-2 scale-105' : ''
              }`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  <Star className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Coins className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">{pkg.upcoins} UpCoins</CardTitle>
                <CardDescription>{pkg.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">₹{pkg.price}</div>
                  <div className="text-sm text-muted-foreground">₹{(pkg.price / pkg.upcoins).toFixed(2)} per UpCoin</div>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Can create {Math.floor(pkg.upcoins / 50)} lectures</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Instant credit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>Secure payment</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleBuyPackage(pkg.id)}
                  disabled={processingPayment}
                  variant={pkg.popular ? 'default' : 'outline'}
                >
                  {processingPayment && selectedPackage === pkg.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Buy Now
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <Shield className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Secure Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All transactions are secured with Razorpay's industry-standard encryption
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Zap className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Instant Credit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              UpCoins are credited to your wallet immediately after successful payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CreditCard className="w-10 h-10 text-primary mb-2" />
            <CardTitle>Multiple Payment Options</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Pay with UPI, Cards, Net Banking, Wallets, and more
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
