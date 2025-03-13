// Define an interface for the item structure
interface Item {
  label: string;
  path: string;
}

const items: Item[] = [
  { label: 'Account', path: '/' },
  { label: 'Contracts', path: '/' },
]

interface BoxifyProps {
  items: Item[];
}

function Boxify({ items }: BoxifyProps): JSX.Element {

  const Card = (i: Item) => {
    return (
      <div className="relative border p-4 rounded bg-gray-100 dark:bg-gray-800 m-8 min-h-20">
        <div className="absolute left-2 top-0 -mt-5 z-10 bg-gray-200 dark:bg-gray-900 p-2 border rounded cursor-pointer">{i.label}</div>
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
