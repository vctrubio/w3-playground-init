import {helloEthers} from '@/lib/ethera';
import { useState } from 'react';

interface ButtonConfig {
    label: string;
    action: () => void;
}

export default function Contract(): JSX.Element {
    const [result, setResult] = useState<string>('');

    const buttons: ButtonConfig[] = [
        {
            label: "Tester",
            action: async () => {
                try {
                    const response = await helloEthers();
                    setResult(`${response}`);
                } catch (error) {
                    setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        },
        { label: "Test1", action: () => setResult("Test1 button clicked!") },
        { label: "Test2", action: () => setResult("Test2 button clicked!") },
        { label: "Test3", action: () => setResult("Test3 button clicked!") },
        { label: "Test4", action: () => setResult("Test4 button clicked!") }
    ];

    return (
        <div className="p-4 space-y-4">
            <div className="text-xl font-bold">Contracts</div>
            <div className="mb-4">Contract Information</div>
            
            <div className="flex flex-wrap gap-2">
                {buttons.map((btn, index) => (
                    <button
                        key={index}
                        onClick={btn.action}
                        className="dark:bg-blue-500 bg-orange-500 dark:hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {result && (
                <div className="mt-4 p-3 rounded border">
                    <pre>{result}</pre>
                </div>
            )}
        </div>
    );
}