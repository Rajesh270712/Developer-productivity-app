import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Smile, 
  CheckCircle, 
  AlertCircle,
  User,
  MessageSquare,
  ArrowLeft,
  CheckCheck,
  Download
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { getDailyLog, updateDailyLog, getTeamMembers } from '../../utils/api';
import { formatDate, formatTimeSpent } from '../../utils/dateUtils';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import TextArea from '../../components/TextArea';
import Avatar from '../../components/Avatar';
import { DailyLog, MoodType, User as UserType } from '../../types';

// Mood emoji mapping
const moodEmojis: Record<MoodType, string> = {
  great: '😄',
  good: '🙂',
  neutral: '😐',
  bad: '🙁',
  terrible: '😫'
};

// Mood color mapping
const moodColors: Record<MoodType, string> = {
  great: 'bg-green-100 text-green-800',
  good: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-800',
  bad: 'bg-orange-100 text-orange-800',
  terrible: 'bg-red-100 text-red-800'
};

const LogReview: React.FC = () => {
  const { logId } = useParams<{ logId: string }>();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [developer, setDeveloper] = useState<UserType | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const { user } = useAuth();
  const managerId = user?.id || '';
  const teamId = user?.teamId || '';
  const navigate = useNavigate();

  // Load log data and developer info
  useEffect(() => {
    const fetchData = async () => {
      if (!logId) return;
      
      try {
        setIsLoading(true);
        
        // Get log data
        const logData = await getDailyLog(logId);
        
        if (!logData) {
          setError('Log not found');
          return;
        }
        
        setLog(logData);
        setReviewNotes(logData.reviewNotes || '');
        
        // Get developer info
        const teamMembers = await getTeamMembers(teamId);
        const developerData = teamMembers.find(m => m.id === logData.userId);
        
        if (developerData) {
          setDeveloper(developerData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load log data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (logId && teamId) {
      fetchData();
    }
  }, [logId, teamId]);

  // Submit review
  const handleSubmitReview = async () => {
    if (!log || !managerId) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      
      await updateDailyLog(log.id, {
        isReviewed: true,
        reviewedBy: managerId,
        reviewNotes: reviewNotes.trim() || undefined
      });
      
      setSuccess('Review submitted successfully!');
      
      // Update local state
      setLog({
        ...log,
        isReviewed: true,
        reviewedBy: managerId,
        reviewNotes: reviewNotes.trim() || undefined
      });
      
      // Navigate back after a delay
      setTimeout(() => {
        navigate('/team');
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle export
  const handleExport = (format: 'pdf' | 'csv') => {
    if (!log) return;

    const data = {
      date: log.date,
      developer: developer?.name,
      tasks: log.tasks,
      timeSpent: log.tasks.reduce((sum, task) => sum + task.timeSpent, 0),
      completedTasks: log.tasks.filter(t => t.completed).length,
      mood: log.mood,
      summary: log.summary,
      blockers: log.blockers,
      reviewNotes: log.reviewNotes
    };

    // In a real app, we would use proper PDF/CSV generation
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `log-${log.date}-${format}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading log...</p>
      </div>
    );
  }

  if (error || !log || !developer) {
    return (
      <div className="text-center py-10">
        <div className="inline-flex items-center justify-center bg-red-100 rounded-full p-3 mb-3">
          <AlertCircle size={24} className="text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">{error || 'Log not found'}</h3>
        <p className="text-gray-500 mt-1">
          The log you're looking for could not be loaded.
        </p>
        <div className="mt-4">
          <Link to="/team">
            <Button variant="primary">Back to Team</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const totalTimeSpent = log.tasks.reduce((sum, task) => sum + task.timeSpent, 0);
  const completedTasks = log.tasks.filter(task => task.completed).length;
  const allTags = [...new Set(log.tasks.flatMap(task => task.tags))].filter(Boolean);

  return (
    <div>
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Link to="/team" className="text-blue-600 hover:text-blue-800 flex items-center">
                <ArrowLeft size={16} className="mr-1" />
                Back to Team
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Review Log: {formatDate(log.date)}
            </h1>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button
              variant="outline"
              icon={<Download size={18} />}
              onClick={() => setShowExportOptions(!showExportOptions)}
            >
              Export
            </Button>
            
            {!log.isReviewed && (
              <Button
                variant="primary"
                icon={<CheckCheck size={18} />}
                onClick={handleSubmitReview}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Mark as Reviewed'}
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Export options dropdown */}
      {showExportOptions && (
        <Card className="mb-6">
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
            >
              Export as PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('csv')}
            >
              Export as CSV
            </Button>
          </div>
        </Card>
      )}
      
      {success && (
        <div className="mb-6 p-4 rounded-md bg-green-50 border border-green-200 text-green-700">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}
      
      {/* Developer Info */}
      <Card className="mb-6">
        <div className="flex items-center">
          <Avatar 
            src={developer.avatar}
            name={developer.name}
            size="lg"
            className="mr-4"
          />
          
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{developer.name}</h2>
            <p className="text-gray-600">{developer.email}</p>
          </div>
          
          <div className="ml-auto">
            <div className="text-right">
              <div className="text-sm text-gray-500">Log Status</div>
              <div className="mt-1">
                {log.isReviewed ? (
                  <Badge text="Reviewed" color="success" />
                ) : (
                  <Badge text="Pending Review" color="warning" />
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Review Form */}
      <Card className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MessageSquare size={18} className="text-blue-600 mr-2" />
          Manager Feedback
        </h2>
        
        <div className="space-y-4">
          <TextArea
            id="reviewNotes"
            label="Review Notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Provide detailed feedback on the developer's work, progress, and any suggestions for improvement..."
            rows={6}
            disabled={log.isReviewed || isSubmitting}
            helperText="Your feedback will be visible to the developer and helps track their growth."
          />
          
          {log.isReviewed ? (
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="text-sm text-gray-500 mb-2">
                Reviewed on {new Date(log.updatedAt).toLocaleDateString()}
              </div>
              <div className="text-gray-700 whitespace-pre-line">
                {log.reviewNotes}
              </div>
            </div>
          ) : (
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={handleSubmitReview}
                disabled={isSubmitting || !reviewNotes.trim()}
              >
                {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
              </Button>
            </div>
          )}
        </div>
      </Card>
      
      {/* Log Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>
            
            {log.tasks.length === 0 ? (
              <p className="text-gray-500">No tasks recorded for this day.</p>
            ) : (
              <div className="space-y-4">
                {log.tasks.map((task, index) => (
                  <div 
                    key={index} 
                    className={`p-4 border rounded-md ${
                      task.completed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${task.completed ? 'text-green-500' : 'text-gray-400'}`}>
                        {task.completed ? <CheckCircle size={18} /> : <Clock size={18} />}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className={`font-medium ${task.completed ? 'text-green-700' : 'text-gray-700'}`}>
                          {task.description}
                        </h3>
                        
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock size={14} className="mr-1 text-gray-400" />
                            {formatTimeSpent(task.timeSpent)}
                          </span>
                          
                          {task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {task.tags.map((tag, i) => (
                                <Badge key={i} text={tag} color="secondary" size="sm" />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          
          {/* Reflections */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Summary</h2>
            <p className="text-gray-700 whitespace-pre-line">{log.summary}</p>
          </Card>
          
          {/* Blockers */}
          {log.blockers && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle size={18} className="text-amber-500 mr-2" />
                Blockers
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{log.blockers}</p>
            </Card>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Log Info */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Log Details</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Date</div>
                <div className="flex items-center text-gray-700 mt-1">
                  <Calendar size={16} className="mr-2 text-gray-400" />
                  {formatDate(log.date)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Mood</div>
                <div className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${moodColors[log.mood]}`}>
                    {moodEmojis[log.mood]} {log.mood.charAt(0).toUpperCase() + log.mood.slice(1)}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="text-gray-700 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
          
          {/* Statistics */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Statistics</h2>
            
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Total Time Spent</div>
                <div className="text-xl font-semibold text-gray-800 mt-1">
                  {formatTimeSpent(totalTimeSpent)}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Tasks Completed</div>
                <div className="text-xl font-semibold text-gray-800 mt-1">
                  {completedTasks} / {log.tasks.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ width: `${log.tasks.length ? (completedTasks / log.tasks.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
          
          {/* Tags */}
          {allTags.length > 0 && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Tags</h2>
              
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, index) => (
                  <Badge key={index} text={tag} color="secondary" />
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LogReview;