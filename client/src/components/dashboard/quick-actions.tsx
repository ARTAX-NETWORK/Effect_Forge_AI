import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Wand2, 
  Upload, 
  Code, 
  Shield 
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

const constitutionArticles = [
  'Performance Absolue',
  'Intelligence Adaptative', 
  'Polyvalence Universelle',
  'Expérience Parfaite',
  'Impact Visuel',
  'Écosystème Addictif',
  'Domination Concurrentielle'
];

export function QuickActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const quickGenerateMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await apiRequest('POST', '/api/effects/generate', {
        prompt,
        type: 'javascript',
        enableConstitution: true
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Effect Generation Started',
        description: `Session ID: ${data.sessionId}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/sessions'] });
    },
    onError: (error) => {
      toast({
        title: 'Generation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const actions = [
    {
      title: 'AI Text to Effect',
      description: 'Generate from description',
      icon: Wand2,
      gradient: 'plasma-gradient',
      onClick: () => {
        const prompt = window.prompt('Describe the effect you want to create:');
        if (prompt) {
          quickGenerateMutation.mutate(prompt);
        }
      }
    },
    {
      title: 'Dimensional Upload',
      description: 'Parse any file format',
      icon: Upload,
      gradient: 'neural-gradient',
      href: '/upload'
    },
    {
      title: 'Code Generator',
      description: 'JS/CSS/AE Scripts',
      icon: Code,
      gradient: 'forge-gradient',
      href: '/generator'
    }
  ];

  return (
    <div className="holographic-panel rounded-2xl p-6" data-testid="quick-actions">
      <h3 className="text-xl font-bold mb-6 text-accent flex items-center">
        <Wand2 className="mr-3" />
        Quick Forge
      </h3>
      
      <div className="space-y-4 mb-6">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 ${action.gradient} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                <Icon className="text-white" size={20} />
              </div>
              <div>
                <div className="font-semibold">{action.title}</div>
                <div className="text-sm text-muted-foreground">{action.description}</div>
              </div>
            </div>
          );

          if (action.href) {
            return (
              <Link key={action.title} href={action.href}>
                <button 
                  className="w-full glass rounded-xl p-4 text-left hover:bg-primary/10 transition-all group"
                  data-testid={`action-${action.title.toLowerCase().replace(' ', '-')}`}
                >
                  {content}
                </button>
              </Link>
            );
          }

          return (
            <button
              key={action.title}
              onClick={action.onClick}
              disabled={quickGenerateMutation.isPending}
              className="w-full glass rounded-xl p-4 text-left hover:bg-primary/10 transition-all group disabled:opacity-50"
              data-testid={`action-${action.title.toLowerCase().replace(' ', '-')}`}
            >
              {content}
            </button>
          );
        })}
      </div>
      
      <div className="pt-6 border-t border-border">
        <h4 className="text-sm font-semibold mb-3 text-primary flex items-center">
          <Shield className="mr-2 w-4 h-4" />
          Constitutional Status
        </h4>
        <div className="space-y-2 text-xs">
          {constitutionArticles.map((article) => (
            <div key={article} className="flex items-center justify-between">
              <span>{article}</span>
              <div className="w-3 h-3 bg-green-400 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
