import { Brain, Zap } from 'lucide-react';
import { SystemStatus } from './system-status';
import { QuickActions } from './quick-actions';
import { NeuralActivity } from './neural-activity';
import { FeatureModules } from './feature-modules';
import { EffectCanvas } from './effect-canvas';
import { UploadPortal } from './upload-portal';

export function ForgeDashboard() {
  return (
    <div className="forge-dashboard relative" data-testid="forge-dashboard">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-6xl md:text-8xl font-black mb-6 gradient-text tracking-tight">
          DIGITAL FORGE
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Revolutionary AI-Powered Special Effects Generator
          <br />
          <span className="text-primary font-semibold">
            Local Intelligence • Zero Dependencies • Constitutional Perfection
          </span>
        </p>
        
        {/* AI Status Orb */}
        <div className="flex justify-center mb-8">
          <div className="ai-orb relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <Brain className="text-2xl text-primary" />
            </div>
          </div>
        </div>
        
        <p className="text-primary text-lg font-medium animate-pulse flex items-center justify-center">
          <Zap className="mr-2" />
          NEURAL CORE ONLINE • READY TO FORGE
        </p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <SystemStatus />
        <QuickActions />
        <NeuralActivity />
      </div>

      {/* Feature Modules Grid */}
      <FeatureModules />

      {/* Effect Preview Canvas */}
      <EffectCanvas />

      {/* Upload Zone Preview */}
      <UploadPortal />
    </div>
  );
}
