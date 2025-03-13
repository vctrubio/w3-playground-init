import Account from '../components/boxify/Account';

interface Item {
  label: string;
  path: string;
  component: React.ComponentType;
  theme?: {
    dark: string;
    light: string;
  };
}

const items: Item[] = [
  { 
    label: 'Account', 
    path: '/',
    component: Account,
    theme: {
      dark: 'bg-blue-900',
      light: 'bg-blue-200'
    }
  },
  { 
    label: 'Contracts', 
    path: '/',
    component: () => <>Contract Information</>,
    theme: {
      dark: 'bg-purple-900',
      light: 'bg-purple-200'
    }
  },
]

function Boxify({ items }: { items: Item[] }): JSX.Element {
  
  const Card = (i: Item) => {
    // Get theme colors or use default colors if theme is not defined
    const darkBg = i.theme?.dark || 'bg-gray-800';
    const lightBg = i.theme?.light || 'bg-gray-100';
    const Component = i.component;
    
    return (
      <div className={`relative border p-4 rounded m-8 min-h-20`}>
        <div className={`absolute left-2 top-0 -mt-5 z-10 p-2 border rounded cursor-pointer ${lightBg} dark:${darkBg} dark:text-blue-500 text-orange-500`}>{i.label}</div>
        <div className="pt-4">
          <Component />
        </div>
      </div>
    )
  }

  return (
    <div>
      {items.map((item, index) => (
        <div key={index}>
          <Card {...item} />
        </div>
      ))}
    </div>
  )
}

export default function Home() {
  return (
    <div className='container dark:text-white border p-4  mx-auto'>
      <Boxify items={items} />
    </div>
  );
}
