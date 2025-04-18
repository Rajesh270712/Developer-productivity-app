import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Smile, 
  Edit, 
  Trash, 
  AlertCircle,
  CheckCircle,
  X,
  MessageSquare
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { getDailyLog, deleteDailyLog } from '../../utils/api';
import { formatDate, formatTimeSpent } from '../../utils/dateUtils';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { DailyLog, MoodType } from '../../types';

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

const LogDetail: React.FC = () => {
  const { logId } = useParams<{ logId: string }>();
  const [log, setLog] = useState<DailyLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load log data
  useEffect(() => {
    const fetchLog = async () => {
      if (!logId) return;
      
      try {
        setIsLoading(true);
        const logData = await getDailyLog(logId);
        
        if (!logData) {
          setError('Log not found');
          return;
        }
        
        setLog(logData);
      } catch (err) {
        console.error('Error fetching log:', err);
        setError('Failed to load log');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLog();
  }, [logId]);

  // Handle delete
  const handleDelete = async () => {
    if (!logId) return;
    
    try {
      await deleteDailyLog(logId);
      navigate('/logs');
    } catch (err) {
      console.error('Error deleting log:', err);
      setError('Failed to delete log');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading log...</p>
      </div>
    );
  }

  if (error || !log) {
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
          <Link to="/logs">
            <Button variant="primary">Back to Logs</Button>
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
              <Link to="/logs" className="text-blue-600 hover:text-blue-800">
                Back to Logs
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{formatDate(log.date)}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Daily Log: {formatDate(log.date)}
            </h1>
          </div>
          
          <div className="mt-4 sm:mt-0 flex gap-3">
            <Link to={`/logs/edit/${logId}`}>
              <Button variant="outline" icon={<Edit size={18} />}>
                Edit
              </Button>
            </Link>
            
            <Button 
              variant="danger" 
              icon={<Trash size={18} />}
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete
            </Button>
          </div>
        </div>
      </header>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full">
            <div className="text-center">
              <div className="inline-flex items-center justify-center bg-red-100 rounded-full p-3 mb-3">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Confirm Deletion</h3>
              <p className="text-gray-600 mt-2">
                Are you sure you want to delete this log? This action cannot be undone.
              </p>
              
              <div className="mt-6 flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
      
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
          
          {/* Manager's Review */}
          {log.isReviewed && log.reviewNotes && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <MessageSquare size={18} className="text-blue-500 mr-2" />
                Manager's Feedback
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{log.reviewNotes}</p>
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
                <div className="text-sm text-gray-500">Status</div>
                <div className="mt-1">
                  {log.isReviewed ? (
                    <Badge text="Reviewed" color="success" />
                  ) : (
                    <Badge text="Pending Review" color="info" />
                  )}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Created</div>
                <div className="text-gray-700 mt-1">
                  {new Date(log.createdAt).toLocaleString()}
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Last Updated</div>
                <div className="text-gray-700 mt-1">
                  {new Date(log.updatedAt).toLocaleString()}
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

export default LogDetail;