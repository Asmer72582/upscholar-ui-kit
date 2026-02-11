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
  Sparkles,
  Gift,
  TrendingUp,
  Clock,
  ArrowRight,
  ChevronRight,
  BadgePercent,
  Crown,
  Flame
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { paymentService, UpCoinPackage } from '@/services/paymentService';
import { useAuth } from '@/contexts/AuthContext';

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export const BuyUpCoins: React.FC = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const { toast } = useToast();
  const [packages, setPackages] = useState<UpCoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  // Refresh user data when component mounts to get latest balance
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Refresh user to get latest balance
        if (refreshUser) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    };

    if (user) {
      initializeData();
    }
  }, [user, refreshUser]);

  // Additional effect to ensure balance is updated after any changes
  useEffect(() => {
    const refreshBalance = async () => {
      if (user && refreshUser) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Error refreshing balance:', error);
        }
      }
    };

    // Refresh balance when the page becomes visible again (e.g., after payment)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshBalance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also refresh every 30 seconds while on the page
    const interval = setInterval(refreshBalance, 30000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(interval);
    };
  }, [user, refreshUser]);

  const fetchPackages = useCallback(async () => {
    try {
      const loadPackages = async () => {
        try {
          const data = await paymentService.getPackages();
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
            description: error instanceof Error ? error.message : 'Failed to load UpCoin packages',
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
        description: error instanceof Error ? error.message : 'Failed to load UpCoin packages',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
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

      const orderResponse = await paymentService.createOrder(packageId);
      const { order, key } = orderResponse;

      const options = {
        key: key,
        amount: order.amount,
        currency: order.currency,
        name: 'Upscholar',
        description: `Purchase ${order.upcoins} UpCoins`,
        image: 'https://api.dicebear.com/7.x/shapes/svg?seed=Upscholar',
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
          color: '#7C3AED',
          backdrop_color: '#000000'
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          try {
            const verifyResponse = await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order.orderId,
            });

            toast({
              title: '🎉 Success!',
              description: verifyResponse.message,
            });

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

  const getPackageIcon = (index: number) => {
    const icons = [Coins, Gift, Flame, Crown, Sparkles];
    return icons[index] || Coins;
  };

  const getPackageGradient = (index: number, popular: boolean) => {
    if (popular) return 'from-violet-500 via-purple-500 to-fuchsia-500';
    const gradients = [
      'from-amber-400 to-orange-500',
      'from-emerald-400 to-teal-500',
      'from-violet-500 to-purple-600',
      'from-rose-400 to-pink-500',
      'from-blue-500 to-indigo-600'
    ];
    return gradients[index] || gradients[0];
  };

  const getCardBorder = (popular: boolean, index: number) => {
    if (popular) return 'border-2 border-purple-500 shadow-purple-200';
    if (index === packages.length - 1) return 'border-2 border-amber-400 shadow-amber-100';
    return 'border border-gray-200';
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[500px]">
            <div className="text-center">
              <div className="relative">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center animate-pulse">
                  <Coins className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-violet-500 to-purple-600 animate-ping opacity-20" />
              </div>
              <p className="text-lg text-gray-600 font-medium">Loading amazing deals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-purple-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Special Bonus Offers</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Get <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">UpCoins</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Purchase UpCoins to enroll in premium lectures. Bigger packs = More bonus coins!
          </p>
        </div>

        {/* Current Balance Card */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white border-0 shadow-2xl shadow-purple-200">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
            <CardContent className="pt-8 pb-8 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-200 font-medium">Your Balance</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black">{user?.walletBalance ?? 0}</p>
                      <span className="text-purple-200 font-medium">UpCoins</span>
                    </div>
                    {user && (
                      <p className="text-xs text-purple-300 mt-1">
                        Last updated: {new Date().toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="hidden sm:flex flex-col items-end">
                  <div className="flex items-center gap-1 text-purple-200 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>Ready to spend</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Limited Time Banner */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center animate-bounce">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-amber-900">Bonus Coins on Every Purchase!</p>
                <p className="text-sm text-amber-700">Bigger packs = More free coins. Save up to 30%!</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Limited Time Offer</span>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
            {packages.map((pkg, index) => {
              const IconComponent = getPackageIcon(index);
              const isLastPackage = index === packages.length - 1;
              
              return (
                <Card
                  key={pkg.id}
                  className={`relative transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${getCardBorder(pkg.popular, index)} ${
                    pkg.popular ? 'ring-4 ring-purple-100' : ''
                  } ${isLastPackage ? 'ring-4 ring-amber-100' : ''}`}
                >
                  {/* Badge */}
                  {pkg.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className={`px-4 py-1.5 text-white font-bold shadow-lg ${
                        pkg.popular 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600' 
                          : isLastPackage 
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                      }`}>
                        {pkg.popular && <Star className="w-3 h-3 mr-1" />}
                        {isLastPackage && <Crown className="w-3 h-3 mr-1" />}
                        {!pkg.popular && !isLastPackage && <BadgePercent className="w-3 h-3 mr-1" />}
                        {pkg.badge}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-2 pt-8">
                    <div className={`mx-auto w-20 h-20 bg-gradient-to-br ${getPackageGradient(index, pkg.popular)} rounded-2xl flex items-center justify-center mb-4 shadow-lg transform transition-transform hover:rotate-6`}>
                      <IconComponent className="w-10 h-10 text-white" />
                    </div>
                    <CardDescription className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {pkg.description}
                    </CardDescription>
                    <CardTitle className="text-3xl font-black text-gray-900">
                      {pkg.totalCoins}
                      <span className="text-lg font-normal text-gray-500 ml-1">coins</span>
                    </CardTitle>
                    {pkg.bonusCoins > 0 && (
                      <div className="flex items-center justify-center gap-1 text-emerald-600 font-semibold text-sm mt-1">
                        <Gift className="w-4 h-4" />
                        <span>{pkg.upcoins} + {pkg.bonusCoins} bonus</span>
                      </div>
                    )}
                  </CardHeader>

                  <CardContent className="text-center pt-0">
                    <div className="mb-4">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-4xl font-black text-gray-900">₹{pkg.price}</span>
                      </div>
                      {pkg.bonusCoins > 0 && (
                        <p className="text-sm text-emerald-600 font-medium mt-1">
                          Save ₹{pkg.savings} worth of coins!
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        ≈ ₹{(pkg.price / pkg.totalCoins).toFixed(2)} per coin
                      </p>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2 mb-6 text-left">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{pkg.totalCoins} UpCoins credited</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Instant credit to wallet</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>Never expires</span>
                      </div>
                    </div>

                    <Button
                      className={`w-full font-bold text-base py-6 transition-all ${
                        pkg.popular 
                          ? 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 shadow-lg shadow-purple-200'
                          : isLastPackage
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-200'
                            : ''
                      }`}
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={processingPayment}
                      variant={pkg.popular || isLastPackage ? 'default' : 'outline'}
                    >
                      {processingPayment && selectedPackage === pkg.id ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Buy Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Why Buy UpCoins?</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">100% Secure</h3>
                  <p className="text-gray-600">
                    All payments are encrypted and secured by Razorpay. Your money is safe.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100 hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Instant Credit</h3>
                  <p className="text-gray-600">
                    UpCoins are credited to your wallet immediately after successful payment.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100 hover:shadow-lg transition-shadow">
              <CardContent className="pt-8 pb-8">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Never Expires</h3>
                  <p className="text-gray-600">
                    Your UpCoins never expire. Use them whenever you want to learn something new.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">What are UpCoins?</h4>
                    <p className="text-gray-600 text-sm">
                      UpCoins are the virtual currency used on Upscholar to enroll in lectures. 1 UpCoin = ₹1 value.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">How do bonus coins work?</h4>
                    <p className="text-gray-600 text-sm">
                      When you buy larger packages, you get extra bonus coins for free! For example, the ₹500 pack gives you 75 extra coins.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">What payment methods are accepted?</h4>
                    <p className="text-gray-600 text-sm">
                      We accept all major payment methods including UPI, Credit/Debit Cards, Net Banking, and Wallets through Razorpay.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChevronRight className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Can I get a refund?</h4>
                    <p className="text-gray-600 text-sm">
                      UpCoins once purchased are non-refundable but they never expire, so you can use them anytime.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Support Note */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Need help? Contact our support team at support@upscholar.in</p>
        </div>
      </div>
    </div>
  );
};
