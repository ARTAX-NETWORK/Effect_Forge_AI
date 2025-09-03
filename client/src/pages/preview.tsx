import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Eye, Play, Pause, Square, Settings, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Preview() {
  const [selectedEffect, setSelectedEffect] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState([1]);
  const [quality, setQuality] = useState([100]);
  const [showControls, setShowControls] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: effects } = useQuery({
    queryKey: ['/api/effects'],
  });

  const { data: effectData } = useQuery({
    queryKey: ['/api/effects', selectedEffect],
    enabled: !!selectedEffect,
  });

  useEffect(() => {
    if (effectData && canvasRef.current) {
      // Initialize effect preview
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.fillStyle = '#1a1b2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw placeholder effect
        if (isPlaying && !isPaused) {
          drawEffectPreview(ctx, canvas.width, canvas.height);
        }
      }
    }
  }, [effectData, isPlaying, isPaused]);

  const drawEffectPreview = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Placeholder effect visualization
    const time = Date.now() * 0.001;
    
    // Clear with background
    ctx.fillStyle = '#1a1b2e';
    ctx.fillRect(0, 0, width, height);
    
    // Draw animated particles
    for (let i = 0; i < 50; i++) {
      const x = (Math.sin(time * speed[0] + i * 0.1) * 0.5 + 0.5) * width;
      const y = (Math.cos(time * speed[0] + i * 0.2) * 0.5 + 0.5) * height;
      const size = Math.sin(time * speed[0] + i) * 2 + 3;
      
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      
      const hue = (time * 50 + i * 10) % 360;
      ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
      ctx.fill();
      
      // Glow effect
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    
    if (isPlaying && !isPaused) {
      requestAnimationFrame(() => drawEffectPreview(ctx, width, height));
    }
  };

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

  const handleExport = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${effectData?.name || 'effect'}-preview.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto" data-testid="preview-page">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
          LIVE PREVIEW
        </h1>
        <p className="text-xl text-muted-foreground">
          Real-time effect rendering with 60fps performance guarantee
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Controls Panel */}
        <div className="lg:col-span-1">
          <Card className="holographic-panel mb-6">
            <CardHeader>
              <CardTitle className="flex items-center text-primary">
                <Settings className="mr-2" />
                Preview Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Effect Selection */}
              <div>
                <Label htmlFor="effect-select">Select Effect</Label>
                <Select value={selectedEffect} onValueChange={setSelectedEffect}>
                  <SelectTrigger className="mt-2" data-testid="effect-select">
                    <SelectValue placeholder="Choose an effect" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(effects) ? effects.map((effect: any) => (
                      <SelectItem key={effect.id} value={effect.id}>
                        {effect.name}
                      </SelectItem>
                    )) : null}
                  </SelectContent>
                </Select>
              </div>

              {/* Playback Speed */}
              <div>
                <Label className="text-sm">
                  Playback Speed: {speed[0]}x
                </Label>
                <Slider
                  value={speed}
                  onValueChange={setSpeed}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="mt-2"
                  data-testid="speed-slider"
                />
              </div>

              {/* Quality */}
              <div>
                <Label className="text-sm">
                  Quality: {quality[0]}%
                </Label>
                <Slider
                  value={quality}
                  onValueChange={setQuality}
                  min={25}
                  max={100}
                  step={25}
                  className="mt-2"
                  data-testid="quality-slider"
                />
              </div>

              {/* Show Controls */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-controls"
                  checked={showControls}
                  onCheckedChange={setShowControls}
                  data-testid="controls-toggle"
                />
                <Label htmlFor="show-controls">Show Controls</Label>
              </div>

              {/* Control Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={handlePlay}
                  disabled={isPlaying && !isPaused}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="play-button"
                >
                  <Play className="mr-2 w-4 h-4" />
                  Play
                </Button>
                
                <Button
                  onClick={handlePause}
                  disabled={!isPlaying || isPaused}
                  variant="outline"
                  className="w-full glass"
                  data-testid="pause-button"
                >
                  <Pause className="mr-2 w-4 h-4" />
                  Pause
                </Button>
                
                <Button
                  onClick={handleStop}
                  disabled={!isPlaying && !isPaused}
                  variant="outline"
                  className="w-full glass"
                  data-testid="stop-button"
                >
                  <Square className="mr-2 w-4 h-4" />
                  Stop
                </Button>

                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full glass"
                  data-testid="export-button"
                >
                  <Download className="mr-2 w-4 h-4" />
                  Export Frame
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-3">
          <Card className="holographic-panel">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-accent">
                <div className="flex items-center">
                  <Eye className="mr-2" />
                  Live Renderer Canvas
                  {selectedEffect && effectData && (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">
                      - {effectData.name}
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-green-400">60fps</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    <span className="text-primary">Real-time</span>
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="effect-canvas rounded-xl overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={800}
                  height={600}
                  className="w-full h-auto max-h-[600px] bg-forge-black border-2 border-primary rounded-lg"
                  data-testid="preview-canvas"
                />
                
                {!selectedEffect && (
                  <div className="absolute inset-0 flex items-center justify-center bg-forge-black/80 rounded-lg">
                    <div className="text-center">
                      <Eye className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg font-medium">Select an effect to preview</p>
                      <p className="text-sm text-muted-foreground">
                        Choose from the dropdown menu to start rendering
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Performance Stats */}
              {selectedEffect && effectData && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="glass rounded-lg p-3 text-center">
                    <div className="text-primary font-mono text-lg">
                      {effectData.renderTime || '<16'}ms
                    </div>
                    <div className="text-muted-foreground">Render Time</div>
                  </div>
                  
                  <div className="glass rounded-lg p-3 text-center">
                    <div className="text-accent font-mono text-lg">
                      {effectData.memoryUsage || '256'}MB
                    </div>
                    <div className="text-muted-foreground">Memory Usage</div>
                  </div>
                  
                  <div className="glass rounded-lg p-3 text-center">
                    <div className="text-green-400 font-mono text-lg">
                      {effectData.targetFps || 60}fps
                    </div>
                    <div className="text-muted-foreground">Target FPS</div>
                  </div>
                  
                  <div className="glass rounded-lg p-3 text-center">
                    <div className="text-yellow-400 font-mono text-lg">
                      {effectData.constitutionScore || 100}%
                    </div>
                    <div className="text-muted-foreground">Constitution</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
