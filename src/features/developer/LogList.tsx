import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  Smile, 
  CalendarDays,
  AlertCircle
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { getDailyLogs } from '../../utils/api';
import { formatDate, isToday } from '../../utils/dateUtils';
import Button from '../../components/Button';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
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

const LogList: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const userId = user?.id || '';

  // Load logs
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        const logs = await getDailyLogs(userId);
        
        // Sort logs by date (newest first)
        const sortedLogs = logs.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setLogs(sortedLogs);
        setFilteredLogs(sortedLogs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchLogs();
    }
  }, [userId]);

  // Handle search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredLogs(logs);
      return;
    }
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = logs.filter(log => 
      log.summary.toLowerCase().includes(lowerSearchTerm) ||
      log.date.includes(lowerSearchTerm) ||
      log.tasks.some(task => 
        task.description.toLowerCase().includes(lowerSearchTerm) ||
        task.tags.some(tag => tag.toLowerCase().includes(lowerSearchTerm))
      )
    );
    
    setFilteredLogs(filtered);
  }, [searchTerm, logs]);

  return (
    <div>
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Daily Logs</h1>
            <p className="text-gray-600">View and manage your work history</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link to="/logs/new">
              <Button variant="primary" icon={<Plus size={18} />}>
                New Log
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Search and Filter */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <TextField
            id="search"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search size={18} />}
            className="flex-1"
          />
        </div>
      </Card>
      
      {/* Logs List */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading your logs...</p>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map(log => (
            <Link to={`/logs/${log.id}`} key={log.id}>
              <Card className="hover:bg-gray-50 transition-colors duration-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900 flex items-center">
                        <CalendarDays size={16} className="mr-1 text-gray-500" />
                        {formatDate(log.date)}
                      </span>
                      {isToday(log.date) && (
                        <Badge text="Today" color="primary" />
                      )}
                      {log.isReviewed && (
                        <Badge text="Reviewed" color="success" />
                      )}
                      {log.blockers && (
                        <Badge text="Blocker" color="warning" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{log.summary}</p>
                    
                    <div className="mt-3 flex flex-wrap items-center gap-3">
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
                    
                    {log.tasks.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[...new Set(log.tasks.flatMap(t => t.tags))]
                          .filter(Boolean)
                          .slice(0, 3)
                          .map((tag, i) => (
                            <Badge key={i} text={tag} color="secondary" size="sm" />
                          ))}
                        {[...new Set(log.tasks.flatMap(t => t.tags))].length > 3 && (
                          <Badge text={`+${[...new Set(log.tasks.flatMap(t => t.tags))].length - 3} more`} color="default" size="sm" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center bg-gray-100 rounded-full p-3 mb-3">
              <AlertCircle size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No logs found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? "Try adjusting your search terms" : "Start tracking your daily progress"}
            </p>
            {!searchTerm && (
              <div className="mt-4">
                <Link to="/logs/new">
                  <Button variant="primary" icon={<Plus size={18} />}>Create Your First Log</Button>
                </Link>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default LogList;