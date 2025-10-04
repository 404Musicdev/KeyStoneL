import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  BookOpen, 
  TrendingUp,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Overview = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalAssignments: 0,
    completedAssignments: 0,
    averageGrade: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      
      // Fetch students
      const studentsResponse = await axios.get(`${API_BASE}/students`);
      const students = studentsResponse.data;
      
      // Fetch assignments
      const assignmentsResponse = await axios.get(`${API_BASE}/assignments`);
      const assignments = assignmentsResponse.data;
      
      // Fetch gradebook for completed assignments
      const gradebookResponse = await axios.get(`${API_BASE}/gradebook`);
      const gradebook = gradebookResponse.data;
      
      // Calculate stats
      let completedCount = 0;
      let totalGrades = 0;
      let gradeCount = 0;
      
      gradebook.forEach(student => {
        student.assignments.forEach(assignment => {
          completedCount++;
          if (assignment.score !== null) {
            totalGrades += assignment.score;
            gradeCount++;
          }
        });
      });
      
      const averageGrade = gradeCount > 0 ? Math.round(totalGrades / gradeCount) : 0;
      
      setStats({
        totalStudents: students.length,
        totalAssignments: assignments.length,
        completedAssignments: completedCount,
        averageGrade: averageGrade
      });
      
      // Create recent activity from gradebook
      const activities = [];
      gradebook.forEach(student => {
        student.assignments.forEach(assignment => {
          if (assignment.submitted_at) {
            activities.push({
              id: `${student.student.id}-${assignment.assignment_title}`,
              type: 'submission',
              student: `${student.student.first_name} ${student.student.last_name}`,
              assignment: assignment.assignment_title,
              score: assignment.score,
              timestamp: assignment.submitted_at
            });
          }
        });
      });
      
      // Sort by most recent and take first 5
      activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecentActivity(activities.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching overview data:', error);
      toast.error('Failed to load overview data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/teacher/students')
    },
    {
      title: 'Assignments Created',
      value: stats.totalAssignments,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/teacher/assignments')
    },
    {
      title: 'Completed Submissions',
      value: stats.completedAssignments,
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/teacher/gradebook')
    },
    {
      title: 'Average Grade',
      value: `${stats.averageGrade}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/teacher/gradebook')
    }
  ];

  const quickActions = [
    {
      title: 'Add New Student',
      description: 'Create a new student account',
      icon: Users,
      action: () => navigate('/teacher/students'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Generate Assignment',
      description: 'Create AI-powered assignments',
      icon: FileText,
      action: () => navigate('/teacher/assignments'),
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Create Lesson Plan',
      description: 'Generate structured lesson plans',
      icon: BookOpen,
      action: () => navigate('/teacher/lesson-plans'),
      color: 'from-purple-500 to-purple-600'
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
    <div className="space-y-6" data-testid="teacher-overview">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400">Welcome back! Here's what's happening in your classroom.</p>
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
                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
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
        {/* Quick Actions */}
        <Card className="glass-effect border-slate-700 slide-up" data-testid="quick-actions-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Plus className="w-5 h-5 mr-2" />
              Quick Actions
            </CardTitle>
            <CardDescription className="text-slate-400">
              Common tasks you might want to perform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.title}
                  onClick={action.action}
                  className="w-full p-4 rounded-lg border border-slate-600 hover:border-slate-500 bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 text-left group"
                  data-testid={`quick-action-${action.title.toLowerCase().replace(/ /g, '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white group-hover:text-blue-400 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-sm text-slate-400">{action.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="glass-effect border-slate-700 slide-up" data-testid="recent-activity-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription className="text-slate-400">
              Latest submissions and activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700"
                    data-testid={`activity-${activity.id}`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          {activity.student} submitted {activity.assignment}
                        </p>
                        <p className="text-slate-400 text-xs">
                          Score: {Math.round(activity.score)}% • {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className="text-slate-400">No recent activity</p>
                <p className="text-slate-500 text-sm">Activity will appear here when students submit assignments</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Overview;