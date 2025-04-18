import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  CalendarDays, 
  CheckCircle, 
  FileText, 
  Clock, 
  Smile, 
  AlertCircle
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { getDailyLogs, getProductivityData } from '../../utils/api';
import { formatDate, isToday, getCurrentWeekRange } from '../../utils/dateUtils';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Badge from '../../components/Badge';
import { DailyLog, MoodType, ProductivityData } from '../../types';

// Mood emoji mapping
const moodEmojis: Record<MoodType, string> = {
  great: '😄',
  good: '🙂',
  neutral: '😐',
  bad: '🙁',
  terrible: '😫'
};

const DeveloperDashboard: React.FC = () => {
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [productivityData, setProductivityData] = useState<ProductivityData[]>([]);
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const userId = user?.id || '';

  // Load recent logs and productivity data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get recent logs
        const logs = await getDailyLogs(userId);
        const sortedLogs = logs.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ).slice(0, 5);
        
        setRecentLogs(sortedLogs);
        
        // Check if logged today
        const today = new Date().toISOString().split('T')[0];
        setHasLoggedToday(logs.some(log => log.date === today));
        
        // Get productivity data
        const { start, end } = getCurrentWeekRange();
        const productivityData = await getProductivityData(userId, start, end);
        setProductivityData(productivityData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchData();
    }
  }, [userId]);

  // Calculate productivity metrics
  const calculateMetrics = () => {
    if (productivityData.length === 0) {
      return { 
        tasksCompleted: 0, 
        totalTime: 0, 
        avgTasksPerDay: 0 
      };
    }
    
    const tasksCompleted = productivityData.reduce((sum, day) => sum + day.tasksCompleted, 0);
    const totalTime = productivityData.reduce((sum, day) => sum + day.totalTimeSpent, 0);
    const avgTasksPerDay = Math.round((tasksCompleted / productivityData.length) * 10) / 10;
    
    return { tasksCompleted, totalTime, avgTasksPerDay };
  };
  
  const metrics = calculateMetrics();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Developer Dashboard</h1>
        <p className="text-gray-600">Track and manage your daily productivity</p>
      </header>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Quick Actions</h2>
          <div className="text-sm text-gray-500">
            <CalendarDays className="inline-block mr-1" size={16} />
            {formatDate(new Date().toISOString())}
          </div>
        </div>
        
        <Card padding="large" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-semibold">
                {hasLoggedToday ? "Today's Log Submitted" : "Ready to log your day?"}
              </h3>
              <p className="mt-1 opacity-80">
                {hasLoggedToday 
                  ? "You've already logged your progress for today. Great job!"
                  : "Track your tasks, time spent, and share your accomplishments."
                }
              </p>
            </div>
            <Link to={hasLoggedToday ? "/logs" : "/logs/new"}>
              <Button 
                variant={hasLoggedToday ? "outline" : "info"}
                icon={hasLoggedToday ? <FileText size={18} /> : <Plus size={18} />}
              >
                {hasLoggedToday ? "View Log" : "Create Daily Log"}
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      
      {/* Statistics */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">This Week's Stats</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tasks Completed */}
          <Card className="transition-transform hover:translate-y-[-4px]">
            <div className="flex items-center">
              <div className="mr-4 bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Tasks Completed</div>
                <div className="text-2xl font-bold">{metrics.tasksCompleted}</div>
              </div>
            </div>
          </Card>
          
          {/* Hours Logged */}
          <Card className="transition-transform hover:translate-y-[-4px]">
            <div className="flex items-center">
              <div className="mr-4 bg-blue-100 p-3 rounded-full">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Hours Logged</div>
                <div className="text-2xl font-bold">{Math.round(metrics.totalTime / 60 * 10) / 10}</div>
              </div>
            </div>
          </Card>
          
          {/* Avg Tasks per Day */}
          <Card className="transition-transform hover:translate-y-[-4px]">
            <div className="flex items-center">
              <div className="mr-4 bg-purple-100 p-3 rounded-full">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-gray-500">Avg Tasks per Day</div>
                <div className="text-2xl font-bold">{metrics.avgTasksPerDay}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      
      {/* Recent Logs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Logs</h2>
          <Link to="/logs" className="text-sm text-blue-600 hover:text-blue-800">
            View All
          </Link>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading your logs...</p>
          </div>
        ) : recentLogs.length > 0 ? (
          <div className="space-y-4">
            {recentLogs.map(log => (
              <Link to={`/logs/${log.id}`} key={log.id}>
                <Card className="hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {formatDate(log.date)}
                        </span>
                        {isToday(log.date) && (
                          <Badge text="Today" color="primary" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{log.summary}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <span className="text-sm text-gray-500 flex items-center">
                          <CheckCircle size={14} className="mr-1 text-green-600" />
                          {log.tasks.filter(t => t.completed).length}/{log.tasks.length} tasks
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock size={14} className="mr-1 text-blue-600" />
                          {Math.round(log.tasks.reduce((sum, t) => sum + t.timeSpent, 0) / 60 * 10) / 10} hours
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Smile size={14} className="mr-1 text-amber-600" />
                          {moodEmojis[log.mood]}
                        </span>
                      </div>
                    </div>
                    {log.blockers && (
                      <div className="flex items-start">
                        <Badge 
                          text="Blocker" 
                          color="warning" 
                          size="sm"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center bg-gray-100 rounded-full p-3 mb-3">
                <FileText size={24} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No logs yet</h3>
              <p className="text-gray-500 mt-1">Start tracking your daily progress</p>
              <div className="mt-4">
                <Link to="/logs/new">
                  <Button variant="primary" icon={<Plus size={18} />}>Create Your First Log</Button>
                </Link>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DeveloperDashboard;