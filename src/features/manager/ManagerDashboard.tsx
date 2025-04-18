import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Calendar,
  ClipboardList
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { getTeam, getTeamMembers, getDailyLogs } from '../../utils/api';
import { formatDate, isToday } from '../../utils/dateUtils';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Avatar from '../../components/Avatar';
import Badge from '../../components/Badge';
import { Team, User, DailyLog } from '../../types';

const ManagerDashboard: React.FC = () => {
  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [recentLogs, setRecentLogs] = useState<DailyLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const managerId = user?.id || '';
  const teamId = user?.teamId || '';

  // Load team data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get team details
        if (teamId) {
          const teamData = await getTeam(teamId);
          setTeam(teamData);
          
          // Get team members
          const membersData = await getTeamMembers(teamId);
          setMembers(membersData.filter(m => m.id !== managerId));
          
          // Get recent logs from team members
          const allLogs = await getDailyLogs();
          const teamLogs = allLogs.filter(log => 
            membersData.some(member => member.id === log.userId)
          );
          
          // Sort by date (newest first) and take the 5 most recent
          const sortedLogs = teamLogs.sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          ).slice(0, 5);
          
          setRecentLogs(sortedLogs);
        }
      } catch (error) {
        console.error('Error fetching team data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (managerId) {
      fetchData();
    }
  }, [managerId, teamId]);

  // Get user by ID
  const getUserById = (userId: string): User | undefined => {
    return members.find(member => member.id === userId);
  };

  // Calculate statistics
  const calculateStats = () => {
    if (recentLogs.length === 0) {
      return {
        pendingReviews: 0,
        todayLogs: 0,
        blockers: 0
      };
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    return {
      pendingReviews: recentLogs.filter(log => !log.isReviewed).length,
      todayLogs: recentLogs.filter(log => log.date === today).length,
      blockers: recentLogs.filter(log => log.blockers).length
    };
  };
  
  const stats = calculateStats();

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600">Monitor team progress and review logs</p>
      </header>
      
      {/* Team Overview Card */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Users className="mr-2 text-blue-500" size={20} />
            {team?.name || 'Your Team'}
          </h2>
          
          <Link to="/team">
            <Button variant="outline" size="sm">
              View Team Details
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-700 mb-1">Team Members</div>
            <div className="text-2xl font-bold text-blue-900">{members.length}</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-700 mb-1">Today's Logs</div>
            <div className="text-2xl font-bold text-green-900">{stats.todayLogs}</div>
          </div>
          
          <div className="bg-amber-50 p-4 rounded-lg">
            <div className="text-sm text-amber-700 mb-1">Pending Reviews</div>
            <div className="text-2xl font-bold text-amber-900">{stats.pendingReviews}</div>
          </div>
        </div>
        
        <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Team Members</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {members.map(member => (
            <div key={member.id} className="flex items-center p-3 border border-gray-200 rounded-md">
              <Avatar src={member.avatar} name={member.name} size="md" />
              <div className="ml-3">
                <div className="font-medium">{member.name}</div>
                <div className="text-sm text-gray-500">{member.email}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Recent Logs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Recent Team Logs</h2>
          <Link to="/team" className="text-sm text-blue-600 hover:text-blue-800">
            View All Logs
          </Link>
        </div>
        
        {recentLogs.length > 0 ? (
          <div className="space-y-4">
            {recentLogs.map(log => {
              const logUser = getUserById(log.userId);
              
              return (
                <Link to={`/team/logs/${log.id}`} key={log.id}>
                  <Card className="hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start">
                      <Avatar 
                        src={logUser?.avatar}
                        name={logUser?.name}
                        size="sm"
                        className="mr-3 mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {logUser?.name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {formatDate(log.date)}
                          </span>
                          {isToday(log.date) && (
                            <Badge text="Today" color="primary" size="sm" />
                          )}
                          {!log.isReviewed && (
                            <Badge text="Needs Review" color="warning" size="sm" />
                          )}
                          {log.blockers && (
                            <Badge text="Blocker" color="danger" size="sm" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {log.summary}
                        </p>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span className="text-xs text-gray-500 flex items-center">
                            <CheckCircle size={12} className="mr-1 text-green-600" />
                            {log.tasks.filter(t => t.completed).length}/{log.tasks.length} tasks
                          </span>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Clock size={12} className="mr-1 text-blue-600" />
                            {Math.round(log.tasks.reduce((sum, t) => sum + t.timeSpent, 0) / 60 * 10) / 10} hours
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <Card>
            <div className="text-center py-6">
              <div className="inline-flex items-center justify-center bg-gray-100 rounded-full p-3 mb-3">
                <FileText size={24} className="text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No logs yet</h3>
              <p className="text-gray-500 mt-1">
                Team members haven't submitted any logs recently.
              </p>
            </div>
          </Card>
        )}
      </div>
      
      {/* Blockers */}
      {stats.blockers > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertCircle className="mr-2 text-red-500" size={20} />
            Blockers Requiring Attention
          </h2>
          
          <div className="space-y-4">
            {recentLogs
              .filter(log => log.blockers)
              .map(log => {
                const logUser = getUserById(log.userId);
                
                return (
                  <Link to={`/team/logs/${log.id}`} key={log.id}>
                    <div className="p-4 border border-red-200 rounded-md bg-red-50">
                      <div className="flex items-start">
                        <Avatar 
                          src={logUser?.avatar}
                          name={logUser?.name}
                          size="sm"
                          className="mr-3 mt-1"
                        />
                        
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {logUser?.name}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {formatDate(log.date)}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-800 mt-2">
                            {log.blockers}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ManagerDashboard;