import React from 'react';

export interface BoxProps {
  id: string;
  label: string;
  path: string;
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
  path,
  ...componentProps // All other props are forwarded to the component
}: BoxProps): JSX.Element {
  const darkBg = theme?.dark || 'bg-gray-800';
  const lightBg = theme?.light || 'bg-gray-100';
  
  return (
    <div className="relative border p-4 rounded m-8 min-h-20">
      <div className={`absolute left-2 top-0 -mt-5 z-10 p-2 border rounded cursor-pointer ${lightBg} dark:${darkBg} dark:text-blue-500 text-orange-500`}>
        {label}
      </div>
      <div className="pt-4">
        <Component {...componentProps} />
      </div>
    </div>
  );
}

export interface BoxContainerProps {
  modules: BoxProps[];
}

export function BoxContainer({ modules }: BoxContainerProps): JSX.Element {
  return (
    <div >
      {modules.map((module) => (
        <Box key={module.id} {...module} />
      ))}
    </div>
  );
}
