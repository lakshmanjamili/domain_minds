'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import type { DomainWithStatus } from '@/types/index';

interface DomainCardProps {
  domain: DomainWithStatus;
  index: number;
}

export function DomainCard({ domain, index }: DomainCardProps) {
  const getStatusIcon = () => {
    switch (domain.status) {
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'taken':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (domain.status) {
      case 'available':
        return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
      case 'taken':
        return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
      case 'checking':
        return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'border-l-gray-500 bg-gray-50 dark:bg-gray-950/20';
    }
  };

  const getStatusText = () => {
    switch (domain.status) {
      case 'available':
        return 'Available';
      case 'taken':
        return 'Taken';
      case 'checking':
        return 'Checking...';
      default:
        return 'Unknown';
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'brandable':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'descriptive':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'keyword-rich':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'creative':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handlePurchaseClick = () => {
    if (domain.registerURL) {
      // Track purchase click event
      console.log('🛒 Purchase click tracked:', domain.domain);
      window.open(domain.registerURL, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card 
      className={`
        border-l-4 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] 
        ${getStatusColor()}
        animate-fade-in-up
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {domain.domain}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={getCategoryColor(domain.category)}>
                  {domain.category || 'suggested'}
                </Badge>
                {domain.relevanceScore && domain.relevanceScore >= 8 && (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    <Star className="w-3 h-3 mr-1" />
                    Top Pick
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Badge 
                variant={domain.status === 'available' ? 'default' : 'secondary'}
                className={
                  domain.status === 'available' 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : domain.status === 'taken' 
                    ? 'bg-red-500 text-white' 
                    : 'bg-gray-500 text-white'
                }
              >
                {getStatusText()}
              </Badge>
            </div>
            {domain.price && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                {domain.price}/year
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Marketing Explanation */}
        <p className="text-gray-700 dark:text-gray-300 mb-3 font-medium">
          {domain.explanation}
        </p>

        {/* Detailed Reasoning */}
        {domain.reasoning && (
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Why this domain works:
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {domain.reasoning}
            </p>
          </div>
        )}

        {/* Relevance Score */}
        {domain.relevanceScore && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              Relevance Score:
            </span>
            <div className="flex items-center gap-1">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < domain.relevanceScore! 
                      ? 'bg-blue-500' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
              <span className="text-sm font-bold text-blue-600 dark:text-blue-400 ml-2">
                {domain.relevanceScore}/10
              </span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {domain.status === 'available' && domain.registerURL && (
            <Button 
              onClick={handlePurchaseClick}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Buy Now on GoDaddy
            </Button>
          )}
          
          {domain.status === 'taken' && (
            <Button 
              variant="outline" 
              disabled 
              className="flex-1 cursor-not-allowed opacity-50"
              size="sm"
            >
              Domain Taken
            </Button>
          )}
          
          {domain.status === 'unknown' && domain.registerURL && (
            <Button 
              onClick={handlePurchaseClick}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Check on GoDaddy
            </Button>
          )}

          {/* Copy Domain Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(domain.domain)}
            className="px-3"
            title="Copy domain name"
          >
            📋
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 