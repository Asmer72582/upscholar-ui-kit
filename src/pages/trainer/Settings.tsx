import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Loader2, 
  Eye, 
  EyeOff,
  Award,
  Video,
  FileText,
  Calendar,
  Users,
  BookOpen,
  CheckCircle,
  Camera,
  Upload
} from 'lucide-react';
import { trainerService } from '@/services/trainerService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

function getCroppedCanvas(image: HTMLImageElement, crop: Crop): Promise<Blob> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('No canvas context'));
  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;
  const unit = crop.unit ?? '%';
  const sx = unit === '%' ? (crop.x / 100) * image.naturalWidth : crop.x * scaleX;
  const sy = unit === '%' ? (crop.y / 100) * image.naturalHeight : crop.y * scaleY;
  const sw = unit === '%' ? (crop.width / 100) * image.naturalWidth : crop.width * scaleX;
  const sh = unit === '%' ? (crop.height / 100) * image.naturalHeight : crop.height * scaleY;
  canvas.width = Math.floor(sw);
  canvas.height = Math.floor(sh);
  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))), 'image/jpeg', 0.92);
  });
}

interface TrainerProfile {
  _id: string;
  name: string;
  firstname: string;
  lastname: string;
  email: string;
  role: string;
  avatar?: string;
  bio?: string;
  experience?: number;
  expertise?: string[];
  grades?: string[];
  boards?: string[];
  whyChooseMe?: string[];
  demoVideoUrl?: string;
  resume?: string;
  spectatorPricePercent?: number;
  status: string;
  isApproved: boolean;
  createdAt: string;
  stats?: {
    totalLectures: number;
    upcomingLectures: number;
    completedLectures: number;
    totalStudents: number;
  };
}

const MAX_AVATAR_MB = 5;
const MAX_AVATAR_BYTES = MAX_AVATAR_MB * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const Settings: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarCropFile, setAvatarCropFile] = useState<File | null>(null);
  const [avatarCropPreview, setAvatarCropPreview] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  const cropImgRef = useRef<HTMLImageElement | null>(null);
  
  // Profile form state
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [bio, setBio] = useState('');
  const [demoVideoUrl, setDemoVideoUrl] = useState('');
  const [expertise, setExpertise] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);
  const [boards, setBoards] = useState<string[]>([]);
  const [whyChooseMe, setWhyChooseMe] = useState<string[]>(['', '', '']);
  const [experience, setExperience] = useState(0);
  const [spectatorPricePercent, setSpectatorPricePercent] = useState(40);
  const [newExpertise, setNewExpertise] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const data = await trainerService.getProfile();
      setProfile(data);
      
      // Populate form fields
      setFirstname(data.firstname || '');
      setLastname(data.lastname || '');
      setBio(data.bio || '');
      setDemoVideoUrl(data.demoVideoUrl || '');
      setExpertise(data.expertise || []);
      setGrades(data.grades || []);
      setBoards(data.boards || []);
      const wcm = data.whyChooseMe || [];
      setWhyChooseMe([wcm[0] || '', wcm[1] || '', wcm[2] || '']);
      setExperience(data.experience || 0);
      setSpectatorPricePercent(data.spectatorPricePercent ?? 40);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdateProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        firstname,
        lastname,
        bio,
        demoVideoUrl,
        expertise,
        grades: Array.isArray(grades) ? grades : [],
        boards: Array.isArray(boards) ? boards : [],
        whyChooseMe: [whyChooseMe[0] || '', whyChooseMe[1] || '', whyChooseMe[2] || ''],
        spectatorPricePercent,
      };
      const result = await trainerService.updateProfile(payload);

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });

      // Apply returned trainer data so grades/boards/whyChooseMe are in sync
      if (result?.trainer) {
        setGrades(Array.isArray(result.trainer.grades) ? result.trainer.grades : []);
        setBoards(Array.isArray(result.trainer.boards) ? result.trainer.boards : []);
        const wcm = result.trainer.whyChooseMe || [];
        setWhyChooseMe([wcm[0] || '', wcm[1] || '', wcm[2] || '']);
      }
      await fetchProfile();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast({ title: 'Invalid file', description: 'Use JPEG, PNG, WebP or GIF only.', variant: 'destructive' });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast({ title: 'File too large', description: `Maximum size is ${MAX_AVATAR_MB}MB.`, variant: 'destructive' });
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarCropFile(file);
    setAvatarCropPreview(url);
    setCrop({ unit: '%', width: 90, height: 90, x: 5, y: 5 });
  };

  const onCropImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  };

  const handleCropUpload = async () => {
    if (!avatarCropPreview || !avatarCropFile || !cropImgRef.current) return;
    setAvatarUploading(true);
    try {
      const blob = await getCroppedCanvas(cropImgRef.current, crop);
      const file = new File([blob], avatarCropFile.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' });
      const result = await trainerService.uploadProfilePhoto(file);
      setProfile((prev) => (prev ? { ...prev, avatar: result.avatar } : null));
      await refreshUser();
      toast({ title: 'Success', description: 'Profile picture updated.' });
      handleCropCancel();
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: err instanceof Error ? err.message : 'Could not upload profile picture',
        variant: 'destructive',
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleCropCancel = () => {
    if (avatarCropPreview) URL.revokeObjectURL(avatarCropPreview);
    setAvatarCropFile(null);
    setAvatarCropPreview(null);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all password fields',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      setChangingPassword(true);
      console.log('Attempting to change password...');
      const result = await trainerService.changePassword(currentPassword, newPassword);
      console.log('Password change result:', result);

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password change error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to change password';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !expertise.includes(newExpertise.trim())) {
      setExpertise([...expertise, newExpertise.trim()]);
      setNewExpertise('');
    }
  };

  const handleRemoveExpertise = (item: string) => {
    setExpertise(expertise.filter(e => e !== item));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Failed to load profile data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and account settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Profile Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-4">
                <Avatar className="w-24 h-24 ring-2 ring-border">
                  <AvatarImage src={profile.avatar} alt={profile.name} className="object-cover" />
                  <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                    {profile.firstname[0]}{profile.lastname[0]}
                  </AvatarFallback>
                </Avatar>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarFileChange}
                />
                <Label
                  htmlFor="avatar-upload"
                  className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90"
                >
                  <Camera className="h-4 w-4" />
                </Label>
              </div>
              <p className="text-xs text-muted-foreground mb-1">JPEG, PNG, WebP or GIF · max 5MB</p>
              <h3 className="text-xl font-semibold">{profile.name}</h3>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-blue-100 text-blue-800">Trainer</Badge>
                {profile.isApproved && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Approved
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {profile.stats && (
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <BookOpen className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <p className="text-2xl font-bold">{profile.stats.totalLectures}</p>
                    <p className="text-xs text-muted-foreground">Total Lectures</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Users className="w-5 h-5 mx-auto mb-1 text-green-600" />
                    <p className="text-2xl font-bold">{profile.stats.totalStudents}</p>
                    <p className="text-xs text-muted-foreground">Students</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <Calendar className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                    <p className="text-2xl font-bold">{profile.stats.upcomingLectures}</p>
                    <p className="text-xs text-muted-foreground">Upcoming</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-5 h-5 mx-auto mb-1 text-purple-600" />
                    <p className="text-2xl font-bold">{profile.stats.completedLectures}</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{profile.email}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Crop & upload profile photo dialog */}
        <Dialog open={!!avatarCropPreview} onOpenChange={(open) => !open && handleCropCancel()}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Crop profile photo</DialogTitle>
              <DialogDescription>
                Adjust the crop area. Only the cropped region will be uploaded (square, max 5MB).
              </DialogDescription>
            </DialogHeader>
            {avatarCropPreview && (
              <div className="flex flex-col gap-4">
                <div className="relative max-h-[70vh] overflow-hidden rounded-lg bg-muted">
                  <ReactCrop
                    crop={crop}
                    onChange={(_crop, percentCrop) => setCrop(percentCrop)}
                    aspect={1}
                    circularCrop
                    className="max-h-[60vh]"
                  >
                    <img
                      ref={cropImgRef}
                      src={avatarCropPreview}
                      alt="Crop"
                      style={{ maxHeight: '60vh', width: 'auto' }}
                      onLoad={onCropImageLoad}
                    />
                  </ReactCrop>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCropCancel} disabled={avatarUploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleCropUpload} disabled={avatarUploading}>
                    {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {avatarUploading ? ' Uploading…' : ' Upload'}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Settings Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                Profile Information
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="w-4 h-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profile</CardTitle>
                  <CardDescription>Update your professional information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Basic Information
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstname">First Name</Label>
                        <Input
                          id="firstname"
                          disabled={true}
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastname">Last Name</Label>
                        <Input
                          id="lastname"
                          disabled={true}
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={profile.email}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Professional Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Professional Information
                    </h4>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground">
                        {bio.length}/500 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Years of Experience</Label>
                      <Input
                        id="experience"
                        type="number"
                        value={experience}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-muted-foreground">
                        Experience cannot be changed. Contact admin if needed.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="demoVideoUrl">Demo Video URL</Label>
                      <div className="flex gap-2">
                        <Video className="w-5 h-5 text-muted-foreground mt-2" />
                        <Input
                          id="demoVideoUrl"
                          disabled={true}
                          value={demoVideoUrl}
                          onChange={(e) => setDemoVideoUrl(e.target.value)}
                          placeholder="https://youtube.com/..."
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Why Choose Me? (3 points)
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        These points are shown to students when they view your profile in Doubt Solutions. Add up to 3 reasons why students should choose you.
                      </p>
                      {[0, 1, 2].map((i) => (
                        <Input
                          key={i}
                          value={whyChooseMe[i] ?? ''}
                          onChange={(e) => setWhyChooseMe((prev) => {
                            const next = [...prev];
                            next[i] = e.target.value;
                            return next;
                          })}
                          placeholder={`Point ${i + 1} (e.g. Best value on platform, Top rated tutor)`}
                          className="mt-1"
                          maxLength={200}
                        />
                      ))}
                      <p className="text-xs text-muted-foreground">Max 200 characters per point</p>
                    </div>

                    <div className="space-y-2">
                      <Label>Spectator price (% of lecture price)</Label>
                      <p className="text-xs text-muted-foreground">
                        Default price for non-enrolled students to watch your live lectures as spectator. Applies to all your lectures. Example: 40% of a 100 UC lecture = 40 UC.
                      </p>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={spectatorPricePercent}
                        onChange={(e) => setSpectatorPricePercent(Math.min(100, Math.max(0, parseInt(e.target.value, 10) || 0)))}
                        className="w-24"
                      />
                      <span className="text-sm text-muted-foreground ml-2">%</span>
                    </div>

                    <div className="space-y-2">
                      <Label>Areas of Expertise (Subjects for Doubt Solutions)</Label>
                      <p className="text-xs text-muted-foreground">
                        Used to match you to student doubt requests. Use the same names students use: Mathematics, Physics, Chemistry, Biology, Science, English, Hindi, Social Studies, Accountancy, Business Studies, Economics, Computer Science, Other.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          value={newExpertise}
                          onChange={(e) => setNewExpertise(e.target.value)}
                          placeholder="e.g. Mathematics, Physics"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddExpertise();
                            }
                          }}
                        />
                        <Button type="button" onClick={handleAddExpertise}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {expertise.map((item, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="cursor-pointer hover:bg-red-50"
                            onClick={() => handleRemoveExpertise(item)}
                          >
                            {item} ×
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <h4 className="font-semibold text-sm text-muted-foreground">Doubt Solutions filters (optional)</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Grades you teach</Label>
                        <p className="text-xs text-muted-foreground">Leave empty to see all grades. Otherwise only matching requests appear.</p>
                        <div className="flex flex-wrap gap-2">
                          {['8', '9', '10', '11', '12'].map((g) => (
                            <Badge
                              key={g}
                              variant={grades.includes(g) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => setGrades((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g])}
                            >
                              {g}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Boards you teach</Label>
                        <p className="text-xs text-muted-foreground">Leave empty to see all boards.</p>
                        <div className="flex flex-wrap gap-2">
                          {['CBSE', 'ICSE', 'SSC', 'State Board', 'Other'].map((b) => (
                            <Badge
                              key={b}
                              variant={boards.includes(b) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => setBoards((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b])}
                            >
                              {b}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    {profile.resume && (
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Resume/CV
                        </Label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            {profile.resume.split('/').pop()}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Resume cannot be changed. Contact admin if needed.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={handleUpdateProfile} disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>Update your account password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button onClick={handleChangePassword} disabled={changingPassword}>
                      {changingPassword ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
