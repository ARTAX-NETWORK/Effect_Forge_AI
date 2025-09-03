import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload as UploadIcon, FileText, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function Upload() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: files, isLoading } = useQuery({
    queryKey: ['/api/files'],
  });

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
      setSelectedFiles(null);
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: string) => {
      const response = await fetch(`/api/files/${fileId}`, {
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
        title: 'File Deleted',
        description: 'File has been successfully deleted',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/files'] });
    },
    onError: (error) => {
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFiles(e.target.files);
  };

  const handleUpload = () => {
    if (selectedFiles) {
      uploadMutation.mutate(selectedFiles);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'text-blue-400';
      case 'parsing': return 'text-yellow-400 animate-pulse';
      case 'parsed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 max-w-7xl mx-auto" data-testid="upload-page">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-black mb-4 gradient-text">
          DIMENSIONAL UPLOAD
        </h1>
        <p className="text-xl text-muted-foreground">
          Universal file parser supporting 9 formats with batch processing
        </p>
      </div>

      {/* Upload Zone */}
      <Card className="holographic-panel mb-8">
        <CardHeader>
          <CardTitle className="flex items-center text-primary">
            <UploadIcon className="mr-2" />
            File Upload Portal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="portal-zone rounded-xl p-8 text-center">
            <input
              type="file"
              multiple
              accept=".txt,.md,.json,.csv,.pdf,.docx,.xlsx,.rtf,.xml"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload-main"
              data-testid="file-input-main"
            />
            <label
              htmlFor="file-upload-main"
              className="cursor-pointer block"
            >
              <UploadIcon className="w-16 h-16 text-primary mb-4 mx-auto" />
              <h3 className="text-xl font-bold mb-2">Select Files to Upload</h3>
              <p className="text-muted-foreground mb-4">
                Supports: TXT, MD, JSON, CSV, PDF, DOCX, XLSX, RTF, XML
              </p>
            </label>

            {selectedFiles && (
              <div className="mt-6 p-4 glass rounded-lg">
                <h4 className="font-semibold mb-2">Selected Files:</h4>
                <div className="space-y-2">
                  {Array.from(selectedFiles).map((file, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span>{file.name}</span>
                      <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  data-testid="upload-button"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Files'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <Card className="holographic-panel">
        <CardHeader>
          <CardTitle className="flex items-center text-accent">
            <FileText className="mr-2" />
            Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading files...</p>
            </div>
          ) : files && Array.isArray(files) && files.length > 0 ? (
            <div className="space-y-4">
              {files.map((file: any) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 glass rounded-lg"
                  data-testid={`file-${file.id}`}
                >
                  <div className="flex-1">
                    <div className="font-medium">{file.originalName}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatFileSize(file.size)} • {file.mimetype}
                    </div>
                    <div className={`text-xs mt-1 ${getStatusColor(file.status)} capitalize`}>
                      Status: {file.status}
                    </div>
                    {file.errorMessage && (
                      <div className="text-xs text-red-400 mt-1">
                        Error: {file.errorMessage}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {file.parsedContent && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="glass"
                        data-testid={`view-${file.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteMutation.mutate(file.id)}
                      disabled={deleteMutation.isPending}
                      className="glass text-red-400 hover:text-red-300"
                      data-testid={`delete-${file.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files uploaded yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
