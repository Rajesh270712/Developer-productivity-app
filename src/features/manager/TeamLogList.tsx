import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Calendar,
  Smile
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { getDailyLogs, getTeamMembers } from '../../utils/api';
import { formatDate, isToday } from '../../utils/dateUtils';
import Button from '../../components/Button';
import Card from '../../components/Card';
import TextField from '../../components/TextField';
import Select from '../../components/Select';
import Badge from '../../components/Badge';
import Avatar from '../../components/Avatar';
import { MoodType, DailyLog, User as UserType } from '../../types';

// Mood emoji mapping
const moodEmojis: Record<MoodType, string> = {
  great: '😄',
  good: '🙂',
  neutral: '😐',
  bad: '🙁',
  terrible: '😫'
};

const TeamLogList: React.FC = () => {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<DailyLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<UserType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<string>('');
  const [hasBlockers, setHasBlockers] = useState<boolean | ''>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  
  const { user } = useAuth();
  const teamId = user?.teamId || '';

  // Load logs and team members
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get team members
        const members = await getTeamMembers(teamId);
        setTeamMembers(members.filter(m => m.role === 'developer'));
        
        // Get all logs
        const allLogs = await getDailyLogs();
        
        // Filter logs to only include team members
        const teamMemberIds = members.map(m => m.id);
        const teamLogs = allLogs.filter(log => 
          teamMemberIds.includes(log.userId)
        );
        
        // Sort logs by date (newest first)
        const sortedLogs = teamLogs.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setLogs(sortedLogs);
        setFilteredLogs(sortedLogs);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...logs];
    
    // Search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(log => 
        log.summary.toLowerCase().includes(lowerSearchTerm) ||
        log.tasks.some(task => task.description.toLowerCase().includes(lowerSearchTerm)) ||
        (log.blockers && log.blockers.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    // Team member filter
    if (selectedMember) {
      filtered = filtered.filter(log => log.userId === selectedMember);
    }
    
    // Review status filter
    if (reviewStatus === 'reviewed') {
      filtered = filtered.filter(log => log.isReviewed);
    } else if (reviewStatus === 'pending') {
      filtered = filtered.filter(log => !log.isReviewed);
    }
    
    // Blockers filter
    if (hasBlockers === true) {
      filtered = filtered.filter(log => Boolean(log.blockers));
    } else if (hasBlockers === false) {
      filtered = filtered.filter(log => !log.blockers);
    }
    
    // Date range filter
    if (dateFrom) {
      filtered = filtered.filter(log => log.date >= dateFrom);
    }
    
    if (dateTo) {
      filtered = filtered.filter(log => log.date <= dateTo);
    }
    
    setFilteredLogs(filtered);
  }, [
    logs, 
    searchTerm, 
    selectedMember, 
    reviewStatus, 
    hasBlockers, 
    dateFrom, 
    dateTo
  ]);

  // Get team member by ID
  const getMemberById = (userId: string): UserType | undefined => {
    return teamMembers.find(member => member.id === userId);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedMember('');
    setReviewStatus('');
    setHasBlockers('');
    setDateFrom('');
    setDateTo('');
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Logs</h1>
        <p className="text-gray-600">View and review logs from your team members</p>
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
          
          <Button
            variant="outline"
            icon={<Filter size={18} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>
        
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select
                id="member"
                label="Team Member"
                options={[
                  { value: '', label: 'All Members' },
                  ...teamMembers.map(member => ({
                    value: member.id,
                    label: member.name
                  }))
                ]}
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
              />
              
              <Select
                id="reviewStatus"
                label="Review Status"
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'reviewed', label: 'Reviewed' },
                  { value: 'pending', label: 'Pending Review' }
                ]}
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
              />
              
              <Select
                id="blockers"
                label="Blockers"
                options={[
                  { value: '', label: 'All' },
                  { value: 'true', label: 'Has Blockers' },
                  { value: 'false', label: 'No Blockers' }
                ]}
                value={String(hasBlockers)}
                onChange={(e) => {
                  if (e.target.value === 'true') setHasBlockers(true);
                  else if (e.target.value === 'false') setHasBlockers(false);
                  else setHasBlockers('');
                }}
              />
              
              <TextField
                id="dateFrom"
                label="From Date"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              
              <TextField
                id="dateTo"
                label="To Date"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                variant="outline"
                onClick={resetFilters}
              >
                Reset Filters
              </Button>
            </div>
          </div>
        )}
      </Card>
      
      {/* Logs List */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading team logs...</p>
        </div>
      ) : filteredLogs.length > 0 ? (
        <div className="space-y-4">
          {filteredLogs.map(log => {
            const member = getMemberById(log.userId);
            
            return (
              <Link to={`/team/logs/${log.id}`} key={log.id}>
                <Card className="hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-start">
                    <Avatar 
                      src={member?.avatar}
                      name={member?.name}
                      size="md"
                      className="hidden sm:block mr-4"
                    />
                    
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                        <div className="font-medium text-gray-900 flex items-center">
                          <User size={16} className="mr-1 sm:hidden" />
                          {member?.name}
                        </div>
                        
                        <div className="text-sm text-gray-500 flex items-center">
                          <Calendar size={16} className="mr-1" />
                          {formatDate(log.date)}
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-1 sm:mt-0 sm:ml-auto">
                          {isToday(log.date) && (
                            <Badge text="Today" color="primary" />
                          )}
                          
                          {log.isReviewed ? (
                            <Badge text="Reviewed" color="success" />
                          ) : (
                            <Badge text="Pending Review" color="warning" />
                          )}
                          
                          {log.blockers && (
                            <Badge text="Blocker" color="danger" />
                          )}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mt-2 line-clamp-2">{log.summary}</p>
                      
                      <div className="mt-3 flex flex-wrap items-center gap-4">
                        <span className="text-sm text-gray-500 flex items-center">
                          <CheckCircle size={16} className="mr-1 text-green-600" />
                          {log.tasks.filter(t => t.completed).length}/{log.tasks.length} tasks
                        </span>
                        
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock size={16} className="mr-1 text-blue-600" />
                          {Math.round(log.tasks.reduce((sum, t) => sum + t.timeSpent, 0) / 60 * 10) / 10} hours
                        </span>
                        
                        <span className="text-sm text-gray-500 flex items-center">
                          <Smile size={16} className="mr-1 text-amber-600" />
                          {moodEmojis[log.mood]}
                        </span>
                      </div>
                      
                      {log.blockers && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded text-sm text-red-700">
                          <strong>Blocker:</strong> {log.blockers.substring(0, 100)}
                          {log.blockers.length > 100 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : (
        <Card>
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center bg-gray-100 rounded-full p-3 mb-3">
              <AlertCircle size={24} className="text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No logs found</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm || showFilters ? "Try adjusting your search or filters" : "No team logs available"}
            </p>
            {(searchTerm || showFilters) && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    resetFilters();
                    setShowFilters(false);
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};

export default TeamLogList;