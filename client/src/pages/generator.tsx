import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Wand2, Code, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { effectGenerationRequestSchema, type EffectGenerationRequest } from '@shared/schema';

export default function Generator() {
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<EffectGenerationRequest>({
    resolver: zodResolver(effectGenerationRequestSchema),
    defaultValues: {
      prompt: '',
      type: 'javascript',
      targetFps: 60,
      maxMemory: 512,
      enableConstitution: true,
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: EffectGenerationRequest) => {
      const response = await fetch('/api/effects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Effect Generated',
        description: `Session ID: ${data.sessionId}`,
      });
      setGeneratedCode(data.code || '// Generating code...');
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

  const onSubmit = (data: EffectGenerationRequest) => {
    setIsGenerating(true);
    generateMutation.mutate(data);
    
    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const downloadCode = () => {
    if (!generatedCode) return;
    
    const blob = new Blob([generatedCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'effect.js';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto" data-testid="generator-page">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
          EFFECT GENERATOR
        </h1>
        <p className="text-xl text-muted-foreground">
          AI-powered effect creation with constitutional compliance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <Card className="holographic-panel">
          <CardHeader>
            <CardTitle className="flex items-center text-primary">
              <Wand2 className="mr-2" />
              Effect Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Prompt Input */}
              <div>
                <Label htmlFor="prompt">Effect Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the effect you want to create... (e.g., 'A particle explosion with blue and gold colors that moves in a spiral pattern')"
                  className="mt-2 bg-input border-border text-foreground min-h-[100px]"
                  {...form.register('prompt')}
                  data-testid="effect-prompt"
                />
                {form.formState.errors.prompt && (
                  <p className="text-red-400 text-sm mt-1">
                    {form.formState.errors.prompt.message}
                  </p>
                )}
              </div>

              {/* Effect Type */}
              <div>
                <Label htmlFor="type">Output Type</Label>
                <Select 
                  value={form.watch('type')} 
                  onValueChange={(value) => form.setValue('type', value as any)}
                >
                  <SelectTrigger className="mt-2" data-testid="effect-type">
                    <SelectValue placeholder="Select effect type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="aftereffects">After Effects</SelectItem>
                    <SelectItem value="css">CSS Animation</SelectItem>
                    <SelectItem value="all">All Formats</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Performance Settings */}
              <div className="space-y-4">
                <Label>Performance Settings</Label>
                
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Target FPS: {form.watch('targetFps')}
                  </Label>
                  <Slider
                    value={[form.watch('targetFps')]}
                    onValueChange={([value]) => form.setValue('targetFps', value)}
                    min={30}
                    max={120}
                    step={10}
                    className="mt-2"
                    data-testid="fps-slider"
                  />
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Max Memory: {form.watch('maxMemory')}MB
                  </Label>
                  <Slider
                    value={[form.watch('maxMemory')]}
                    onValueChange={([value]) => form.setValue('maxMemory', value)}
                    min={64}
                    max={1024}
                    step={64}
                    className="mt-2"
                    data-testid="memory-slider"
                  />
                </div>
              </div>

              {/* Constitutional Compliance */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="constitution"
                  checked={form.watch('enableConstitution')}
                  onCheckedChange={(checked) => form.setValue('enableConstitution', checked)}
                  data-testid="constitution-toggle"
                />
                <Label htmlFor="constitution">
                  Enable Constitutional Compliance
                </Label>
              </div>

              <Button
                type="submit"
                disabled={generateMutation.isPending || isGenerating}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="generate-button"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Forging Effect...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 w-4 h-4" />
                    Generate Effect
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card className="holographic-panel">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-accent">
              <div className="flex items-center">
                <Code className="mr-2" />
                Generated Code
              </div>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="glass"
                  data-testid="preview-button"
                >
                  <Play className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={downloadCode}
                  disabled={!generatedCode}
                  className="glass"
                  data-testid="download-button"
                >
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="effect-canvas rounded-xl h-96 overflow-auto p-4">
              {isGenerating ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-primary font-medium">Neural Core Processing...</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Applying DAAR methodology
                    </p>
                  </div>
                </div>
              ) : generatedCode ? (
                <pre className="text-sm font-mono text-white whitespace-pre-wrap">
                  {generatedCode}
                </pre>
              ) : (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <Code className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Generated code will appear here
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
