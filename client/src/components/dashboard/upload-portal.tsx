import { useCallback, useState } from 'react';
import { Upload as UploadIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const supportedFormats = ['TXT', 'MD', 'JSON', 'CSV', 'PDF', 'DOCX', 'XLSX', 'RTF', 'XML'];

export function UploadPortal() {
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (files: FileList) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
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
        title: 'Files Uploaded',
        description: `${data.files.length} files uploaded successfully`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadMutation.mutate(files);
    }
  }, [uploadMutation]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadMutation.mutate(files);
    }
  }, [uploadMutation]);

  return (
    <div className="holographic-panel rounded-2xl p-8" data-testid="upload-portal">
      <h3 className="text-2xl font-bold mb-6 text-accent flex items-center">
        <UploadIcon className="mr-3" />
        Dimensional Upload Portal
      </h3>
      
      <div 
        className={`portal-zone rounded-2xl h-64 flex flex-col items-center justify-center relative overflow-hidden transition-all ${
          isDragOver ? 'border-accent bg-accent/10' : ''
        } ${uploadMutation.isPending ? 'opacity-50' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="drop-zone"
      >
        {/* Portal Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent transform -skew-x-12 animate-pulse" />
        
        <div className="text-center z-10">
          <UploadIcon className="w-16 h-16 text-primary mb-4 mx-auto animate-pulse" />
          <h4 className="text-xl font-bold mb-2">
            {uploadMutation.isPending ? 'Processing Files...' : 'Drop Files Into The Forge'}
          </h4>
          <p className="text-muted-foreground mb-4">
            Universal Parser • 9 Formats • Batch Processing
          </p>
          <div className="flex items-center justify-center space-x-4 text-sm mb-4">
            {supportedFormats.map((format) => (
              <span key={format} className="px-3 py-1 glass rounded-full">
                {format}
              </span>
            ))}
          </div>
          
          <input
            type="file"
            multiple
            accept=".txt,.md,.json,.csv,.pdf,.docx,.xlsx,.rtf,.xml"
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
            data-testid="file-input"
            disabled={uploadMutation.isPending}
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-2 glass rounded-lg cursor-pointer hover:bg-primary/10 transition-all"
          >
            Or click to select files
          </label>
        </div>
        
        {/* Data streams */}
        <div className="absolute top-4 left-10 data-stream" />
        <div className="absolute top-8 right-16 data-stream" style={{animationDelay: '0.5s'}} />
        <div className="absolute bottom-6 left-20 data-stream" style={{animationDelay: '1s'}} />
        <div className="absolute bottom-12 right-8 data-stream" style={{animationDelay: '1.5s'}} />
      </div>
    </div>
  );
}
