import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Coins, 
  Save, 
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  BookOpen,
  ExternalLink
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
  
  // Practice Series settings
  const [psSettings, setPsSettings] = useState({
    freeAccessMarks: 80,
    answerKeyDurationDays: 7,
    pricePerSubject: 1999,
    marksheetMaxSizeMB: 10,
    sheetMaxSizeMB: 20
  });
  const [psSaving, setPsSaving] = useState(false);

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
      const [bonusSettings, ps] = await Promise.all([
        adminService.getSignupBonusSettings(),
        adminService.getPracticeSeriesSettings()
      ]);
      setBonusEnabled(bonusSettings.enabled);
      setBonusAmount(bonusSettings.amount);
      setPsSettings(ps);
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePracticeSeriesSettings = async () => {
    try {
      setPsSaving(true);
      const updated = await adminService.updatePracticeSeriesSettings({
        freeAccessMarks: psSettings.freeAccessMarks,
        answerKeyDurationDays: psSettings.answerKeyDurationDays,
        pricePerSubject: psSettings.pricePerSubject,
        marksheetMaxSizeMB: psSettings.marksheetMaxSizeMB,
        sheetMaxSizeMB: psSettings.sheetMaxSizeMB
      });
      setPsSettings(updated);
      toast.success('Practice Series settings saved successfully!');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to save');
    } finally {
      setPsSaving(false);
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
          Manage platform settings, notifications, and Practice Series
        </p>
      </div>

      <Tabs defaultValue="signup-bonus" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="signup-bonus" className="gap-2">
            <Coins className="w-4 h-4" />
            Signup Bonus
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="practice-series" className="gap-2">
            <BookOpen className="w-4 h-4" />
            Practice Series
          </TabsTrigger>
        </TabsList>

        <TabsContent value="signup-bonus" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="practice-series" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <CardTitle>Practice Series Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure free access threshold, answer key duration, price, and file limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="free-access-marks">Free access marks (min %)</Label>
                      <Input
                        id="free-access-marks"
                        type="number"
                        min={0}
                        max={100}
                        value={psSettings.freeAccessMarks}
                        onChange={(e) => setPsSettings((s) => ({ ...s, freeAccessMarks: Math.min(100, Math.max(0, Number(e.target.value) || 0)) }))}
                      />
                      <p className="text-xs text-muted-foreground">Minimum marksheet percentage for free access when admin approves (0–100%)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="answer-key-days">Answer key duration (days)</Label>
                      <Input
                        id="answer-key-days"
                        type="number"
                        min={1}
                        max={365}
                        value={psSettings.answerKeyDurationDays}
                        onChange={(e) => setPsSettings((s) => ({ ...s, answerKeyDurationDays: Math.min(365, Math.max(1, Number(e.target.value) || 1)) }))}
                      />
                      <p className="text-xs text-muted-foreground">Days after sheet upload before answer PDF becomes visible (1–365)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price-per-subject">Price per subject (₹)</Label>
                      <Input
                        id="price-per-subject"
                        type="number"
                        min={0}
                        value={psSettings.pricePerSubject}
                        onChange={(e) => setPsSettings((s) => ({ ...s, pricePerSubject: Math.max(0, Number(e.target.value) || 0) }))}
                      />
                      <p className="text-xs text-muted-foreground">Amount in INR for paid access per subject (payment tab removed but kept for future)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="marksheet-max-mb">Marksheet max size (MB)</Label>
                      <Input
                        id="marksheet-max-mb"
                        type="number"
                        min={1}
                        max={50}
                        value={psSettings.marksheetMaxSizeMB}
                        onChange={(e) => setPsSettings((s) => ({ ...s, marksheetMaxSizeMB: Math.min(50, Math.max(1, Number(e.target.value) || 1)) }))}
                      />
                      <p className="text-xs text-muted-foreground">Max file size for marksheet upload (1–50 MB)</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sheet-max-mb">Practice sheet max size (MB)</Label>
                      <Input
                        id="sheet-max-mb"
                        type="number"
                        min={1}
                        max={50}
                        value={psSettings.sheetMaxSizeMB}
                        onChange={(e) => setPsSettings((s) => ({ ...s, sheetMaxSizeMB: Math.min(50, Math.max(1, Number(e.target.value) || 1)) }))}
                      />
                      <p className="text-xs text-muted-foreground">Max file size for practice sheet PDF (1–50 MB)</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <Button onClick={handleSavePracticeSeriesSettings} disabled={psSaving} className="gap-2">
                      {psSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Settings
                    </Button>
                    <Button asChild variant="outline" className="gap-2">
                      <Link to="/admin/practice-series">
                        <ExternalLink className="w-4 h-4" />
                        Open Practice Series Admin
                      </Link>
                    </Button>
                  </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
