import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Download, 
  Calendar,
  Users,
  Clock,
  CheckCircle
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { getTeamMembers, getDailyLogs } from '../../utils/api';
import { formatDate, getCurrentWeekRange } from '../../utils/dateUtils';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { DailyLog, User } from '../../types';

const Reports: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'custom'>('week');
  const [isLoading, setIsLoading] = useState(true);
  
  const { user } = useAuth();
  const teamId = user?.teamId || '';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get team members
        const members = await getTeamMembers(teamId);
        setTeamMembers(members.filter(m => m.role === 'developer'));
        
        // Get logs
        const allLogs = await getDailyLogs();
        setLogs(allLogs);
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

  const generateReport = () => {
    // Filter logs based on selection
    const filteredLogs = logs.filter(log => {
      if (selectedMember !== 'all' && log.userId !== selectedMember) {
        return false;
      }
      
      // Add date range filtering
      const { start, end } = getCurrentWeekRange();
      return log.date >= start && log.date <= end;
    });

    // Calculate statistics
    const stats = {
      totalTasks: filteredLogs.reduce((sum, log) => sum + log.tasks.length, 0),
      completedTasks: filteredLogs.reduce((sum, log) => 
        sum + log.tasks.filter(t => t.completed).length, 0
      ),
      totalTime: filteredLogs.reduce((sum, log) => 
        sum + log.tasks.reduce((t, task) => t + task.timeSpent, 0), 0
      ),
      averageMood: filteredLogs.length ? 
        filteredLogs.reduce((sum, log) => {
          const moodValues = { great: 5, good: 4, neutral: 3, bad: 2, terrible: 1 };
          return sum + moodValues[log.mood];
        }, 0) / filteredLogs.length : 0
    };

    // In a real app, we would generate proper PDF/CSV
    const data = {
      dateRange: { start: getCurrentWeekRange().start, end: getCurrentWeekRange().end },
      developer: selectedMember === 'all' ? 'All Team Members' : 
        teamMembers.find(m => m.id === selectedMember)?.name,
      statistics: stats,
      logs: filteredLogs
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-report-${getCurrentWeekRange().start}`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Team Reports</h1>
        <p className="text-gray-600">Generate and export team productivity reports</p>
      </header>

      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            id="member"
            label="Team Member"
            options={[
              { value: 'all', label: 'All Team Members' },
              ...teamMembers.map(member => ({
                value: member.id,
                label: member.name
              }))
            ]}
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
          />
          
          <Select
            id="dateRange"
            label="Date Range"
            options={[
              { value: 'week', label: 'This Week' },
              { value: 'month', label: 'This Month' },
              { value: 'custom', label: 'Custom Range' }
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
          />
          
          <div className="flex items-end">
            <Button
              variant="primary"
              icon={<Download size={18} />}
              onClick={generateReport}
            >
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="flex items-center">
            <div className="mr-4 bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Active Developers</div>
              <div className="text-2xl font-bold">{teamMembers.length}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="mr-4 bg-green-100 p-3 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Tasks Completed</div>
              <div className="text-2xl font-bold">
                {logs.reduce((sum, log) => 
                  sum + log.tasks.filter(t => t.completed).length, 0
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="mr-4 bg-purple-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Total Hours</div>
              <div className="text-2xl font-bold">
                {Math.round(logs.reduce((sum, log) => 
                  sum + log.tasks.reduce((t, task) => t + task.timeSpent, 0), 0
                ) / 60)}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="mr-4 bg-amber-100 p-3 rounded-full">
              <BarChart className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <div className="text-sm text-gray-500">Avg Tasks/Day</div>
              <div className="text-2xl font-bold">
                {Math.round(logs.reduce((sum, log) => 
                  sum + log.tasks.length, 0
                ) / (new Set(logs.map(log => log.date)).size) * 10) / 10}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Placeholder for future charts and detailed analytics */}
      <Card>
        <div className="text-center py-8">
          <BarChart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">
            Enhanced Analytics Coming Soon
          </h3>
          <p className="text-gray-500 mt-2">
            Detailed charts and insights will be available in the next update.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Reports;