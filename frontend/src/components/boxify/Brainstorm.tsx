import { useState, useEffect } from 'react';

interface BrainstormItem {
  task: string;
  framework: string | null;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

export interface BrainstormProps {
  onTaskChange?: (tasks: BrainstormItem[]) => void;
}

// LocalStorage key for saving tasks
const STORAGE_KEY = 'web3_development_tasks';

// Default tasks to use when resetting
const DEFAULT_TASKS: BrainstormItem[] = [
  { task: 'Connect wallet', framework: 'ethers.js', status: 'pending', priority: 'high' },
  { task: 'Import contracts', framework: 'Hardhat', status: 'pending', priority: 'high' },
  { task: 'Interact with contracts', framework: 'ethers.js', status: 'pending', priority: 'medium' },
  { task: 'View transaction history', framework: null, status: 'pending', priority: 'low' },
  { task: 'Gas optimization', framework: 'Hardhat Gas Reporter', status: 'pending', priority: 'medium' }
];

export default function Brainstorm({ onTaskChange }: BrainstormProps): JSX.Element {
  // Initialize with default tasks or tasks from localStorage if available
  const [items, setItems] = useState<BrainstormItem[]>(() => {
    // Try to get tasks from localStorage
    if (typeof window !== 'undefined') {
      const savedTasks = localStorage.getItem(STORAGE_KEY);
      if (savedTasks) {
        try {
          return JSON.parse(savedTasks);
        } catch (e) {
          console.error('Failed to parse tasks from localStorage', e);
        }
      }
    }
    
    // Default tasks if none in localStorage
    return [...DEFAULT_TASKS];
  });

  const [newTask, setNewTask] = useState<string>('');
  const [newFramework, setNewFramework] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<'reset' | 'clear' | null>(null);

  // Save to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      
      // Also notify parent component if callback provided
      if (onTaskChange) {
        onTaskChange(items);
      }
    }
  }, [items, onTaskChange]);

  const updateStatus = (index: number, status: 'pending' | 'in-progress' | 'completed') => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], status };
    setItems(updatedItems);
  };

  const updatePriority = (index: number, priority: 'low' | 'medium' | 'high') => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], priority };
    setItems(updatedItems);
  };

  const addTask = () => {
    if (!newTask.trim()) return;
    
    const updatedItems = [
      ...items,
      {
        task: newTask,
        framework: newFramework || null,
        status: 'pending',
        priority: 'medium'
      }
    ];
    
    setItems(updatedItems);
    setNewTask('');
    setNewFramework('');
  };

  const removeTask = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  // Reset to default tasks
  const resetTasks = () => {
    setItems([...DEFAULT_TASKS]);
    setShowConfirmation(false);
  };

  // Clear all tasks
  const clearTasks = () => {
    setItems([]);
    setShowConfirmation(false);
  };

  // Show confirmation dialog
  const confirmReset = () => {
    setConfirmAction('reset');
    setShowConfirmation(true);
  };

  const confirmClear = () => {
    setConfirmAction('clear');
    setShowConfirmation(true);
  };

  const cancelAction = () => {
    setShowConfirmation(false);
    setConfirmAction(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-xl font-bold">Web3 Development Plan</h2>
      
      <div className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="New task"
          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <input 
          type="text" 
          value={newFramework} 
          onChange={(e) => setNewFramework(e.target.value)} 
          placeholder="Framework (optional)"
          className="flex-1 p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <button 
          onClick={addTask} 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
        >
          Add
        </button>
      </div>

      <div className="flex justify-between mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {items.length} task{items.length !== 1 ? 's' : ''} in the list
        </div>
        <div className="flex gap-2">
          <button 
            onClick={confirmReset}
            className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 rounded text-sm"
          >
            Reset to Defaults
          </button>
          <button 
            onClick={confirmClear}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
          >
            Clear All Tasks
          </button>
        </div>
      </div>
      
      {showConfirmation && (
        <div className="mb-4 p-4 bg-gray-200 dark:bg-gray-700 rounded border border-gray-400 dark:border-gray-500">
          <p className="mb-3 font-medium">
            {confirmAction === 'reset' 
              ? 'Are you sure you want to reset to default tasks? This will remove all custom tasks.'
              : 'Are you sure you want to clear all tasks? This cannot be undone.'}
          </p>
          <div className="flex justify-end gap-2">
            <button 
              onClick={cancelAction}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
            >
              Cancel
            </button>
            <button 
              onClick={confirmAction === 'reset' ? resetTasks : clearTasks}
              className={`${confirmAction === 'reset' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'} text-white px-3 py-1 rounded`}
            >
              {confirmAction === 'reset' ? 'Reset' : 'Clear'}
            </button>
          </div>
        </div>
      )}
      
      {items.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="p-2 border-b dark:border-gray-600 text-left">Task</th>
                <th className="p-2 border-b dark:border-gray-600 text-left">Framework</th>
                <th className="p-2 border-b dark:border-gray-600 text-left">Status</th>
                <th className="p-2 border-b dark:border-gray-600 text-left">Priority</th>
                <th className="p-2 border-b dark:border-gray-600 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="p-2 border-b dark:border-gray-600">{item.task}</td>
                  <td className="p-2 border-b dark:border-gray-600">
                    {item.framework || <span className="text-gray-400 italic">None</span>}
                  </td>
                  <td className="p-2 border-b dark:border-gray-600">
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(index, e.target.value as any)}
                      className="p-1 rounded dark:bg-gray-700 dark:text-white border dark:border-gray-600"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td className="p-2 border-b dark:border-gray-600">
                    <select
                      value={item.priority}
                      onChange={(e) => updatePriority(index, e.target.value as any)}
                      className="p-1 rounded dark:bg-gray-700 dark:text-white border dark:border-gray-600"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </td>
                  <td className="p-2 border-b dark:border-gray-600">
                    <button 
                      onClick={() => removeTask(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400 border border-dashed rounded">
          No tasks available. Add a new task or reset to defaults.
        </div>
      )}
    </div>
  );
}
