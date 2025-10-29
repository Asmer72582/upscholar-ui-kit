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
  Wallet
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentService, UpCoinPackage } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const BuyUpCoins: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<UpCoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
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
      loadPackages();
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load UpCoin packages',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'Please login to purchase UpCoins',
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

            toast({
              title: 'Success!',
              description: verifyResponse.message,
            });

            // Refresh user data to update wallet balance
            if (refreshUser) {
              await refreshUser();
            }

            setProcessingPayment(false);
            setSelectedPackage(null);
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
            toast({
              title: 'Payment Verification Failed',
              description: errorMessage,
              variant: 'destructive',
            });
            setProcessingPayment(false);
            setSelectedPackage(null);
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPayment(false);
            setSelectedPackage(null);
            toast({
              title: 'Payment Cancelled',
              description: 'You cancelled the payment process',
            });
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      setProcessingPayment(false);
      setSelectedPackage(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading packages...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Buy UpCoins</h1>
            <p className="text-muted-foreground">Purchase UpCoins to enroll in lectures</p>
          </div>
        </div>
      </div>

      {/* Current Balance */}
      <Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-3xl font-bold text-primary">{user?.walletBalance || 0} UpCoins</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {packages.map((pkg) => (
          <Card
            key={pkg.id}
            className={`relative transition-all hover:shadow-lg ${
              pkg.popular ? 'border-primary border-2' : ''
            }`}
          >
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">
                  <Star className="w-3 h-3 mr-1" />
                  Popular
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-3">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">{pkg.upcoins} UpCoins</CardTitle>
              <CardDescription>{pkg.description}</CardDescription>
            </CardHeader>

            <CardContent className="text-center">
              <div className="mb-4">
                <p className="text-3xl font-bold text-primary">₹{pkg.price}</p>
                <p className="text-sm text-muted-foreground">1 UpCoin = ₹{(pkg.price / pkg.upcoins).toFixed(2)}</p>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 mb-4 text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Instant credit</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-green-600" />
                  <span>No expiry</span>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={() => handlePurchase(pkg.id)}
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

      {/* Features Section */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">
                All transactions are encrypted and secured by Razorpay
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Instant Credit</h3>
              <p className="text-sm text-muted-foreground">
                UpCoins are credited to your wallet immediately after payment
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Coins className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">No Expiry</h3>
              <p className="text-sm text-muted-foreground">
                Your UpCoins never expire and can be used anytime
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
