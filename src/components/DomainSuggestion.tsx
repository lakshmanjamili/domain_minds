import React from 'react';
import { Button } from './ui/button';
import { DOMAIN_VENDOR_URL } from '@/lib/config';

type Props = {
  domain: string;
  explanation: string;
  available?: boolean;
};

export const DomainSuggestion: React.FC<Props> = ({ domain, explanation, available }) => (
  <div className="p-4 border rounded-xl flex flex-col gap-2 bg-white/80 dark:bg-gray-900/80 shadow-md hover:shadow-xl transition-shadow">
    <div className="flex items-center gap-2">
      <span className="font-semibold text-lg tracking-tight">{domain}</span>
      {available !== undefined && (
        <span className={`text-xs px-2 py-1 rounded ${available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{available ? 'Available' : 'Taken'}</span>
      )}
      {available && (
        <Button
          size="sm"
          className="ml-auto bg-gradient-to-br from-green-500 to-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow hover:scale-105"
          asChild
        >
          <a href={DOMAIN_VENDOR_URL(domain)} target="_blank" rel="noopener noreferrer">
            Buy
          </a>
        </Button>
      )}
    </div>
    <span className="text-gray-600 dark:text-gray-300 text-sm">{explanation}</span>
  </div>
); 