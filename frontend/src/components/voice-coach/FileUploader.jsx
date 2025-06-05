import React from 'react';

const FileUploader = ({ onFileUpload, isFileUploaded, uploadStatus, isProcessing }) => {
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        onFileUpload(file);
    };

    return (
        <div className="space-y-4">
            <label className={`flex items-center justify-center px-4 py-2 rounded-lg border cursor-pointer transition-colors ${
                isFileUploaded ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-300 hover:bg-gray-50'
            }`}>
                <input
                    type="file"
                    accept=".txt,.doc,.docx,.pdf,audio/*"
                    onChange={handleFileUpload}
                    className="hidden"
                />
                <span className="flex items-center">
                    {isFileUploaded ? (
                        <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            File Uploaded
                        </>
                    ) : (
                        'Upload File'
                    )}
                </span>
            </label>

            {uploadStatus && (
                <p className={`text-sm ${
                    uploadStatus.includes('Error') ? 'text-red-600' : 
                    uploadStatus.includes('success') ? 'text-green-600' : 
                    'text-gray-600'
                }`}>
                    {uploadStatus}
                </p>
            )}

            {isProcessing && (
                <div className="text-center text-gray-600">
                    Processing your file...
                </div>
            )}
        </div>
    );
};

export default FileUploader; 