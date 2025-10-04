import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  FileText,
  Brain,
  Target,
  Lightbulb
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const LessonPlanGenerator = () => {
  const [lessonPlans, setLessonPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [expandedPlan, setExpandedPlan] = useState(null);
  
  const [formData, setFormData] = useState({
    subject: '',
    grade_level: '',
    topic: ''
  });

  const subjects = [
    'Math',
    'Reading', 
    'Science',
    'History',
    'English'
  ];

  const gradeLevels = [
    '1st Grade',
    '2nd Grade', 
    '3rd Grade',
    '4th Grade',
    '5th Grade',
    '6th Grade',
    '7th Grade',
    '8th Grade'
  ];

  useEffect(() => {
    fetchLessonPlans();
  }, []);

  const fetchLessonPlans = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/lesson-plans`);
      setLessonPlans(response.data);
    } catch (error) {
      console.error('Error fetching lesson plans:', error);
      toast.error('Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.grade_level || !formData.topic.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setGenerating(true);
    
    try {
      const response = await axios.post(`${API_BASE}/lesson-plans/generate`, formData);
      setLessonPlans([response.data, ...lessonPlans]);
      setExpandedPlan(response.data.id);
      toast.success('Lesson plan generated successfully!');
      
      // Reset form
      setFormData({ subject: '', grade_level: '', topic: '' });
    } catch (error) {
      console.error('Error generating lesson plan:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate lesson plan');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6" data-testid="lesson-plan-generator">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">AI Lesson Plan Generator</h1>
        <p className="text-slate-400">Create comprehensive, structured lesson plans with AI assistance</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-1">
          <Card className="glass-effect border-slate-700 slide-up" data-testid="lesson-plan-form">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                Generate Lesson Plan
              </CardTitle>
              <CardDescription className="text-slate-400">
                AI will create a detailed lesson plan for your class
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Subject</Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData({...formData, subject: value})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="subject-select">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {subjects.map(subject => (
                        <SelectItem key={subject} value={subject} className="text-white hover:bg-slate-700">
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Grade Level</Label>
                  <Select 
                    value={formData.grade_level} 
                    onValueChange={(value) => setFormData({...formData, grade_level: value})}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white" data-testid="grade-select">
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {gradeLevels.map(grade => (
                        <SelectItem key={grade} value={grade} className="text-white hover:bg-slate-700">
                          {grade}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Topic/Learning Objective</Label>
                  <Textarea
                    placeholder="E.g., Introduction to fractions, Photosynthesis process, Colonial America..."
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 min-h-20"
                    data-testid="topic-input"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium"
                  disabled={generating}
                  data-testid="generate-lesson-plan-button"
                >
                  {generating ? (
                    <div className="flex items-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Generating lesson plan...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Lesson Plan
                    </div>
                  )}
                </Button>
              </form>
              
              {/* Features */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-white font-medium mb-3">What's Included</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <Target className="w-4 h-4 mr-2 text-blue-400" />
                    Learning objectives
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <FileText className="w-4 h-4 mr-2 text-green-400" />
                    Materials & resources
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                    Step-by-step activities
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <Lightbulb className="w-4 h-4 mr-2 text-purple-400" />
                    Assessment methods
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lesson Plans List */}
        <div className="lg:col-span-2">
          <Card className="glass-effect border-slate-700 slide-up">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-2" />
                  Created Lesson Plans
                </div>
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {lessonPlans.length} Total
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your AI-generated lesson plans ready for classroom use
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="loading-spinner"></div>
                </div>
              ) : lessonPlans.length > 0 ? (
                <div className="space-y-4">
                  {lessonPlans.map((plan) => (
                    <div 
                      key={plan.id}
                      className="border border-slate-600 rounded-lg overflow-hidden bg-slate-800/50"
                      data-testid={`lesson-plan-${plan.id}`}
                    >
                      {/* Plan Header */}
                      <div className="p-4 border-b border-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-white font-medium mb-1">{plan.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-slate-400">
                              <span className="flex items-center">
                                <BookOpen className="w-4 h-4 mr-1" />
                                {plan.subject}
                              </span>
                              <span>{plan.grade_level}</span>
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {new Date(plan.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            data-testid={`expand-plan-${plan.id}`}
                          >
                            {expandedPlan === plan.id ? 'Collapse' : 'View Details'}
                          </Button>
                        </div>
                        
                        <div className="text-slate-300 text-sm">
                          <strong>Topic:</strong> {plan.topic}
                        </div>
                      </div>
                      
                      {/* Plan Content (Expandable) */}
                      {expandedPlan === plan.id && (
                        <div className="p-4 bg-slate-900/50">
                          <div className="prose prose-invert prose-sm max-w-none">
                            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
                              {plan.content}
                            </div>
                          </div>
                          
                          <div className="flex justify-end mt-4 pt-4 border-t border-slate-700">
                            <Button
                              size="sm"
                              onClick={() => {
                                navigator.clipboard.writeText(plan.content);
                                toast.success('Lesson plan copied to clipboard!');
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                              data-testid={`copy-plan-${plan.id}`}
                            >
                              <FileText className="w-4 h-4 mr-1" />
                              Copy to Clipboard
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No lesson plans yet</h3>
                  <p className="text-slate-400">Generate your first AI-powered lesson plan to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LessonPlanGenerator;