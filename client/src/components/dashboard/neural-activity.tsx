import { useQuery } from '@tanstack/react-query';
import { History, Brain, Zap, CheckCircle } from 'lucide-react';

export function NeuralActivity() {
  const { data: recentSessions } = useQuery({
    queryKey: ['/api/sessions/recent'],
    refetchInterval: 5000,
  });

  const activities = [
    {
      title: 'Particle Explosion Effect',
      subtitle: 'Generated • 2m ago',
      status: '✓ 60fps',
      color: 'text-primary',
      dot: 'bg-primary'
    },
    {
      title: 'Neural Network Training', 
      subtitle: 'Optimized • 5m ago',
      status: '⚡ DAAR',
      color: 'text-accent',
      dot: 'bg-accent'
    },
    {
      title: 'Batch Processing Complete',
      subtitle: '1,247 files • 8m ago',
      status: '⚡ 1.2s',
      color: 'text-yellow-400',
      dot: 'bg-yellow-400'
    }
  ];

  const learningProgress = [
    {
      name: 'Pattern Recognition',
      progress: 97.3,
      color: 'text-primary'
    },
    {
      name: 'Effect Optimization',
      progress: 94.7,
      color: 'text-accent'
    },
    {
      name: 'Code Generation',
      progress: 99.1,
      color: 'text-yellow-400'
    }
  ];

  return (
    <div className="holographic-panel rounded-2xl p-6" data-testid="neural-activity">
      <h3 className="text-xl font-bold mb-6 text-yellow-400 flex items-center">
        <History className="mr-3" />
        Neural Activity
      </h3>
      
      <div className="space-y-4 mb-6">
        {activities.map((activity, index) => (
          <div 
            key={index} 
            className="flex items-start space-x-3 p-3 glass rounded-lg"
            data-testid={`activity-${index}`}
          >
            <div className={`w-2 h-2 ${activity.dot} rounded-full mt-2`} />
            <div className="flex-1">
              <div className="text-sm font-medium">{activity.title}</div>
              <div className="text-xs text-muted-foreground">{activity.subtitle}</div>
            </div>
            <div className={`text-xs ${activity.color}`}>{activity.status}</div>
          </div>
        ))}
      </div>
      
      <div className="pt-6 border-t border-border">
        <h4 className="text-sm font-semibold mb-3 text-accent flex items-center">
          <Brain className="mr-2 w-4 h-4" />
          AI Learning Progress
        </h4>
        <div className="space-y-3">
          {learningProgress.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between text-xs mb-1">
                <span>{item.name}</span>
                <span className={item.color}>{item.progress}%</span>
              </div>
              <div className="perf-bar">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-sm transition-all duration-1000"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
