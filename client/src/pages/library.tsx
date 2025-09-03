import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Database, Search, Filter, Download, Eye, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function Library() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: effects, isLoading } = useQuery({
    queryKey: ['/api/effects', searchQuery, categoryFilter, typeFilter],
  });

  const deleteMutation = useMutation({
    mutationFn: async (effectId: string) => {
      const response = await fetch(`/api/effects/${effectId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Effect Deleted',
        description: 'Effect has been successfully removed from library',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/effects'] });
    },
    onError: (error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const downloadEffect = (effect: any) => {
    const code = effect.javascriptCode || effect.cssCode || effect.afterEffectsCode;
    if (!code) {
      toast({
        title: 'No Code Available',
        description: 'This effect has no generated code to download',
        variant: 'destructive',
      });
      return;
    }

    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${effect.name}.${effect.type === 'javascript' ? 'js' : effect.type === 'css' ? 'css' : 'jsx'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: `${effect.name} downloaded successfully`,
    });
  };

  const getConstitutionScore = (effect: any) => {
    let score = 0;
    if (effect.performanceCompliant) score += 14.3;
    if (effect.intelligenceAdaptive) score += 14.3;
    if (effect.universalCompatible) score += 14.3;
    if (effect.perfectExperience) score += 14.3;
    if (effect.visualImpact) score += 14.3;
    if (effect.addictiveEcosystem) score += 14.3;
    if (effect.competitiveDomination) score += 14.2;
    return Math.round(score);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const filteredEffects = Array.isArray(effects) ? effects.filter((effect: any) => {
    const matchesSearch = effect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         effect.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || effect.category === categoryFilter;
    const matchesType = typeFilter === 'all' || effect.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  }) : [];

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto" data-testid="library-page">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
          EFFECT LIBRARY
        </h1>
        <p className="text-xl text-muted-foreground">
          Intelligent neural search through {Array.isArray(effects) ? effects.length : 0} constitutional effects
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="holographic-panel mb-8">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <Search className="mr-2" />
            Neural Search & Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Search effects by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-input border-border text-foreground"
                data-testid="search-input"
              />
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="particle">Particle Effects</SelectItem>
                <SelectItem value="transition">Transitions</SelectItem>
                <SelectItem value="animation">Animations</SelectItem>
                <SelectItem value="filter">Filters</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger data-testid="type-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="aftereffects">After Effects</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Effects Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading neural library...</p>
        </div>
      ) : filteredEffects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEffects.map((effect: any) => {
            const constitutionScore = getConstitutionScore(effect);
            
            return (
              <Card key={effect.id} className="holographic-panel" data-testid={`effect-${effect.id}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{effect.name}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {effect.type}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {effect.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${getScoreColor(constitutionScore)}`}>
                        {constitutionScore}%
                      </div>
                      <div className="text-xs text-muted-foreground">Constitution</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {effect.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{effect.renderTime}ms render</span>
                    <span>{effect.memoryUsage}MB memory</span>
                    <span>{effect.targetFps}fps</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {effect.tags?.map((tag: string) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 glass"
                      data-testid={`preview-${effect.id}`}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadEffect(effect)}
                      className="glass"
                      data-testid={`download-${effect.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(effect.id)}
                      disabled={deleteMutation.isPending}
                      className="glass text-red-400 hover:text-red-300"
                      data-testid={`delete-${effect.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No effects found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}
