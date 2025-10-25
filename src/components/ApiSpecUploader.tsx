import React, { useState, useRef } from 'react';
import { FileUp as FileUpload, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { ApiSpec, TestCase } from '../App';
import { generateTestCases } from '../utils/testGenerator';

interface Props {
  onSpecUploaded: (spec: ApiSpec) => void;
  onTestCasesGenerated: (testCases: TestCase[]) => void;
  onGenerationStart: () => void;
}

const ApiSpecUploader: React.FC<Props> = ({ onSpecUploaded, onTestCasesGenerated, onGenerationStart }) => {
  const [dragOver, setDragOver] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sampleSpecs = [
    {
      name: 'Pet Store API',
      description: 'Classic OpenAPI example with CRUD operations',
      spec: {
        openapi: '3.0.3',
        info: {
          title: 'Pet Store API',
          version: '1.0.0',
          description: 'A sample Pet Store Server based on the OpenAPI 3.0 specification'
        },
        paths: {
          '/pets': {
            get: {
              summary: 'List all pets',
              operationId: 'listPets',
              parameters: [
                {
                  name: 'limit',
                  in: 'query',
                  description: 'How many items to return at one time (max 100)',
                  required: false,
                  schema: { type: 'integer', maximum: 100, format: 'int32' }
                }
              ],
              responses: {
                '200': {
                  description: 'A paged array of pets',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Pet' }
                      }
                    }
                  }
                }
              }
            },
            post: {
              summary: 'Create a pet',
              operationId: 'createPet',
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Pet' }
                  }
                }
              },
              responses: {
                '201': { description: 'Pet created successfully' },
                '400': { description: 'Bad request' }
              }
            }
          },
          '/pets/{petId}': {
            get: {
              summary: 'Info for a specific pet',
              operationId: 'showPetById',
              parameters: [
                {
                  name: 'petId',
                  in: 'path',
                  required: true,
                  description: 'The id of the pet to retrieve',
                  schema: { type: 'string' }
                }
              ],
              responses: {
                '200': {
                  description: 'Expected response to a valid request',
                  content: {
                    'application/json': {
                      schema: { $ref: '#/components/schemas/Pet' }
                    }
                  }
                },
                '404': { description: 'Pet not found' }
              }
            },
            put: {
              summary: 'Update a pet',
              operationId: 'updatePet',
              parameters: [
                {
                  name: 'petId',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' }
                }
              ],
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Pet' }
                  }
                }
              },
              responses: {
                '200': { description: 'Pet updated successfully' },
                '404': { description: 'Pet not found' }
              }
            },
            delete: {
              summary: 'Delete a pet',
              operationId: 'deletePet',
              parameters: [
                {
                  name: 'petId',
                  in: 'path',
                  required: true,
                  schema: { type: 'string' }
                }
              ],
              responses: {
                '204': { description: 'Pet deleted successfully' },
                '404': { description: 'Pet not found' }
              }
            }
          }
        },
        components: {
          schemas: {
            Pet: {
              type: 'object',
              required: ['id', 'name'],
              properties: {
                id: { type: 'integer', format: 'int64', example: 10 },
                name: { type: 'string', example: 'doggie' },
                category: {
                  type: 'object',
                  properties: {
                    id: { type: 'integer', format: 'int64', example: 1 },
                    name: { type: 'string', example: 'Dogs' }
                  }
                },
                status: {
                  type: 'string',
                  description: 'pet status in the store',
                  enum: ['available', 'pending', 'sold']
                }
              }
            }
          }
        }
      }
    }
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    try {
      setUploadStatus('idle');
      const text = await file.text();
      let spec: ApiSpec;

      if (file.name.endsWith('.json') || file.type === 'application/json') {
        spec = JSON.parse(text);
      } else if (file.name.endsWith('.yml') || file.name.endsWith('.yaml')) {
        // Simple YAML parsing for basic cases
        spec = JSON.parse(text.replace(/:\s*([^\[\{\n]*)/g, ': "$1"').replace(/"/g, '"'));
      } else {
        throw new Error('Unsupported file format. Please upload JSON or YAML files.');
      }

      validateApiSpec(spec);
      setUploadStatus('success');
      onSpecUploaded(spec);
      
      // Generate test cases
      setTimeout(() => {
        onGenerationStart();
        setTimeout(() => {
          const testCases = generateTestCases(spec);
          onTestCasesGenerated(testCases);
        }, 2000);
      }, 500);

    } catch (error) {
      setUploadStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to parse API specification');
    }
  };

  const validateApiSpec = (spec: any) => {
    if (!spec.openapi && !spec.swagger) {
      throw new Error('Invalid API specification. Must be OpenAPI 3.x or Swagger 2.x format.');
    }
    if (!spec.info || !spec.info.title || !spec.info.version) {
      throw new Error('API specification must include info with title and version.');
    }
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      throw new Error('API specification must include at least one path.');
    }
  };

  const handleSampleSpec = (sampleSpec: any) => {
    try {
      validateApiSpec(sampleSpec);
      setUploadStatus('success');
      onSpecUploaded(sampleSpec);
      
      setTimeout(() => {
        onGenerationStart();
        setTimeout(() => {
          const testCases = generateTestCases(sampleSpec);
          onTestCasesGenerated(testCases);
        }, 2000);
      }, 500);
    } catch (error) {
      setUploadStatus('error');
      setErrorMessage('Failed to load sample specification');
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
          dragOver
            ? 'border-indigo-500 bg-indigo-50'
            : uploadStatus === 'success'
            ? 'border-green-500 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-500 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.yml,.yaml"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          {uploadStatus === 'success' ? (
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          ) : uploadStatus === 'error' ? (
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          ) : (
            <FileUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          )}
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {uploadStatus === 'success' 
              ? 'API Specification Uploaded Successfully!' 
              : uploadStatus === 'error'
              ? 'Upload Failed'
              : 'Upload API Specification'
            }
          </h3>
          
          {uploadStatus === 'error' ? (
            <p className="text-red-600">{errorMessage}</p>
          ) : (
            <p className="text-gray-600 mb-4">
              Drag and drop your OpenAPI/Swagger file here, or click to browse
            </p>
          )}
          
          {uploadStatus !== 'success' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose File
            </button>
          )}
        </div>
      </div>

      {/* Sample Specifications */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Or Try a Sample API</h4>
        <div className="grid grid-cols-1 gap-4">
          {sampleSpecs.map((sample, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-indigo-600 mt-0.5" />
                  <div>
                    <h5 className="font-semibold text-gray-900">{sample.name}</h5>
                    <p className="text-sm text-gray-600 mt-1">{sample.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleSampleSpec(sample.spec)}
                  className="px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors"
                >
                  Use Sample
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ApiSpecUploader;