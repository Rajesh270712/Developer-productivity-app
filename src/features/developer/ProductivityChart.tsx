import React, { useState, useEffect } from 'react';
import { Calendar, BarChart, Clock, Smile } from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { getProductivityData } from '../../utils/api';
import { formatDate, getCurrentWeekRange, getCurrentMonthRange, getLastNDays } from '../../utils/dateUtils';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Select from '../../components/Select';
import { MoodType } from '../../types';

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
  great: '#22c55e',  // green-500
  good: '#3b82f6',   // blue-500
  neutral: '#9ca3af', // gray-400
  bad: '#f97316',    // orange-500
  terrible: '#ef4444' // red-500
};

interface ProductivityDataPoint {
  date: string;
  tasksCompleted: number;
  totalTimeSpent: number;
  mood: MoodType;
}

const ProductivityChart: React.FC = () => {
  const [productivityData, setProductivityData] = useState<ProductivityDataPoint[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'custom'>('week');
  const [customDays, setCustomDays] = useState(14);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState<'tasks' | 'time' | 'mood'>('tasks');
  
  const { user } = useAuth();
  const userId = user?.id || '';

  // Load productivity data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        let startDate: string;
        let endDate: string;
        
        // Determine date range
        if (timeRange === 'week') {
          const { start, end } = getCurrentWeekRange();
          startDate = start;
          endDate = end;
        } else if (timeRange === 'month') {
          const { start, end } = getCurrentMonthRange();
          startDate = start;
          endDate = end;
        } else {
          // Custom range (last N days)
          const dates = getLastNDays(customDays);
          startDate = dates[0];
          endDate = dates[dates.length - 1];
        }
        
        // Fetch data
        const data = await getProductivityData(userId, startDate, endDate);
        setProductivityData(data);
      } catch (error) {
        console.error('Error fetching productivity data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchData();
    }
  }, [userId, timeRange, customDays]);

  // Calculate chart dimensions
  const chartHeight = 200;
  const barWidth = 28;
  const barGap = 12;
  const chartWidth = productivityData.length * (barWidth + barGap);

  // Calculate max values for scaling
  const maxTasks = Math.max(...productivityData.map(d => d.tasksCompleted), 1);
  const maxTime = Math.max(...productivityData.map(d => d.totalTimeSpent), 60); // min 1 hour

  // Render bar chart
  const renderChart = () => {
    if (productivityData.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">No data available for the selected period.</p>
        </div>
      );
    }

    return (
      <div className="mt-6 overflow-x-auto">
        <div style={{ width: `${Math.max(chartWidth, 300)}px`, height: `${chartHeight + 80}px` }}>
          {/* Y-axis labels */}
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <div>0</div>
            {chartType === 'tasks' && (
              <>
                <div>{Math.round(maxTasks / 2)}</div>
                <div>{maxTasks}</div>
              </>
            )}
            {chartType === 'time' && (
              <>
                <div>{Math.round(maxTime / 120)} hrs</div>
                <div>{Math.round(maxTime / 60)} hrs</div>
              </>
            )}
            {chartType === 'mood' && (
              <>
                <div>😫</div>
                <div>😄</div>
              </>
            )}
          </div>
          
          {/* Chart area */}
          <div 
            className="relative" 
            style={{ height: `${chartHeight}px`, borderBottom: '1px solid #e5e7eb' }}
          >
            {/* Horizontal grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="border-t border-gray-100 w-full" />
              ))}
            </div>
            
            {/* Bars */}
            <div className="absolute inset-0 flex items-end">
              {productivityData.map((day, index) => {
                let barHeight = 0;
                let barColor = '';
                let tooltip = '';
                
                if (chartType === 'tasks') {
                  barHeight = (day.tasksCompleted / maxTasks) * chartHeight;
                  barColor = '#3b82f6'; // blue-500
                  tooltip = `${day.tasksCompleted} tasks`;
                } else if (chartType === 'time') {
                  barHeight = (day.totalTimeSpent / maxTime) * chartHeight;
                  barColor = '#8b5cf6'; // purple-500
                  const hours = Math.floor(day.totalTimeSpent / 60);
                  const minutes = day.totalTimeSpent % 60;
                  tooltip = `${hours}h ${minutes}m`;
                } else if (chartType === 'mood') {
                  // Map mood to a numeric value (0-4)
                  const moodValues: Record<MoodType, number> = {
                    terrible: 0,
                    bad: 1,
                    neutral: 2,
                    good: 3,
                    great: 4
                  };
                  
                  barHeight = (moodValues[day.mood] / 4) * chartHeight;
                  barColor = moodColors[day.mood];
                  tooltip = `Mood: ${day.mood}`;
                }
                
                return (
                  <div 
                    key={index} 
                    className="group relative flex flex-col items-center"
                    style={{ 
                      width: barWidth, 
                      marginLeft: index > 0 ? barGap : 0 
                    }}
                  >
                    <div 
                      className="w-full rounded-t-sm transition-all group-hover:opacity-80"
                      style={{ 
                        height: `${Math.max(barHeight, 2)}px`, 
                        backgroundColor: barColor 
                      }}
                    ></div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs rounded px-2 py-1 pointer-events-none whitespace-nowrap">
                      {formatDate(day.date)}: {tooltip}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* X-axis labels */}
          <div className="flex mt-2" style={{ marginLeft: barWidth / 2 }}>
            {productivityData.map((day, index) => (
              <div 
                key={index} 
                className="text-xs text-gray-500 transform -rotate-45 origin-top-left"
                style={{ 
                  width: barWidth, 
                  marginLeft: index > 0 ? barGap : 0,
                  height: '60px' // Ensure enough space for rotated text
                }}
              >
                {formatDate(day.date).split(' ')[0]} {/* Just show the date part */}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productivity Insights</h1>
        <p className="text-gray-600">Track your performance and work patterns</p>
      </header>
      
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-800">Performance Chart</h2>
          
          <div className="mt-3 sm:mt-0 flex flex-wrap gap-3">
            <div className="flex gap-2">
              <Button
                variant={chartType === 'tasks' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setChartType('tasks')}
                icon={<BarChart size={16} />}
              >
                Tasks
              </Button>
              <Button
                variant={chartType === 'time' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setChartType('time')}
                icon={<Clock size={16} />}
              >
                Time
              </Button>
              <Button
                variant={chartType === 'mood' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setChartType('mood')}
                icon={<Smile size={16} />}
              >
                Mood
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={timeRange === 'week' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('week')}
              >
                Week
              </Button>
              <Button
                variant={timeRange === 'month' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('month')}
              >
                Month
              </Button>
              <Button
                variant={timeRange === 'custom' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => setTimeRange('custom')}
              >
                Custom
              </Button>
            </div>
            
            {timeRange === 'custom' && (
              <Select
                id="customDays"
                options={[
                  { value: '7', label: 'Last 7 days' },
                  { value: '14', label: 'Last 14 days' },
                  { value: '30', label: 'Last 30 days' },
                  { value: '60', label: 'Last 60 days' },
                  { value: '90', label: 'Last 90 days' },
                ]}
                value={customDays.toString()}
                onChange={(e) => setCustomDays(parseInt(e.target.value))}
                className="w-40"
              />
            )}
          </div>
        </div>
        
        {isLoading ? (
          <div className="text-center py-10">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading productivity data...</p>
          </div>
        ) : (
          <>
            {renderChart()}
            
            {/* Legend */}
            <div className="mt-8 flex flex-wrap gap-4">
              {chartType === 'tasks' && (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Tasks Completed</span>
                </div>
              )}
              
              {chartType === 'time' && (
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm text-gray-600">Time Spent (hours)</span>
                </div>
              )}
              
              {chartType === 'mood' && (
                <>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moodColors.great }} className="mr-2"></div>
                    <span className="text-sm text-gray-600">Great {moodEmojis.great}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moodColors.good }} className="mr-2"></div>
                    <span className="text-sm text-gray-600">Good {moodEmojis.good}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moodColors.neutral }} className="mr-2"></div>
                    <span className="text-sm text-gray-600">Neutral {moodEmojis.neutral}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moodColors.bad }} className="mr-2"></div>
                    <span className="text-sm text-gray-600">Bad {moodEmojis.bad}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: moodColors.terrible }} className="mr-2"></div>
                    <span className="text-sm text-gray-600">Terrible {moodEmojis.terrible}</span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Card>
      
      {/* Heat Map */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Productivity Heatmap</h2>
        
        <div className="p-4 border border-gray-200 rounded-md bg-gray-50 text-center">
          <Calendar size={24} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">
            Heatmap visualization is available in the full version.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ProductivityChart;