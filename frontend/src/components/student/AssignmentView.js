import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Label } from '../ui/label';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  BookOpen,
  ArrowLeft,
  Send,
  AlertCircle,
  Trophy,
  Target
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const AssignmentView = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/student/assignments`);
      const assignmentData = response.data.find(a => a.student_assignment_id === assignmentId);
      
      if (!assignmentData) {
        toast.error('Assignment not found');
        navigate('/student/assignments');
        return;
      }
      
      setAssignment(assignmentData);
    } catch (error) {
      console.error('Error fetching assignment:', error);
      toast.error('Failed to load assignment');
      navigate('/student/assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = async () => {
    if (!assignment || assignment.completed) {
      return;
    }

    // Check if all questions are answered
    const totalQuestions = assignment.assignment.questions.length;
    const answeredQuestions = Object.keys(answers).length;
    
    if (answeredQuestions < totalQuestions) {
      toast.error(`Please answer all ${totalQuestions} questions before submitting.`);
      return;
    }

    // Convert answers object to array in correct order
    const answersArray = [];
    for (let i = 0; i < totalQuestions; i++) {
      answersArray[i] = answers[i] !== undefined ? answers[i] : -1;
    }

    setSubmitting(true);
    
    try {
      const response = await axios.post(`${API_BASE}/student/assignments/submit`, {
        student_assignment_id: assignmentId,
        answers: answersArray
      });
      
      toast.success(`Assignment submitted! Score: ${Math.round(response.data.score)}%`);
      
      // Refresh assignment data
      await fetchAssignment();
      
    } catch (error) {
      console.error('Error submitting assignment:', error);
      toast.error(error.response?.data?.detail || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeColor = (score) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getLetterGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Assignment Not Found</h2>
        <Button onClick={() => navigate('/student/assignments')} className="bg-blue-600 hover:bg-blue-700">
          Back to Assignments
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="assignment-view">
      {/* Header */}
      <div className="flex items-center space-x-4 fade-in">
        <Button
          variant="outline"
          onClick={() => navigate('/student/assignments')}
          className="border-slate-600 text-slate-300 hover:bg-slate-700"
          data-testid="back-button"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Assignments
        </Button>
        
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-white">{assignment.assignment.title}</h1>
          <p className="text-slate-400">
            {assignment.assignment.subject} • {assignment.assignment.grade_level}
          </p>
        </div>
        
        {assignment.completed ? (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle className="w-4 h-4 mr-1" />
            Completed
          </Badge>
        ) : (
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
            <Clock className="w-4 h-4 mr-1" />
            In Progress
          </Badge>
        )}
      </div>

      {/* Assignment Info */}
      <Card className="glass-effect border-slate-700 slide-up">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Assignment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-slate-400 text-sm font-medium">Topic</p>
              <p className="text-white">{assignment.assignment.topic}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Questions</p>
              <p className="text-white">{assignment.assignment.questions.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium">Assigned</p>
              <p className="text-white">{new Date(assignment.assigned_at).toLocaleDateString()}</p>
            </div>
          </div>
          
          {assignment.completed && (
            <div className="mt-6 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Your Score</p>
                  <div className="flex items-center space-x-3">
                    <span className={`text-3xl font-bold ${getGradeColor(assignment.score)}`}>
                      {Math.round(assignment.score)}%
                    </span>
                    <Badge className={`text-lg px-3 py-1 ${
                      assignment.score >= 90 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      assignment.score >= 80 ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                      assignment.score >= 70 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                      assignment.score >= 60 ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' :
                      'bg-red-500/20 text-red-400 border-red-500/30'
                    }`}>
                      {getLetterGrade(assignment.score)}
                    </Badge>
                  </div>
                </div>
                <Trophy className={`w-12 h-12 ${
                  assignment.score >= 90 ? 'text-yellow-400' :
                  assignment.score >= 80 ? 'text-blue-400' :
                  assignment.score >= 70 ? 'text-yellow-500' :
                  'text-slate-500'
                }`} />
              </div>
              
              {assignment.submitted_at && (
                <p className="text-slate-400 text-sm mt-2">
                  Submitted on {new Date(assignment.submitted_at).toLocaleDateString()} at {new Date(assignment.submitted_at).toLocaleTimeString()}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reading Passage */}
      {assignment.assignment.reading_passage && (
        <Card className="glass-effect border-slate-700 slide-up">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BookOpen className="w-5 h-5 mr-2" />
              Reading Passage
            </CardTitle>
            <CardDescription className="text-slate-400">
              Read the passage carefully before answering the questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert max-w-none">
              <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <div className="text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {assignment.assignment.reading_passage}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Questions */}
      <Card className="glass-effect border-slate-700 slide-up">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Questions
            </div>
            {!assignment.completed && (
              <span className="text-sm text-slate-400">
                {Object.keys(answers).length} of {assignment.assignment.questions.length} answered
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6" data-testid="questions-container">
          {assignment.assignment.questions.map((question, questionIndex) => {
            const isAnswered = answers[questionIndex] !== undefined;
            const selectedAnswer = answers[questionIndex];
            
            return (
              <div 
                key={questionIndex}
                className="p-6 rounded-lg border border-slate-700 bg-slate-800/30"
                data-testid={`question-${questionIndex}`}
              >
                <div className="flex items-start space-x-4 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    assignment.completed
                      ? (selectedAnswer === question.correct_answer
                          ? 'bg-green-500 text-white'
                          : 'bg-red-500 text-white'
                        )
                      : (isAnswered
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-600 text-slate-300'
                        )
                  }`}>
                    {questionIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-lg mb-4">{question.question}</h3>
                    
                    <RadioGroup
                      value={selectedAnswer?.toString()}
                      onValueChange={(value) => handleAnswerChange(questionIndex, parseInt(value))}
                      disabled={assignment.completed}
                      className="space-y-3"
                    >
                      {question.options.map((option, optionIndex) => {
                        const isCorrect = assignment.completed && optionIndex === question.correct_answer;
                        const isSelected = selectedAnswer === optionIndex;
                        
                        return (
                          <div 
                            key={optionIndex}
                            className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                              assignment.completed
                                ? (isCorrect
                                    ? 'border-green-500 bg-green-500/10'
                                    : (isSelected && !isCorrect
                                        ? 'border-red-500 bg-red-500/10'
                                        : 'border-slate-600 bg-slate-800/50'
                                      )
                                  )
                                : (isSelected
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-slate-600 bg-slate-800/50 hover:border-slate-500'
                                  )
                            }`}
                            data-testid={`question-${questionIndex}-option-${optionIndex}`}
                          >
                            <RadioGroupItem 
                              value={optionIndex.toString()} 
                              id={`q${questionIndex}_o${optionIndex}`}
                              disabled={assignment.completed}
                            />
                            <Label 
                              htmlFor={`q${questionIndex}_o${optionIndex}`}
                              className={`flex-1 cursor-pointer ${
                                assignment.completed
                                  ? (isCorrect
                                      ? 'text-green-300'
                                      : (isSelected && !isCorrect
                                          ? 'text-red-300'
                                          : 'text-slate-300'
                                        )
                                    )
                                  : 'text-white'
                              }`}
                            >
                              {option}
                            </Label>
                            
                            {assignment.completed && isCorrect && (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                            
                            {assignment.completed && isSelected && !isCorrect && (
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            )}
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Submit Button */}
      {!assignment.completed && (
        <Card className="glass-effect border-slate-700 slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Ready to submit?</p>
                <p className="text-slate-400 text-sm">
                  Make sure you've answered all questions. You won't be able to change your answers after submitting.
                </p>
              </div>
              
              <Button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < assignment.assignment.questions.length}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
                data-testid="submit-assignment-button"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Assignment
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssignmentView;