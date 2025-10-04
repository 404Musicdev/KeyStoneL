import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  BookOpen,
  Search,
  Calendar,
  Play,
  Award
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentAssignments = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/student/assignments`);
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const filteredAssignments = assignments
    .filter(assignment => {
      const matchesSearch = assignment.assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.assignment.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           assignment.assignment.topic.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'pending') return matchesSearch && !assignment.completed;
      if (filter === 'completed') return matchesSearch && assignment.completed;
      return matchesSearch;
    })
    .sort((a, b) => {
      // Sort pending assignments first, then by date
      if (!a.completed && b.completed) return -1;
      if (a.completed && !b.completed) return 1;
      return new Date(b.assigned_at) - new Date(a.assigned_at);
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="student-assignments">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">My Assignments</h1>
        <p className="text-slate-400">Complete your assignments and track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 slide-up">
        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Assignments</p>
                <p className="text-2xl font-bold text-white mt-1">{assignments.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">
                  {assignments.filter(a => !a.completed).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-400 mt-1">
                  {assignments.filter(a => a.completed).length}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-effect border-slate-700 slide-up">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                data-testid="search-assignments-input"
              />
            </div>
            
            {/* Filter Buttons */}
            <div className="flex space-x-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }
                data-testid="filter-all"
              >
                All
              </Button>
              <Button
                variant={filter === 'pending' ? 'default' : 'outline'}
                onClick={() => setFilter('pending')}
                className={filter === 'pending' 
                  ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }
                data-testid="filter-pending"
              >
                Pending
              </Button>
              <Button
                variant={filter === 'completed' ? 'default' : 'outline'}
                onClick={() => setFilter('completed')}
                className={filter === 'completed' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'border-slate-600 text-slate-300 hover:bg-slate-700'
                }
                data-testid="filter-completed"
              >
                Completed
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignments List */}
      <div className="slide-up">
        {filteredAssignments.length > 0 ? (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <Card 
                key={assignment.student_assignment_id}
                className={`glass-effect border-slate-700 hover:border-slate-600 transition-all duration-300 ${
                  !assignment.completed ? 'border-l-4 border-l-orange-500' : 'border-l-4 border-l-green-500'
                }`}
                data-testid={`assignment-${assignment.student_assignment_id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-semibold text-lg">{assignment.assignment.title}</h3>
                        <Badge 
                          className={assignment.completed 
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                          }
                        >
                          {assignment.completed ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                        <span className="flex items-center">
                          <BookOpen className="w-4 h-4 mr-1" />
                          {assignment.assignment.subject}
                        </span>
                        <span>{assignment.assignment.grade_level}</span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="text-slate-300 mb-3">
                        <strong>Topic:</strong> {assignment.assignment.topic}
                      </div>
                      
                      <div className="text-sm text-slate-400">
                        {assignment.assignment.questions.length} questions
                        {assignment.assignment.reading_passage && ' • Includes reading passage'}
                        {assignment.completed && assignment.submitted_at && (
                          <> • Submitted {new Date(assignment.submitted_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end space-y-2">
                      {assignment.completed && assignment.score !== null && (
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getGradeColor(assignment.score)}`}>
                            {Math.round(assignment.score)}%
                          </div>
                          <div className="text-slate-400 text-sm">Grade</div>
                        </div>
                      )}
                      
                      <Button
                        onClick={() => navigate(`/student/assignments/${assignment.student_assignment_id}`)}
                        className={assignment.completed 
                          ? 'bg-slate-600 hover:bg-slate-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }
                        data-testid={`view-assignment-${assignment.student_assignment_id}`}
                      >
                        {assignment.completed ? (
                          <><Award className="w-4 h-4 mr-2" /> Review</>
                        ) : (
                          <><Play className="w-4 h-4 mr-2" /> Start Assignment</>
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  {/* Progress bar for pending assignments */}
                  {!assignment.completed && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-orange-400">Not Started</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-0"></div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-effect border-slate-700">
            <CardContent className="py-16 text-center">
              <FileText className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {assignments.length === 0 ? 'No assignments yet' : 'No assignments found'}
              </h3>
              <p className="text-slate-400">
                {assignments.length === 0 
                  ? 'Your teacher will assign work that will appear here'
                  : 'Try adjusting your search terms or filters'
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentAssignments;