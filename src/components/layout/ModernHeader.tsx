import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, Settings, Wallet, Coins, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { walletService, WalletBalance } from "@/services/walletService";

export const ModernHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(
    null
  );
  const [balanceLoading, setBalanceLoading] = useState(false);

  useEffect(() => {
    if (user?.role === "student" || user?.role === "trainer") {
      fetchWalletBalance();
    }
  }, [user]);

  const fetchWalletBalance = async () => {
    try {
      setBalanceLoading(true);
      const balance = await walletService.getBalance();
      setWalletBalance(balance);
    } catch (error) {
      console.error("Error fetching wallet balance:", error);
      // Don't show error toast in header, just fail silently
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const refreshBalance = () => {
    if (user?.role === "student" || user?.role === "trainer") {
      fetchWalletBalance();
    }
  };

  if (!user) return null;

  return (
    <header className="h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/50 sticky top-0 z-50">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

          <div className="relative w-96 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search lectures, courses..."
              className="pl-10 bg-muted/50 border-border/50 focus:bg-background"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {(user.role === "student" || user.role === "trainer") && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
                className="gap-2 bg-gradient-card border-border/50 hover:shadow-soft"
              >
                <Link to={`/${user.role}/wallet`}>
                  <Coins className="w-4 h-4 text-yellow-600" />
                  {balanceLoading ? (
                    <span className="flex items-center gap-1">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      Loading...
                    </span>
                  ) : walletBalance ? (
                    <span>{walletBalance.balance} UC</span>
                  ) : (
                    <span>-- UC</span>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={refreshBalance}
                disabled={balanceLoading}
                className="h-8 w-8 p-0 hover:bg-muted/50"
                title="Refresh balance"
              >
                <RefreshCw
                  className={`w-4 h-4 ${balanceLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="relative hover:bg-muted/50"
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs">
              3
            </Badge>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8 border-2 border-border/50">
                  <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-popover/95 backdrop-blur"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user.firstName
                      ? `${user.firstName} ${user.lastName}`
                      : user.email.split("@")[0]}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                  <Badge
                    variant="secondary"
                    className="w-fit capitalize text-xs"
                  >
                    {user.role}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={`/${user.role}/dashboard`} className="cursor-pointer">
                  Dashboard
                </Link>
              </DropdownMenuItem>
              {(user.role === "student" || user.role === "trainer") && (
                <DropdownMenuItem asChild>
                  <Link to={`/${user.role}/wallet`} className="cursor-pointer">
                    <Wallet className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Wallet</span>
                      {walletBalance && (
                        <span className="text-xs text-muted-foreground">
                          {walletBalance.balance} UC available
                        </span>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link to={`/${user.role}/settings`} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-destructive"
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
