import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  BarChart3, 
  TrendingUp, 
  Trophy,
  Target,
  Search,
  Calendar,
  FileText,
  Award,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentGrades = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalCompleted: 0,
    averageGrade: 0,
    highestGrade: 0,
    lowestGrade: 0
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/student/assignments`);
      const assignmentsData = response.data;
      
      // Filter only completed assignments with scores
      const completedAssignments = assignmentsData.filter(a => a.completed && a.score !== null);
      setAssignments(assignmentsData);
      
      // Calculate stats
      if (completedAssignments.length > 0) {
        const scores = completedAssignments.map(a => a.score);
        const total = scores.reduce((sum, score) => sum + score, 0);
        
        setStats({
          totalCompleted: completedAssignments.length,
          averageGrade: Math.round(total / scores.length),
          highestGrade: Math.max(...scores),
          lowestGrade: Math.min(...scores)
        });
      } else {
        setStats({
          totalCompleted: 0,
          averageGrade: 0,
          highestGrade: 0,
          lowestGrade: 0
        });
      }
      
    } catch (error) {
      console.error('Error fetching grades:', error);
      toast.error('Failed to load grades');
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

  const getGradeBadge = (score) => {
    if (score >= 90) return { text: 'A', class: 'bg-green-500/20 text-green-400 border-green-500/30' };
    if (score >= 80) return { text: 'B', class: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (score >= 70) return { text: 'C', class: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    if (score >= 60) return { text: 'D', class: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    return { text: 'F', class: 'bg-red-500/20 text-red-400 border-red-500/30' };
  };

  const getPerformanceMessage = (average) => {
    if (average >= 90) return { message: "Excellent work! Keep it up!", icon: Trophy, color: "text-yellow-400" };
    if (average >= 80) return { message: "Great job! You're doing well!", icon: Award, color: "text-blue-400" };
    if (average >= 70) return { message: "Good progress! Room for improvement.", icon: Target, color: "text-yellow-400" };
    if (average >= 60) return { message: "Keep working hard!", icon: TrendingUp, color: "text-orange-400" };
    return { message: "Don't give up! Ask for help if needed.", icon: Target, color: "text-red-400" };
  };

  const completedAssignments = assignments
    .filter(a => a.completed && a.score !== null)
    .filter(assignment =>
      assignment.assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.assignment.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const performance = getPerformanceMessage(stats.averageGrade);
  const PerformanceIcon = performance.icon;

  return (
    <div className="space-y-6" data-testid="student-grades">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">My Grades</h1>
        <p className="text-slate-400">Track your academic progress and achievements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Assignments Graded</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalCompleted}</p>
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
                <p className="text-slate-400 text-sm font-medium">Average Grade</p>
                <p className={`text-2xl font-bold mt-1 ${getGradeColor(stats.averageGrade)}`}>
                  {stats.averageGrade > 0 ? `${stats.averageGrade}%` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Highest Score</p>
                <p className={`text-2xl font-bold mt-1 ${getGradeColor(stats.highestGrade)}`}>
                  {stats.highestGrade > 0 ? `${Math.round(stats.highestGrade)}%` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Lowest Score</p>
                <p className={`text-2xl font-bold mt-1 ${getGradeColor(stats.lowestGrade)}`}>
                  {stats.lowestGrade > 0 ? `${Math.round(stats.lowestGrade)}%` : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Message */}
      {stats.averageGrade > 0 && (
        <Card className="glass-effect border-slate-700 slide-up">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center`}>
                <PerformanceIcon className={`w-8 h-8 ${performance.color}`} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold ${performance.color}`}>{performance.message}</h3>
                <p className="text-slate-400">Based on your current average of {stats.averageGrade}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <Card className="glass-effect border-slate-700 slide-up">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search assignments by title or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
              data-testid="search-grades-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Grades List */}
      <Card className="glass-effect border-slate-700 slide-up" data-testid="grades-list">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Grade History
          </CardTitle>
          <CardDescription className="text-slate-400">
            All your completed assignments and scores
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {completedAssignments.length > 0 ? (
            <div className="space-y-4">
              {completedAssignments.map((assignment) => {
                const badge = getGradeBadge(assignment.score);
                
                return (
                  <div 
                    key={assignment.student_assignment_id}
                    className="p-6 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200"
                    data-testid={`grade-${assignment.student_assignment_id}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">{assignment.assignment.title}</h3>
                          <Badge variant="outline" className="border-slate-600 text-slate-400">
                            {assignment.assignment.subject}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-slate-400 mb-2">
                          <span>{assignment.assignment.grade_level}</span>
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            Submitted {new Date(assignment.submitted_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                            Completed
                          </span>
                        </div>
                        
                        <div className="text-slate-300">
                          <strong>Topic:</strong> {assignment.assignment.topic}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${getGradeColor(assignment.score)}`}>
                            {Math.round(assignment.score)}%
                          </div>
                          <Badge className={badge.class}>
                            {badge.text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">
                        {assignment.assignment.questions.length} questions
                        {assignment.assignment.reading_passage && ' • Reading passage included'}
                      </span>
                      
                      {assignment.score >= 90 && (
                        <div className="flex items-center text-yellow-400">
                          <Trophy className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">Excellent!</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {assignments.length === 0 ? 'No grades yet' : 'No grades found'}
              </h3>
              <p className="text-slate-400">
                {assignments.length === 0 
                  ? 'Complete assignments to see your grades here'
                  : 'Try adjusting your search terms'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentGrades;