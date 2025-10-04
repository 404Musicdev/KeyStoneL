import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileText,
  Search,
  Trophy,
  Target,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Gradebook = () => {
  const [gradebook, setGradebook] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalSubmissions: 0,
    averageGrade: 0,
    completionRate: 0
  });

  useEffect(() => {
    fetchGradebook();
  }, []);

  const fetchGradebook = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/gradebook`);
      const data = response.data;
      setGradebook(data);
      
      // Calculate statistics
      let totalSubmissions = 0;
      let totalGrades = 0;
      let gradeSum = 0;
      
      data.forEach(studentRecord => {
        totalSubmissions += studentRecord.assignments.length;
        studentRecord.assignments.forEach(assignment => {
          if (assignment.score !== null) {
            gradeSum += assignment.score;
            totalGrades++;
          }
        });
      });
      
      setStats({
        totalStudents: data.length,
        totalSubmissions: totalSubmissions,
        averageGrade: totalGrades > 0 ? Math.round(gradeSum / totalGrades) : 0,
        completionRate: totalSubmissions > 0 ? Math.round((totalGrades / totalSubmissions) * 100) : 0
      });
      
    } catch (error) {
      console.error('Error fetching gradebook:', error);
      toast.error('Failed to load gradebook');
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

  const calculateStudentAverage = (assignments) => {
    if (assignments.length === 0) return 0;
    const scores = assignments.filter(a => a.score !== null).map(a => a.score);
    if (scores.length === 0) return 0;
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const filteredGradebook = gradebook.filter(record =>
    `${record.student.first_name} ${record.student.last_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="gradebook">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-white mb-2">Gradebook</h1>
        <p className="text-slate-400">Track student progress and assignment scores</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 slide-up">
        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Students</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Submissions</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalSubmissions}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
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
                  {stats.averageGrade}%
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium">Completion Rate</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.completionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass-effect border-slate-700 slide-up">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search students by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
              data-testid="search-gradebook-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Gradebook Content */}
      <Card className="glass-effect border-slate-700 slide-up" data-testid="gradebook-content">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Student Grades
          </CardTitle>
          <CardDescription className="text-slate-400">
            Detailed view of all student assignments and scores
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {filteredGradebook.length > 0 ? (
            <div className="space-y-6">
              {filteredGradebook.map((record) => {
                const studentAverage = calculateStudentAverage(record.assignments);
                const avgBadge = getGradeBadge(studentAverage);
                
                return (
                  <div 
                    key={record.student.id}
                    className="border border-slate-600 rounded-lg p-6 bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200"
                    data-testid={`student-record-${record.student.id}`}
                  >
                    {/* Student Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold">
                            {record.student.first_name[0]}{record.student.last_name[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">
                            {record.student.first_name} {record.student.last_name}
                          </h3>
                          <p className="text-slate-400">@{record.student.username}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {studentAverage > 0 && (
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getGradeColor(studentAverage)}`}>
                              {studentAverage}%
                            </div>
                            <Badge className={avgBadge.class}>
                              {avgBadge.text} Average
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Assignments */}
                    {record.assignments.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-white font-medium flex items-center mb-3">
                          <FileText className="w-4 h-4 mr-2" />
                          Assignments ({record.assignments.length})
                        </h4>
                        
                        <div className="grid gap-3">
                          {record.assignments.map((assignment, index) => {
                            const badge = getGradeBadge(assignment.score);
                            
                            return (
                              <div 
                                key={index}
                                className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg"
                              >
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-1">
                                    <h5 className="text-white font-medium">{assignment.assignment_title}</h5>
                                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                                      {assignment.subject}
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                                    <span className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {new Date(assignment.submitted_at).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                      <CheckCircle className="w-4 h-4 mr-1 text-green-400" />
                                      Completed
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center space-x-3">
                                  <div className={`text-xl font-bold ${getGradeColor(assignment.score)}`}>
                                    {Math.round(assignment.score)}%
                                  </div>
                                  <Badge className={badge.class}>
                                    {badge.text}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 border border-dashed border-slate-600 rounded-lg">
                        <AlertCircle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">No assignments submitted yet</p>
                        <p className="text-slate-500 text-sm">Grades will appear here when assignments are completed</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {gradebook.length === 0 ? 'No grades yet' : 'No students found'}
              </h3>
              <p className="text-slate-400">
                {gradebook.length === 0 
                  ? 'Grades will appear here when students complete assignments'
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

export default Gradebook;