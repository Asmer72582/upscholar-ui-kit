import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Plus,
  BookOpen,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { lectureService, CreateLectureData } from '@/services/lectureService';

const categories = [
  // Basic 10th Class Subjects
  'Mathematics',
  'Science',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Hindi',
  'Social Studies',
  'History',
  'Geography',
  'Civics',
  'Economics',
  
  // Additional Subjects
  'Computer Science',
  'Programming',
  'Web Development',
  'Mobile Development',
  'Data Science',
  'Machine Learning',
  'Artificial Intelligence',
  'Accountancy',
  'Business Studies',
  'Commerce',
  'Arts & Crafts',
  'Music',
  'Physical Education',
  'Sanskrit',
  'Other Languages',
  'Competitive Exams',
  'Test Preparation',
  'Other',
];

export const ScheduleLecture: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    duration: '',
    maxStudents: '50',
    price: '',
    scheduledDate: '',
    scheduledTime: '',
    tags: '',
    meetingLink: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.duration || parseInt(formData.duration) <= 0) newErrors.duration = 'Valid duration is required';
    if (!formData.maxStudents || parseInt(formData.maxStudents) <= 0) newErrors.maxStudents = 'Max students is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Date is required';
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Time is required';

    // Validate scheduled time is in the future
    if (formData.scheduledDate && formData.scheduledTime) {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      if (scheduledDateTime <= new Date()) {
        newErrors.scheduledDate = 'Please schedule for a future date and time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateFormForDraft = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent, isDraft: boolean = false) => {
    e.preventDefault();
    
    // For drafts, only validate basic fields
    if (isDraft) {
      if (!validateFormForDraft()) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in title, description, and category.',
          variant: 'destructive',
        });
        return;
      }
    } else {
      // For publishing, validate all fields
      if (!validateForm()) {
        toast({
          title: 'Validation Error',
          description: 'Please fill in all required fields correctly.',
          variant: 'destructive',
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare lecture data
      let scheduledAt: Date;
      
      if (isDraft) {
        // For drafts, use current date/time
        scheduledAt = new Date();
      } else {
        // For publishing, use the scheduled date/time
        scheduledAt = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      }
      
      // Build lecture data with conditional fields
      // For drafts, use minimum valid values; for published, use actual values
      const lectureData: any = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        price: formData.price ? parseFloat(formData.price) : (isDraft ? 1 : 0),
        duration: formData.duration ? parseInt(formData.duration) : (isDraft ? 30 : 0),
        maxStudents: formData.maxStudents ? parseInt(formData.maxStudents) : 50,
        scheduledAt: scheduledAt.toISOString(),
        isPublished: !isDraft,
      };

      // Add optional fields if they have values
      if (formData.meetingLink) {
        lectureData.meetingLink = formData.meetingLink;
      }

      await lectureService.createLecture(lectureData);

      if (isDraft) {
        toast({
          title: 'Draft Saved Successfully!',
          description: `"${formData.title}" has been saved as a draft.`,
        });
      } else {
        toast({
          title: 'Lecture Scheduled Successfully!',
          description: `"${formData.title}" has been scheduled for ${formData.scheduledDate} at ${formData.scheduledTime}.`,
        });
      }
      
      navigate('/trainer/manage-lectures');
    } catch (error: any) {
      console.error('Error saving lecture:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save lecture. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/trainer/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold mb-2">Create New Lecture</h1>
          <p className="text-muted-foreground">
            Create a new lecture and save as draft or publish it for your students
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Essential details about your lecture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="title">Lecture Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Introduction to React Hooks"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={errors.title ? 'border-destructive' : ''}
                />
                {errors.title && <p className="text-sm text-destructive mt-1">{errors.title}</p>}
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
              </div>

              <div>
                <Label htmlFor="meetingLink">Meeting Link (Optional)</Label>
                <Input
                  id="meetingLink"
                  placeholder="https://zoom.us/j/..."
                  value={formData.meetingLink}
                  onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what students will learn in this lecture..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className={`min-h-[100px] ${errors.description ? 'border-destructive' : ''}`}
                />
                {errors.description && <p className="text-sm text-destructive mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  placeholder="React, JavaScript, Hooks"
                  value={formData.tags}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Pricing */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-primary" />
              Schedule & Pricing
            </CardTitle>
            <CardDescription>
              Set the date, time, and pricing for your lecture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="90"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className={errors.duration ? 'border-destructive' : ''}
                />
                {errors.duration && <p className="text-sm text-destructive mt-1">{errors.duration}</p>}
              </div>

              <div>
                <Label htmlFor="maxStudents">Max Students *</Label>
                <Input
                  id="maxStudents"
                  type="number"
                  placeholder="25"
                  value={formData.maxStudents}
                  onChange={(e) => handleInputChange('maxStudents', e.target.value)}
                  className={errors.maxStudents ? 'border-destructive' : ''}
                />
                {errors.maxStudents && <p className="text-sm text-destructive mt-1">{errors.maxStudents}</p>}
              </div>

              <div>
                <Label htmlFor="price">Price (Upcoins) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="50"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  className={errors.price ? 'border-destructive' : ''}
                />
                {errors.price && <p className="text-sm text-destructive mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="scheduledDate">Date *</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                  className={errors.scheduledDate ? 'border-destructive' : ''}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.scheduledDate && <p className="text-sm text-destructive mt-1">{errors.scheduledDate}</p>}
              </div>

              <div>
                <Label htmlFor="scheduledTime">Time *</Label>
                <Input
                  id="scheduledTime"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => handleInputChange('scheduledTime', e.target.value)}
                  className={errors.scheduledTime ? 'border-destructive' : ''}
                />
                {errors.scheduledTime && <p className="text-sm text-destructive mt-1">{errors.scheduledTime}</p>}
              </div>
            </div>
          </CardContent>
        </Card>



        {/* Preview */}
        {formData.title && (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                How your lecture will appear to students
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{formData.title}</h3>
                    <p className="text-sm text-muted-foreground">by You</p>
                  </div>
                  {formData.price && (
                    <Badge className="bg-accent text-accent-foreground">
                      {formData.price} UC
                    </Badge>
                  )}
                </div>
                
                {formData.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {formData.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {formData.duration && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {formData.duration} min
                    </div>
                  )}
                  {formData.maxStudents && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      Max {formData.maxStudents}
                    </div>
                  )}
                  {formData.scheduledDate && formData.scheduledTime && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => navigate('/trainer/dashboard')}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={(e) => handleSubmit(e as any, true)}
              disabled={loading}
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <BookOpen className="w-4 h-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              onClick={(e) => handleSubmit(e as any, false)}
            >
              {loading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              List Lecture
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};