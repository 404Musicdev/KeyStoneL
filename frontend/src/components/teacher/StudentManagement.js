import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { 
  Users, 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff,
  UserPlus,
  Search,
  Calendar
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/students`);
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${API_BASE}/students`, newStudent);
      setStudents([...students, response.data]);
      setNewStudent({ first_name: '', last_name: '', username: '', password: '' });
      setShowAddDialog(false);
      toast.success('Student added successfully!');
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error(error.response?.data?.detail || 'Failed to add student');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
      return;
    }
    
    try {
      await axios.delete(`${API_BASE}/students/${studentId}`);
      setStudents(students.filter(student => student.id !== studentId));
      toast.success('Student deleted successfully');
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name} ${student.username}`
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
    <div className="space-y-6" data-testid="student-management">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 fade-in">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Student Management</h1>
          <p className="text-slate-400">Manage your student accounts and access</p>
        </div>
        
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" data-testid="add-student-button">
              <Plus className="w-4 h-4 mr-2" />
              Add New Student
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-slate-800 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Student</DialogTitle>
              <DialogDescription className="text-slate-400">
                Create a new student account with login credentials
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleAddStudent} className="space-y-4" data-testid="add-student-form">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-slate-300">First Name</Label>
                  <Input
                    id="firstName"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-white"
                    required
                    data-testid="student-firstname-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-slate-300">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({...newStudent, last_name: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-white"
                    required
                    data-testid="student-lastname-input"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">Username</Label>
                <Input
                  id="username"
                  value={newStudent.username}
                  onChange={(e) => setNewStudent({...newStudent, username: e.target.value})}
                  className="bg-slate-900 border-slate-600 text-white"
                  placeholder="Unique username for login"
                  required
                  data-testid="student-username-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={newStudent.password}
                    onChange={(e) => setNewStudent({...newStudent, password: e.target.value})}
                    className="bg-slate-900 border-slate-600 text-white pr-10"
                    required
                    data-testid="student-password-input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddDialog(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="create-student-button"
                >
                  Create Student
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="glass-effect border-slate-700 slide-up">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search students by name or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-800 border-slate-600 text-white placeholder-slate-400"
              data-testid="search-students-input"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="slide-up">
        {filteredStudents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card 
                key={student.id} 
                className="glass-effect border-slate-700 hover:border-slate-600 transition-all duration-300"
                data-testid={`student-card-${student.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {student.first_name[0]}{student.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">
                          {student.first_name} {student.last_name}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          @{student.username}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => handleDeleteStudent(student.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-500"
                      data-testid={`delete-student-${student.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Created:</span>
                    <span className="text-white">
                      {new Date(student.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      <Users className="w-3 h-3 mr-1" />
                      Student
                    </Badge>
                    
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        View Activity
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="glass-effect border-slate-700">
            <CardContent className="py-16 text-center">
              <UserPlus className="w-16 h-16 text-slate-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {students.length === 0 ? 'No students yet' : 'No students found'}
              </h3>
              <p className="text-slate-400 mb-6">
                {students.length === 0 
                  ? 'Get started by adding your first student account'
                  : 'Try adjusting your search terms'
                }
              </p>
              {students.length === 0 && (
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Student
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Stats */}
      {students.length > 0 && (
        <Card className="glass-effect border-slate-700 slide-up">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{students.length}</div>
                <div className="text-slate-400">Total Students</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">
                  {students.filter(s => new Date(s.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-slate-400">Added This Week</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400 mb-1">
                  {students.filter(s => new Date(s.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </div>
                <div className="text-slate-400">Added This Month</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentManagement;