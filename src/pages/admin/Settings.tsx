import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Coins, 
  Save, 
  Send,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { adminService } from '@/services/adminService';
import { toast } from 'sonner';

export const AdminSettings: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  
  // Signup bonus settings
  const [bonusEnabled, setBonusEnabled] = useState(true);
  const [bonusAmount, setBonusAmount] = useState(1000);
  
  // Notification settings
  const [notificationSubject, setNotificationSubject] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [targetRole, setTargetRole] = useState<string>('all');
  const [notificationResult, setNotificationResult] = useState<{
    totalUsers: number;
    successful: number;
    failed: number;
  } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settings = await adminService.getSignupBonusSettings();
      setBonusEnabled(settings.enabled);
      setBonusAmount(settings.amount);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBonusSettings = async () => {
    try {
      setSaving(true);
      const updatedSettings = await adminService.updateSignupBonusSettings(bonusEnabled, bonusAmount);
      // Update local state with the returned settings to ensure consistency
      setBonusEnabled(updatedSettings.enabled);
      setBonusAmount(updatedSettings.amount);
      toast.success('Signup bonus settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(error.message || 'Failed to save settings');
      // Reload settings on error to show current state
      loadSettings();
    } finally {
      setSaving(false);
    }
  };

  const handleSendNotification = async () => {
    if (!notificationSubject.trim() || !notificationMessage.trim()) {
      toast.error('Please fill in both subject and message');
      return;
    }

    try {
      setSending(true);
      setNotificationResult(null);
      const result = await adminService.sendNotificationToAll(
        notificationSubject,
        notificationMessage,
        targetRole === 'all' ? undefined : targetRole as 'student' | 'trainer' | 'admin'
      );
      setNotificationResult(result);
      toast.success(`Notification sent to ${result.successful} users successfully!`);
      setNotificationSubject('');
      setNotificationMessage('');
      setTargetRole('all');
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast.error(error.message || 'Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="w-8 h-8" />
          Admin Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage platform settings and send notifications to users
        </p>
      </div>

      <div className="space-y-6">
        {/* Signup Bonus Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-primary" />
              <CardTitle>Signup Bonus Configuration</CardTitle>
            </div>
            <CardDescription>
              Configure the welcome bonus given to new students upon registration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="bonus-enabled">Enable Signup Bonus</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle to enable or disable the signup bonus feature
                </p>
              </div>
              <Switch
                id="bonus-enabled"
                checked={bonusEnabled}
                onCheckedChange={setBonusEnabled}
              />
            </div>

            {bonusEnabled && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="bonus-amount">Bonus Amount (UpCoins)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bonus-amount"
                      type="number"
                      min="0"
                      step="100"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(Number(e.target.value))}
                      className="max-w-xs"
                    />
                    <Badge variant="secondary">UpCoins</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Amount of UpCoins to give to new students when they sign up
                  </p>
                </div>
              </>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSaveBonusSettings} 
                disabled={saving}
                className="min-w-[120px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Send Notification */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <CardTitle>Send Notification to All Users</CardTitle>
            </div>
            <CardDescription>
              Send an email notification to all users or specific user groups
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="target-role">Target Audience</Label>
              <Select value={targetRole} onValueChange={setTargetRole}>
                <SelectTrigger id="target-role" className="max-w-xs">
                  <SelectValue placeholder="Select target audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="student">Students Only</SelectItem>
                  <SelectItem value="trainer">Trainers Only</SelectItem>
                  <SelectItem value="admin">Admins Only</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Choose which user group should receive this notification
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-subject">Subject *</Label>
              <Input
                id="notification-subject"
                placeholder="Enter notification subject"
                value={notificationSubject}
                onChange={(e) => setNotificationSubject(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-message">Message *</Label>
              <Textarea
                id="notification-message"
                placeholder="Enter notification message"
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                rows={8}
                className="resize-none"
              />
              <p className="text-sm text-muted-foreground">
                This message will be sent via email to all selected users
              </p>
            </div>

            {notificationResult && (
              <div className={`p-4 rounded-lg border ${
                notificationResult.failed > 0 
                  ? 'bg-yellow-50 border-yellow-200' 
                  : 'bg-green-50 border-green-200'
              }`}>
                <div className="flex items-start gap-3">
                  {notificationResult.failed > 0 ? (
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className={`font-medium ${
                      notificationResult.failed > 0 ? 'text-yellow-800' : 'text-green-800'
                    }`}>
                      Notification sent!
                    </p>
                    <div className="text-sm space-y-1">
                      <p className={notificationResult.failed > 0 ? 'text-yellow-700' : 'text-green-700'}>
                        Total users: {notificationResult.totalUsers}
                      </p>
                      <p className="text-green-700">
                        Successfully sent: {notificationResult.successful}
                      </p>
                      {notificationResult.failed > 0 && (
                        <p className="text-yellow-700">
                          Failed: {notificationResult.failed}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSendNotification} 
                disabled={sending || !notificationSubject.trim() || !notificationMessage.trim()}
                className="min-w-[140px]"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
