import React, { useState } from 'react';

export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface DropdownListProps {
  title: string;
  items: ListItem[];
  onItemToggle?: (id: string, completed: boolean) => void;
  defaultOpen?: boolean;
  className?: string;
}

export const DropdownList: React.FC<DropdownListProps> = ({
  title,
  items,
  onItemToggle,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);

  const handleToggle = (id: string, completed: boolean) => {
    if (onItemToggle) {
      onItemToggle(id, completed);
    }
  };

  return (
    <div className={`mt-2 ${className}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center w-full text-left text-gray-700 dark:text-gray-300 mb-2 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded"
        aria-expanded={isOpen}
      >
        <span className="mr-1">{isOpen ? '▼' : '▶'}</span>
        <span>{title}</span>
      </button>
      
      {isOpen && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded border dark:border-gray-700">
          {items.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1">
              {items.map((item) => (
                <li key={item.id} className="text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-start">
                    <input 
                      type="checkbox" 
                      checked={item.completed}
                      onChange={(e) => handleToggle(item.id, e.target.checked)}
                      className="mt-1 mr-2" 
                      id={`item-${item.id}`}
                    />
                    <label 
                      htmlFor={`item-${item.id}`}
                      className={`cursor-pointer ${item.completed ? 'line-through text-gray-500 dark:text-gray-500' : ''}`}
                    >
                      {item.text}
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">No items to display</p>
          )}
        </div>
      )}
    </div>
  );
};
