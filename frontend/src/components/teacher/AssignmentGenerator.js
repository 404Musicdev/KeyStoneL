import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { 
  Sparkles, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle,
  BookOpen,
  Brain,
  Zap,
  Target
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AssignmentGenerator = () => {
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [generatedAssignment, setGeneratedAssignment] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  
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
    fetchStudents();
    fetchAssignments();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    }
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/assignments`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
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
      const response = await axios.post(`${API_BASE}/assignments/generate`, formData);
      setGeneratedAssignment(response.data);
      setAssignments([response.data, ...assignments]);
      setShowAssignDialog(true);
      toast.success('Assignment generated successfully!');
    } catch (error) {
      console.error('Error generating assignment:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate assignment');
    } finally {
      setGenerating(false);
    }
  };

  const handleAssignToStudents = async () => {
    if (selectedStudents.length === 0) {
      toast.error('Please select at least one student');
      return;
    }
    
    try {
      await axios.post(`${API_BASE}/assignments/assign`, {
        assignment_id: generatedAssignment.id,
        student_ids: selectedStudents
      });
      
      toast.success(`Assignment assigned to ${selectedStudents.length} student(s)`);
      setShowAssignDialog(false);
      setSelectedStudents([]);
      setGeneratedAssignment(null);
    } catch (error) {
      console.error('Error assigning assignment:', error);
      toast.error('Failed to assign assignment');
    }
  };

  const handleStudentToggle = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-6" data-testid="assignment-generator">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">AI Assignment Generator</h1>
        <p className="text-slate-400">Create personalized assignments powered by artificial intelligence</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generator Form */}
        <div className="lg:col-span-1">
          <Card className="glass-effect border-slate-700 slide-up" data-testid="assignment-form">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-yellow-400" />
                Generate Assignment
              </CardTitle>
              <CardDescription className="text-slate-400">
                AI will create questions based on your specifications
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
                  <Label className="text-slate-300">Topic/Subject Matter</Label>
                  <Textarea
                    placeholder="E.g., Addition with carrying, The American Civil War, Basic sentence structure..."
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="bg-slate-800 border-slate-600 text-white placeholder-slate-400 min-h-20"
                    data-testid="topic-input"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
                  disabled={generating}
                  data-testid="generate-assignment-button"
                >
                  {generating ? (
                    <div className="flex items-center">
                      <div className="loading-spinner w-4 h-4 mr-2"></div>
                      Generating with AI...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Brain className="w-4 h-4 mr-2" />
                      Generate Assignment
                    </div>
                  )}
                </Button>
              </form>
              
              {/* Features */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <h4 className="text-white font-medium mb-3">AI Features</h4>
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-slate-300">
                    <Zap className="w-4 h-4 mr-2 text-yellow-400" />
                    Smart question generation
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <Target className="w-4 h-4 mr-2 text-green-400" />
                    Grade-appropriate difficulty
                  </div>
                  <div className="flex items-center text-sm text-slate-300">
                    <BookOpen className="w-4 h-4 mr-2 text-blue-400" />
                    Reading passages for literacy
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments List */}
        <div className="lg:col-span-2">
          <Card className="glass-effect border-slate-700 slide-up">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Created Assignments
                </div>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {assignments.length} Total
                </Badge>
              </CardTitle>
              <CardDescription className="text-slate-400">
                Your generated assignments and their status
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="loading-spinner"></div>
                </div>
              ) : assignments.length > 0 ? (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div 
                      key={assignment.id}
                      className="p-4 rounded-lg border border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200"
                      data-testid={`assignment-${assignment.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-white font-medium mb-1">{assignment.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center">
                              <BookOpen className="w-4 h-4 mr-1" />
                              {assignment.subject}
                            </span>
                            <span>{assignment.grade_level}</span>
                            <span className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              {new Date(assignment.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        
                        <Badge 
                          variant="outline"
                          className="border-green-500/50 text-green-400 bg-green-500/10"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Ready
                        </Badge>
                      </div>
                      
                      <div className="text-slate-300 text-sm mb-3">
                        <strong>Topic:</strong> {assignment.topic}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                          {assignment.questions.length} questions
                          {assignment.reading_passage && ' • Includes reading passage'}
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => {
                            setGeneratedAssignment(assignment);
                            setShowAssignDialog(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid={`assign-to-students-${assignment.id}`}
                        >
                          <Users className="w-4 h-4 mr-1" />
                          Assign to Students
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No assignments yet</h3>
                  <p className="text-slate-400">Generate your first AI-powered assignment to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign to Students Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl" data-testid="assign-dialog">
          <DialogHeader>
            <DialogTitle className="text-white">Assign to Students</DialogTitle>
            <DialogDescription className="text-slate-400">
              Select which students should receive this assignment
            </DialogDescription>
          </DialogHeader>
          
          {generatedAssignment && (
            <div className="space-y-4">
              {/* Assignment Preview */}
              <div className="p-4 rounded-lg bg-slate-900 border border-slate-700">
                <h3 className="text-white font-medium mb-2">{generatedAssignment.title}</h3>
                <div className="text-sm text-slate-400 space-y-1">
                  <p><strong>Subject:</strong> {generatedAssignment.subject} • {generatedAssignment.grade_level}</p>
                  <p><strong>Topic:</strong> {generatedAssignment.topic}</p>
                  <p><strong>Questions:</strong> {generatedAssignment.questions.length}</p>
                </div>
              </div>
              
              {/* Student Selection */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-300 font-medium">Select Students:</Label>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (selectedStudents.length === students.length) {
                        setSelectedStudents([]);
                      } else {
                        setSelectedStudents(students.map(s => s.id));
                      }
                    }}
                    className="border-slate-600 text-slate-300 hover:bg-slate-700 text-xs"
                  >
                    {selectedStudents.length === students.length ? 'Deselect All' : 'Select All'}
                  </Button>
                </div>
                
                {students.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {students.map((student) => (
                      <div 
                        key={student.id}
                        className="flex items-center space-x-3 p-3 rounded-lg border border-slate-600 hover:bg-slate-700/50"
                      >
                        <Checkbox
                          checked={selectedStudents.includes(student.id)}
                          onCheckedChange={() => handleStudentToggle(student.id)}
                          data-testid={`student-checkbox-${student.id}`}
                        />
                        <div className="flex items-center space-x-3 flex-1">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {student.first_name[0]}{student.last_name[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-medium">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-slate-400 text-sm">@{student.username}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">No students available</p>
                    <p className="text-slate-500 text-sm">Add students first to assign assignments</p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700">
                <Button
                  variant="outline"
                  onClick={() => setShowAssignDialog(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAssignToStudents}
                  disabled={selectedStudents.length === 0}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="confirm-assign-button"
                >
                  Assign to {selectedStudents.length} Student(s)
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssignmentGenerator;