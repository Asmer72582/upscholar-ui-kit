import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import {
  Calendar,
  Clock,
  Users,
  Plus,
  BookOpen,
  ArrowLeft,
  Save,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { lectureService, Lecture } from "@/services/lectureService";

const categories = [
  // Basic 10th Class Subjects
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "Hindi",
  "Social Studies",
  "History",
  "Geography",
  "Civics",
  "Economics",
  
  // Additional Subjects
  "Computer Science",
  "Programming",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Accountancy",
  "Business Studies",
  "Commerce",
  "Arts & Crafts",
  "Music",
  "Physical Education",
  "Sanskrit",
  "Other Languages",
  "Competitive Exams",
  "Test Preparation",
  "Other",
];

export const EditLecture: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lecture, setLecture] = useState<Lecture | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    price: "",
    duration: "",
    scheduledAt: "",
    maxStudents: "",
    meetingLink: "",
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    if (id) {
      loadLecture();
    }
  }, [id]);

  const loadLecture = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const lectureData = await lectureService.getLectureById(id);
      setLecture(lectureData);
      
      // Populate form with existing data
      const scheduledDate = new Date(lectureData.scheduledAt);
      const formattedDate = scheduledDate.toISOString().slice(0, 16); // Format for datetime-local input
      
      setFormData({
        title: lectureData.title,
        description: lectureData.description,
        category: lectureData.category,
        tags: lectureData.tags,
        price: lectureData.price.toString(),
        duration: lectureData.duration.toString(),
        scheduledAt: formattedDate,
        maxStudents: lectureData.maxStudents.toString(),
        meetingLink: lectureData.meetingLink || "",
      });
    } catch (error: any) {
      console.error("Error loading lecture:", error);
      toast({
        title: "Error",
        description: "Failed to load lecture details.",
        variant: "destructive",
      });
      navigate("/trainer/manage-lectures");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a lecture title.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a lecture description.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.category) {
      toast({
        title: "Validation Error",
        description: "Please select a category.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.scheduledAt) {
      toast({
        title: "Validation Error",
        description: "Please select a date and time.",
        variant: "destructive",
      });
      return;
    }

    const scheduledDate = new Date(formData.scheduledAt);
    if (scheduledDate <= new Date()) {
      toast({
        title: "Validation Error",
        description: "Please select a future date and time.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        tags: formData.tags,
        price: parseFloat(formData.price) || 0,
        duration: parseInt(formData.duration) || 60,
        scheduledAt: scheduledDate.toISOString(),
        maxStudents: parseInt(formData.maxStudents) || 50,
        meetingLink: formData.meetingLink.trim(),
      };

      await lectureService.updateLecture(id, updateData);

      toast({
        title: "Success!",
        description: "Lecture updated successfully.",
      });

      navigate("/trainer/manage-lectures");
    } catch (error: any) {
      console.error("Error updating lecture:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update lecture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Lecture not found</h3>
            <p className="text-muted-foreground mb-4">
              The lecture you're trying to edit doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate("/trainer/manage-lectures")}>
              Back to Manage Lectures
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/trainer/manage-lectures")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Manage Lectures
        </Button>
        <h1 className="text-3xl font-bold">Edit Lecture</h1>
        <p className="text-muted-foreground">
          Update your lecture details and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Update the core details of your lecture
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Lecture Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter an engaging title for your lecture"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe what students will learn in this lecture"
                    className="mt-1 min-h-[100px]"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => handleInputChange("category", value)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Tags</Label>
                  <div className="mt-1 space-y-2">
                    <div className="flex gap-2">
                      <Input
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Add a tag"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addTag();
                          }
                        }}
                      />
                      <Button type="button" onClick={addTag} size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => removeTag(tag)}
                          >
                            {tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schedule & Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Schedule & Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="scheduledAt">Date & Time *</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) =>
                      handleInputChange("scheduledAt", e.target.value)
                    }
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", e.target.value)}
                    placeholder="60"
                    min="15"
                    max="480"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxStudents">Max Students *</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={formData.maxStudents}
                    onChange={(e) =>
                      handleInputChange("maxStudents", e.target.value)
                    }
                    placeholder="50"
                    min="1"
                    max="1000"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="price">Price (Upcoins) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="meetingLink">Meeting Link</Label>
                  <Input
                    id="meetingLink"
                    value={formData.meetingLink}
                    onChange={(e) =>
                      handleInputChange("meetingLink", e.target.value)
                    }
                    placeholder="https://zoom.us/j/..."
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={lecture.status === 'scheduled' ? 'default' : 'secondary'}>
                      {lecture.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Enrolled:</span>
                    <span className="text-sm font-medium">
                      {lecture.enrolledCount}/{lecture.maxStudents}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Rating:</span>
                    <span className="text-sm font-medium">
                      {lecture.averageRating.toFixed(1)} ⭐
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Update Lecture
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/trainer/manage-lectures")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};