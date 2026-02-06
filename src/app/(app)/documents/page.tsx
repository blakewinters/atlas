'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase-browser';
interface Document {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  file_type: string;
  file_size: number | null;
  tags: string[] | null;
  created_at: string;
}

export default function DocumentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFileTypes = ['.pdf', '.docx', '.txt', '.md', '.png', '.jpg', '.jpeg', '.gif'];
  const acceptedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'image/png',
    'image/jpeg',
    'image/gif',
  ];

  // Fetch documents on mount
  useEffect(() => {
    if (authLoading || !user) {
      setLoading(authLoading);
      return;
    }

    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from('documents')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setDocuments(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load documents');
        console.error('Fetch documents error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [user, authLoading]);

  // Extract text from file
  const extractFileContent = async (file: File): Promise<string> => {
    if (file.type === 'text/plain' || file.type === 'text/markdown') {
      return await file.text();
    }
    // For PDF, DOCX, and images, just return filename as we're storing the filename
    // In a real app, you'd use a library to extract text from PDFs and DOCX files
    return `[${file.name}] - Document uploaded`;
  };

  const handleFileSelect = (file: File) => {
    const isAccepted = acceptedMimeTypes.includes(file.type);
    const hasAcceptedExtension = acceptedFileTypes.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!isAccepted && !hasAcceptedExtension) {
      setError(`File type not accepted. Please upload: ${acceptedFileTypes.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setError(null);
    // Auto-fill title from filename if empty
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!user || !selectedFile || !title.trim()) {
      setError('Please select a file and enter a title');
      return;
    }

    setUploading(true);
    try {
      const content = await extractFileContent(selectedFile);
      const fileExtension = selectedFile.name.split('.').pop() || 'unknown';
      const tagArray = tags
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const { error: uploadError } = await supabase.from('documents').insert({
        user_id: user.id,
        title: title.trim(),
        content,
        file_type: fileExtension,
        file_size: selectedFile.size,
        tags: tagArray.length > 0 ? tagArray : null,
      });

      if (uploadError) throw uploadError;

      // Refresh documents list
      const { data, error: fetchError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setDocuments(data || []);

      // Reset form
      setTitle('');
      setTags('');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Documents</h1>
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-600">Loading documents...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Documents</h1>
          <p className="mt-2 text-lg text-gray-600">
            Upload documents to build your knowledge base
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Existing Documents */}
        {documents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Documents</h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{doc.title}</h3>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {doc.file_type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{formatDate(doc.created_at)}</p>
                      {doc.file_size && (
                        <p className="text-xs text-gray-500 mt-1">{formatFileSize(doc.file_size)}</p>
                      )}
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {doc.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Upload New Document</h2>

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            } ${selectedFile ? 'border-green-500 bg-green-50' : ''}`}
          >
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-gray-900 font-medium">
              {selectedFile ? `Selected: ${selectedFile.name}` : 'Drag and drop your file here'}
            </p>
            <p className="text-gray-600 text-sm mt-2">
              or{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                click to browse
              </button>
            </p>
            <p className="text-gray-500 text-xs mt-3">
              Supported: PDF, DOCX, TXT, MD, PNG, JPG, GIF
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={acceptedFileTypes.join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Form Fields */}
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Project Proposal"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., important, project-alpha"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Upload Button */}
          <div className="mt-6">
            <button
              onClick={handleUpload}
              disabled={uploading || !selectedFile || !title.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
