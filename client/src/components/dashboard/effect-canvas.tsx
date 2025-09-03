import { useState } from 'react';
import { Play, Pause, Square, Download, FileCode, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function EffectCanvas() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handlePlay = () => {
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
  };

  const generatedCode = `// EffectForge AI Generated Code
class ParticleExplosionEffect {
  constructor(container, options = {}) {
    this.container = container;
    this.options = { ...this.getDefaults(), ...options };
    this.setupConstitutionalCompliance();
    this.init();
  }
  
  setupConstitutionalCompliance() {
    // Article I: Performance Absolue
    this.targetFPS = 60;
    this.frameTime = 16.67;
  }
}`;

  return (
    <div className="holographic-panel rounded-2xl p-8 mb-12" data-testid="effect-canvas">
      <h3 className="text-2xl font-bold mb-6 text-primary flex items-center">
        <Activity className="mr-3" />
        Live Effect Canvas
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Canvas Area */}
        <div className="space-y-4">
          <div className="effect-canvas rounded-xl h-64 flex items-center justify-center relative">
            <div className="text-center z-10">
              <Play className="w-16 h-16 text-primary mb-4 mx-auto" />
              <p className="text-lg font-medium">Neural Effect Renderer</p>
              <p className="text-sm text-muted-foreground">Ready for next generation</p>
            </div>
            
            {/* Animated corner dots */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full animate-ping" />
            <div className="absolute top-4 right-4 w-2 h-2 bg-accent rounded-full animate-ping" style={{animationDelay: '0.5s'}} />
            <div className="absolute bottom-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping" style={{animationDelay: '1s'}} />
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-ping" style={{animationDelay: '1.5s'}} />
          </div>
          
          {/* Control Panel */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={handlePlay}
              disabled={isPlaying && !isPaused}
              className="glass rounded-lg p-3 text-center hover:bg-primary/10 transition-all flex flex-col items-center"
              data-testid="canvas-play"
            >
              <Play className="text-primary mb-1" size={16} />
              <span className="text-xs">Play</span>
            </Button>
            
            <Button
              onClick={handlePause}
              disabled={!isPlaying || isPaused}
              className="glass rounded-lg p-3 text-center hover:bg-accent/10 transition-all flex flex-col items-center"
              data-testid="canvas-pause"
            >
              <Pause className="text-accent mb-1" size={16} />
              <span className="text-xs">Pause</span>
            </Button>
            
            <Button
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="glass rounded-lg p-3 text-center hover:bg-yellow-400/10 transition-all flex flex-col items-center"
              data-testid="canvas-stop"
            >
              <Square className="text-yellow-400 mb-1" size={16} />
              <span className="text-xs">Stop</span>
            </Button>
          </div>
        </div>
        
        {/* Code Output */}
        <div className="space-y-4">
          <div className="glass rounded-xl p-4 h-64 overflow-auto">
            <h4 className="text-sm font-semibold mb-3 text-accent flex items-center">
              <FileCode className="mr-2 w-4 h-4" />
              Generated Code Preview
            </h4>
            <pre className="text-xs font-mono text-white whitespace-pre-wrap">
              {generatedCode}
            </pre>
          </div>
          
          {/* Export Options */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              className="glass rounded-lg p-3 text-center hover:bg-primary/10 transition-all flex flex-col items-center"
              data-testid="export-js"
            >
              <Download className="text-primary mb-1" size={16} />
              <span className="text-xs">Export JS</span>
            </Button>
            
            <Button
              className="glass rounded-lg p-3 text-center hover:bg-accent/10 transition-all flex flex-col items-center"
              data-testid="export-ae"
            >
              <FileCode className="text-accent mb-1" size={16} />
              <span className="text-xs">Export AE</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
