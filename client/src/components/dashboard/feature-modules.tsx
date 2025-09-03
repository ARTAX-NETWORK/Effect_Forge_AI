import { Link } from 'wouter';
import { 
  Wand2, 
  Database, 
  Upload, 
  Eye,
  Sparkles,
  Activity
} from 'lucide-react';

const modules = [
  {
    title: 'Effect Generator',
    description: 'AI-powered effect creation with constitutional compliance',
    icon: Wand2,
    gradient: 'plasma-gradient',
    status: 'DAAR Engine Active',
    statusColor: 'text-primary',
    href: '/generator'
  },
  {
    title: 'Smart Library',
    description: 'Intelligent effect library with neural search',
    icon: Database,
    gradient: 'neural-gradient',
    status: '12,847 Effects',
    statusColor: 'text-accent',
    href: '/library'
  },
  {
    title: 'Dimensional Portal',
    description: 'Universal file parser and analyzer',
    icon: Upload,
    gradient: 'forge-gradient',
    status: '9 Formats Supported',
    statusColor: 'text-yellow-400',
    href: '/upload'
  },
  {
    title: 'Live Preview',
    description: 'Real-time effect rendering and validation',
    icon: Eye,
    gradient: 'bg-gradient-to-br from-green-500 to-blue-600',
    status: '60fps Guaranteed',
    statusColor: 'text-green-400',
    href: '/preview'
  }
];

export function FeatureModules() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12" data-testid="feature-modules">
      {modules.map((module) => {
        const Icon = module.icon;
        
        return (
          <Link key={module.title} href={module.href}>
            <div className="holographic-panel rounded-xl p-6 hover:scale-105 transition-transform cursor-pointer group">
              <div className="text-center">
                <div className={`w-16 h-16 ${module.gradient} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="text-2xl text-white" size={24} />
                </div>
                <h3 className="text-lg font-bold mb-2">{module.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                <div className={`text-xs ${module.statusColor} font-medium`}>
                  {module.status}
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
