import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  TrendingUp,
  AlertCircle,
  BookOpen,
  Target,
  Calendar
} from 'lucide-react';
import { Badge } from '../ui/badge';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentOverview = () => {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    completedAssignments: 0,
    pendingAssignments: 0,
    averageGrade: 0
  });

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/student/assignments`);
      const assignmentsData = response.data;
      setAssignments(assignmentsData);
      
      // Calculate stats
      const completed = assignmentsData.filter(a => a.completed);
      const pending = assignmentsData.filter(a => !a.completed);
      
      let totalGrade = 0;
      let gradeCount = 0;
      
      completed.forEach(assignment => {
        if (assignment.score !== null) {
          totalGrade += assignment.score;
          gradeCount++;
        }
      });
      
      setStats({
        totalAssignments: assignmentsData.length,
        completedAssignments: completed.length,
        pendingAssignments: pending.length,
        averageGrade: gradeCount > 0 ? Math.round(totalGrade / gradeCount) : 0
      });
      
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

  const statCards = [
    {
      title: 'Total Assignments',
      value: stats.totalAssignments,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/student/assignments')
    },
    {
      title: 'Completed',
      value: stats.completedAssignments,
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/student/grades')
    },
    {
      title: 'Pending',
      value: stats.pendingAssignments,
      icon: Clock,
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/student/assignments')
    },
    {
      title: 'Average Grade',
      value: stats.averageGrade > 0 ? `${stats.averageGrade}%` : 'N/A',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/student/grades')
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="student-overview">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">My Dashboard</h1>
        <p className="text-slate-400">Track your assignments, grades, and learning progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title}
              className="glass-effect border-slate-700 hover:border-slate-600 cursor-pointer transition-all duration-300 hover:scale-105"
              onClick={stat.action}
              data-testid={`stat-card-${stat.title.toLowerCase().replace(/ /g, '-')}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm font-medium">{stat.title}</p>
                    <p className={`text-2xl font-bold mt-1 ${
                      stat.title === 'Average Grade' && stats.averageGrade > 0 
                        ? getGradeColor(stats.averageGrade) 
                        : 'text-white'
                    }`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Assignments */}
        <Card className="glass-effect border-slate-700 slide-up" data-testid="pending-assignments-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Pending Assignments
            </CardTitle>
            <CardDescription className="text-slate-400">
              Assignments that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.filter(a => !a.completed).length > 0 ? (
              <div className="space-y-3">
                {assignments.filter(a => !a.completed).slice(0, 3).map((assignment) => (
                  <div
                    key={assignment.student_assignment_id}
                    className="p-4 rounded-lg border border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer"
                    onClick={() => navigate(`/student/assignments/${assignment.student_assignment_id}`)}
                    data-testid={`pending-assignment-${assignment.student_assignment_id}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="text-white font-medium">{assignment.assignment.title}</h4>
                        <div className="flex items-center space-x-3 text-sm text-slate-400 mt-1">
                          <span className="flex items-center">
                            <BookOpen className="w-4 h-4 mr-1" />
                            {assignment.assignment.subject}
                          </span>
                          <span>{assignment.assignment.grade_level}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    </div>
                    
                    <div className="text-slate-300 text-sm mb-3">
                      <strong>Topic:</strong> {assignment.assignment.topic}
                    </div>
                    
                    <div className="text-sm text-slate-400">
                      {assignment.assignment.questions.length} questions • 
                      Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                
                {assignments.filter(a => !a.completed).length > 3 && (
                  <Button 
                    variant="outline" 
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                    onClick={() => navigate('/student/assignments')}
                  >
                    View All Pending ({assignments.filter(a => !a.completed).length})
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-white font-medium">All caught up!</p>
                <p className="text-slate-400 text-sm">No pending assignments at the moment</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card className="glass-effect border-slate-700 slide-up" data-testid="recent-grades-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Recent Grades
            </CardTitle>
            <CardDescription className="text-slate-400">
              Your latest assignment results
            </CardDescription>
          </CardHeader>
          <CardContent>
            {assignments.filter(a => a.completed && a.score !== null).length > 0 ? (
              <div className="space-y-3">
                {assignments
                  .filter(a => a.completed && a.score !== null)
                  .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at))
                  .slice(0, 4)
                  .map((assignment) => (
                    <div
                      key={assignment.student_assignment_id}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                      data-testid={`recent-grade-${assignment.student_assignment_id}`}
                    >
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{assignment.assignment.title}</p>
                        <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
                          <span>{assignment.assignment.subject}</span>
                          <span>•</span>
                          <span>{new Date(assignment.submitted_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className={`text-lg font-bold ${getGradeColor(assignment.score)}`}>
                        {Math.round(assignment.score)}%
                      </div>
                    </div>
                  ))
                }
                
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                  onClick={() => navigate('/student/grades')}
                >
                  View All Grades
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No grades yet</p>
                <p className="text-slate-500 text-sm">Complete assignments to see your grades here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-effect border-slate-700 slide-up">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 bg-blue-600 hover:bg-blue-700 text-white flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/student/assignments')}
              data-testid="view-assignments-button"
            >
              <FileText className="w-6 h-6" />
              <span>View Assignments</span>
            </Button>
            
            <Button 
              className="h-20 bg-green-600 hover:bg-green-700 text-white flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/student/grades')}
              data-testid="check-grades-button"
            >
              <BarChart3 className="w-6 h-6" />
              <span>Check Grades</span>
            </Button>
            
            <Button 
              className="h-20 bg-purple-600 hover:bg-purple-700 text-white flex flex-col items-center justify-center space-y-2"
              onClick={() => navigate('/student/messages')}
              data-testid="send-message-button"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Message Teacher</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentOverview;