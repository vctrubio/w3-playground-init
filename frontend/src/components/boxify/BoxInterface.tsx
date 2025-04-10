import React, { useState } from 'react';
export interface BoxProps {
  id: string;
  label: string;
  component: React.ComponentType<any>;
  theme?: {
    dark: string;
    light: string;
  };
  [key: string]: any;
}

export function Box({
  label,
  component: Component,
  theme,
  id,
  ...componentProps
}: BoxProps): JSX.Element {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const darkBg = theme?.dark || 'bg-gray-800';
  const lightBg = theme?.light || 'bg-gray-100';

  const toggleVisibility = () => {
    setIsVisible(prev => !prev);
  };

  return (
    <div className="relative border p-4 rounded m-8 min-h-20">
      <div
        className={`absolute left-2 top-0 -mt-5 z-10 p-2 border rounded cursor-pointer ${lightBg} dark:${darkBg} dark:text-blue-500 text-orange-500`}
        onClick={toggleVisibility}
      >
        {label} {isVisible ? '[X]' : '▶'}
      </div>
      <div
        className={`pt-4 transition-all duration-300 ease-in-out ${isVisible
          ? 'opacity-100 max-h-screen'
          : 'opacity-0 max-h-0 overflow-hidden'
          }`}
      >
        <div className="mt-6 overflow-y-auto max-h-[1000px]">
          <Component {...componentProps} />
        </div>
      </div>
    </div>
  );
}

export function BoxContainer({ modules }: { modules: BoxProps[] }): JSX.Element {
  return (
    <div className=''>
      {modules.map((module) => (
        <Box key={module.id} {...module} />
      ))}
    </div>
  );
}
