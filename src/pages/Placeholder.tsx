import React from 'react';
import { useLocation } from 'react-router-dom';
import { Construction } from 'lucide-react';
import { Card } from '@/components/ui';

const Placeholder: React.FC = () => {
  const location = useLocation();
  const pageName = location.pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '))
    .join(' > ');

  return (
    <Card className="max-w-2xl mx-auto text-center" padding="lg">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
          <Construction className="w-10 h-10 text-blue-600" />
        </div>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageName}</h1>
      <p className="text-gray-500 mb-6">
        This page is under construction. The design will be implemented based on the provided HTML/CSS.
      </p>
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Current Path:</span>{' '}
          <code className="bg-gray-200 px-2 py-0.5 rounded">{location.pathname}</code>
        </p>
      </div>
    </Card>
  );
};

export default Placeholder;

