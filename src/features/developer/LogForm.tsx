import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Plus, 
  Trash, 
  Save, 
  Clock, 
  Tag, 
  AlertTriangle, 
  CheckCircle2
} from 'lucide-react';

import { useAuth } from '../../auth/AuthContext';
import { createDailyLog, getDailyLog, updateDailyLog } from '../../utils/api';
import Button from '../../components/Button';
import TextField from '../../components/TextField';
import TextArea from '../../components/TextArea';
import Card from '../../components/Card';
import { Task, MoodType } from '../../types';
import Select from '../../components/Select';

const LogForm: React.FC = () => {
  const { logId } = useParams<{ logId: string }>();
  const isEditing = Boolean(logId);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<Omit<Task, 'id'>[]>([
    { description: '', timeSpent: 30, tags: [], completed: false }
  ]);
  const [mood, setMood] = useState<MoodType>('good');
  const [blockers, setBlockers] = useState('');
  const [summary, setSummary] = useState('');
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Load existing log if editing
  useEffect(() => {
    const fetchLog = async () => {
      if (!logId) return;
      
      try {
        setIsLoading(true);
        const log = await getDailyLog(logId);
        
        if (!log) {
          setError('Log not found');
          return;
        }
        
        setDate(log.date);
        setTasks(log.tasks);
        setMood(log.mood);
        setBlockers(log.blockers || '');
        setSummary(log.summary);
      } catch (err) {
        console.error('Error fetching log:', err);
        setError('Failed to load log');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLog();
  }, [logId]);

  // Task handlers
  const handleAddTask = () => {
    setTasks([
      ...tasks,
      { description: '', timeSpent: 30, tags: [], completed: false }
    ]);
  };

  const handleRemoveTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index: number, field: keyof Omit<Task, 'id'>, value: any) => {
    const updatedTasks = [...tasks];
    
    if (field === 'tags' && typeof value === 'string') {
      updatedTasks[index][field] = value.split(',').map(tag => tag.trim());
    } else {
      updatedTasks[index][field] = value;
    }
    
    setTasks(updatedTasks);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in');
      return;
    }
    
    // Validate form
    if (tasks.some(task => !task.description.trim())) {
      setError('All tasks must have a description');
      return;
    }
    
    if (!summary.trim()) {
      setError('Please provide a summary for your day');
      return;
    }
    
    try {
      setIsSaving(true);
      setError('');
      
      const logData = {
        userId: user.id,
        date,
        tasks,
        mood,
        blockers: blockers.trim() || undefined,
        summary,
      };
      
      if (isEditing && logId) {
        await updateDailyLog(logId, logData);
      } else {
        await createDailyLog(logData);
      }
      
      // Redirect to logs list after successful submission
      navigate('/logs');
    } catch (err) {
      console.error('Error saving log:', err);
      setError('Failed to save log');
    } finally {
      setIsSaving(false);
    }
  };

  // Mood options
  const moodOptions = [
    { value: 'great', label: '😄 Great' },
    { value: 'good', label: '🙂 Good' },
    { value: 'neutral', label: '😐 Neutral' },
    { value: 'bad', label: '🙁 Bad' },
    { value: 'terrible', label: '😫 Terrible' }
  ];

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-blue-600 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">Loading log...</p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Daily Log' : 'New Daily Log'}
        </h1>
        <p className="text-gray-600">
          {isEditing 
            ? 'Update the details of your daily work log'
            : 'Record your tasks, time spent, and reflections'
          }
        </p>
      </header>
      
      {error && (
        <div className="mb-6 p-4 rounded-md bg-red-50 border border-red-200">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TextField
              id="date"
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            
            <Select
              id="mood"
              label="How was your day?"
              options={moodOptions}
              value={mood}
              onChange={(e) => setMood(e.target.value as MoodType)}
              required
            />
          </div>
        </Card>
        
        {/* Tasks */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tasks</h2>
          
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-700">Task {index + 1}</h3>
                  {tasks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  <TextField
                    id={`task-${index}-description`}
                    label="Description"
                    value={task.description}
                    onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                    placeholder="What did you work on?"
                    required
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                      id={`task-${index}-time`}
                      label="Time Spent (minutes)"
                      type="number"
                      value={task.timeSpent}
                      onChange={(e) => handleTaskChange(index, 'timeSpent', parseInt(e.target.value))}
                      min={1}
                      required
                      icon={<Clock size={18} />}
                    />
                    
                    <TextField
                      id={`task-${index}-tags`}
                      label="Tags (comma-separated)"
                      value={task.tags.join(', ')}
                      onChange={(e) => handleTaskChange(index, 'tags', e.target.value)}
                      placeholder="frontend, bugfix, etc."
                      icon={<Tag size={18} />}
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id={`task-${index}-completed`}
                      type="checkbox"
                      checked={task.completed}
                      onChange={(e) => handleTaskChange(index, 'completed', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`task-${index}-completed`} className="ml-2 text-sm text-gray-700">
                      Completed
                    </label>
                  </div>
                </div>
              </div>
            ))}
            
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTask}
                icon={<Plus size={18} />}
              >
                Add Another Task
              </Button>
            </div>
          </div>
        </Card>
        
        {/* Summary & Blockers */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Reflections</h2>
          
          <div className="space-y-6">
            <TextArea
              id="summary"
              label="Daily Summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Summarize your day, achievements, or any highlights..."
              rows={4}
              required
              maxLength={500}
            />
            
            <TextArea
              id="blockers"
              label="Blockers (Optional)"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              placeholder="Anything blocking your progress? Let your manager know..."
              rows={3}
              maxLength={300}
            />
          </div>
        </Card>
        
        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/logs')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            variant="primary"
            icon={isSaving ? undefined : <Save size={18} />}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : isEditing ? 'Update Log' : 'Save Log'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LogForm;