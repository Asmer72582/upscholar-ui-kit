import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, X, Upload, BookOpen, Users, Clock } from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  lectures: Lecture[];
}

interface Lecture {
  id: string;
  title: string;
  duration: number;
  type: 'live' | 'recorded';
}

export const CreateCourse: React.FC = () => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: '',
    level: '',
    price: '',
    thumbnail: null as File | null
  });

  const [modules, setModules] = useState<Module[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      title: '',
      description: '',
      lectures: []
    };
    setModules([...modules, newModule]);
  };

  const updateModule = (moduleId: string, field: keyof Module, value: any) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, [field]: value } : module
    ));
  };

  const addLecture = (moduleId: string) => {
    const newLecture: Lecture = {
      id: Date.now().toString(),
      title: '',
      duration: 60,
      type: 'live'
    };
    
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, lectures: [...module.lectures, newLecture] }
        : module
    ));
  };

  const updateLecture = (moduleId: string, lectureId: string, field: keyof Lecture, value: any) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? {
            ...module,
            lectures: module.lectures.map(lecture =>
              lecture.id === lectureId ? { ...lecture, [field]: value } : lecture
            )
          }
        : module
    ));
  };

  const removeLecture = (moduleId: string, lectureId: string) => {
    setModules(modules.map(module => 
      module.id === moduleId 
        ? { ...module, lectures: module.lectures.filter(lecture => lecture.id !== lectureId) }
        : module
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Course created:', { courseData, modules, tags });
  };

  const totalLectures = modules.reduce((total, module) => total + module.lectures.length, 0);
  const totalDuration = modules.reduce((total, module) => 
    total + module.lectures.reduce((moduleTotal, lecture) => moduleTotal + lecture.duration, 0), 0
  );

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground">Build a comprehensive learning experience</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="basic" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="basic">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Information</CardTitle>
                    <CardDescription>
                      Provide basic details about your course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">Course Title</Label>
                      <Input 
                        id="title"
                        value={courseData.title}
                        onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter course title"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description"
                        value={courseData.description}
                        onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what students will learn..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select value={courseData.category} onValueChange={(value) => setCourseData(prev => ({ ...prev, category: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="programming">Programming</SelectItem>
                            <SelectItem value="design">Design</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="level">Level</Label>
                        <Select value={courseData.level} onValueChange={(value) => setCourseData(prev => ({ ...prev, level: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="tags">Tags</Label>
                      <div className="flex gap-2 mb-2">
                        <Input 
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          placeholder="Add tags..."
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                        />
                        <Button type="button" onClick={addTag} size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="gap-1">
                            {tag}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => removeTag(tag)}
                            />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="thumbnail">Course Thumbnail</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PNG, JPG up to 5MB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>
                      Organize your content into modules and lectures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {modules.map((module, moduleIndex) => (
                        <div key={module.id} className="border rounded-lg p-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Module Title</Label>
                                <Input 
                                  value={module.title}
                                  onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                                  placeholder={`Module ${moduleIndex + 1} title`}
                                />
                              </div>
                              <div>
                                <Label>Module Description</Label>
                                <Input 
                                  value={module.description}
                                  onChange={(e) => updateModule(module.id, 'description', e.target.value)}
                                  placeholder="Brief description"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Lectures</Label>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => addLecture(module.id)}
                                >
                                  <Plus className="w-4 h-4 mr-1" />
                                  Add Lecture
                                </Button>
                              </div>

                              {module.lectures.map((lecture, lectureIndex) => (
                                <div key={lecture.id} className="grid grid-cols-12 gap-2 items-center bg-secondary/20 p-2 rounded">
                                  <div className="col-span-4">
                                    <Input 
                                      value={lecture.title}
                                      onChange={(e) => updateLecture(module.id, lecture.id, 'title', e.target.value)}
                                      placeholder={`Lecture ${lectureIndex + 1}`}
                                      size="sm"
                                    />
                                  </div>
                                  <div className="col-span-2">
                                    <Input 
                                      type="number"
                                      value={lecture.duration}
                                      onChange={(e) => updateLecture(module.id, lecture.id, 'duration', parseInt(e.target.value) || 0)}
                                      placeholder="Duration"
                                      size="sm"
                                    />
                                  </div>
                                  <div className="col-span-3">
                                    <Select 
                                      value={lecture.type} 
                                      onValueChange={(value) => updateLecture(module.id, lecture.id, 'type', value)}
                                    >
                                      <SelectTrigger className="h-8">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="live">Live</SelectItem>
                                        <SelectItem value="recorded">Recorded</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="col-span-3">
                                    <Button 
                                      type="button" 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => removeLecture(module.id, lecture.id)}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}

                      <Button type="button" variant="outline" onClick={addModule} className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Module
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Settings</CardTitle>
                    <CardDescription>
                      Configure pricing and accessibility
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="price">Price (Upcoins)</Label>
                      <Input 
                        id="price"
                        type="number"
                        value={courseData.price}
                        onChange={(e) => setCourseData(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Preview Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  
                  <div>
                    <h3 className="font-semibold">{courseData.title || 'Course Title'}</h3>
                    <p className="text-sm text-muted-foreground">
                      {courseData.description || 'Course description will appear here...'}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted-foreground">{totalLectures} Lectures</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <Clock className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted-foreground">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-center mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-muted-foreground">{courseData.level || 'Level'}</p>
                    </div>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Button type="submit" className="w-full">
                Create Course
              </Button>
              <Button type="button" variant="outline" className="w-full">
                Save as Draft
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};