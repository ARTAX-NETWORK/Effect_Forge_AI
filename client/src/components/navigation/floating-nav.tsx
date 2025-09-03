import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Activity, 
  Upload, 
  Wand2, 
  Library, 
  Eye, 
  Gauge 
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: Gauge },
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/generator', label: 'Generator', icon: Wand2 },
  { path: '/library', label: 'Library', icon: Library },
  { path: '/preview', label: 'Preview', icon: Eye },
  { path: '/status', label: 'Status', icon: Activity },
];

export function FloatingNavigation() {
  const [location] = useLocation();

  return (
    <nav 
      className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 glass rounded-full px-6 py-3 flex space-x-2"
      data-testid="floating-navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.path;
        
        return (
          <Link key={item.path} href={item.path}>
            <button
              className={`nav-item px-4 py-2 rounded-full text-sm font-medium transition-all ${
                isActive 
                  ? 'active text-white' 
                  : 'text-white/70 hover:text-white'
              }`}
              data-testid={`nav-${item.label.toLowerCase()}`}
            >
              <Icon className="w-4 h-4 mr-2 inline" />
              {item.label}
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
