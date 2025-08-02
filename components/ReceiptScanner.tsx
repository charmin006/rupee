'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Camera, Upload, FileText, X, Check, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import { useDropzone } from 'react-dropzone';
import { processReceiptImage, fileToBase64 } from '../lib/utils';
import { ReceiptData, Expense } from '../lib/types';
import { storage } from '../lib/storage';
import toast from 'react-hot-toast';

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseCreated: (expense: Expense) => void;
}

const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  isOpen,
  onClose,
  onExpenseCreated,
}) => {
  const [mode, setMode] = useState<'camera' | 'upload' | 'processing' | 'review'>('camera');
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [extractedExpense, setExtractedExpense] = useState<Partial<Expense> | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      await processImage(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    multiple: false,
  });

  const capturePhoto = useCallback(async () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        // Convert base64 to file
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        const file = new File([blob], 'receipt.jpg', { type: 'image/jpeg' });
        await processImage(file);
      }
    }
  }, []);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setMode('processing');
    
    try {
      const data = await processReceiptImage(file);
      setReceiptData(data);
      
      // Auto-populate expense data
      if (data.extractedData) {
        const expense: Partial<Expense> = {
          amount: data.extractedData.total || 0,
          category: 'Other', // Default category
          date: data.extractedData.date || new Date().toISOString().split('T')[0],
          note: `Receipt from ${data.extractedData.merchant || 'Unknown merchant'}`,
          receiptImage: data.imageUrl,
          receiptData: data,
        };
        setExtractedExpense(expense);
      }
      
      setMode('review');
      toast.success('Receipt processed successfully!');
    } catch (error) {
      console.error('Error processing receipt:', error);
      toast.error('Failed to process receipt. Please try again.');
      setMode('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExpenseSave = () => {
    if (extractedExpense && extractedExpense.amount) {
      const expense: Expense = {
        id: crypto.randomUUID(),
        amount: extractedExpense.amount,
        category: extractedExpense.category || 'Other',
        date: extractedExpense.date || new Date().toISOString().split('T')[0],
        note: extractedExpense.note,
        paymentMethod: extractedExpense.paymentMethod,
        receiptImage: extractedExpense.receiptImage,
        receiptData: extractedExpense.receiptData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.addExpense(expense);
      onExpenseCreated(expense);
      toast.success('Expense saved from receipt!');
      onClose();
    }
  };

  const updateExtractedExpense = (field: keyof Expense, value: any) => {
    setExtractedExpense(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Receipt Scanner</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Scan Receipt with Camera
                </h3>
                <p className="text-gray-600 mb-4">
                  Position your receipt clearly in the camera view
                </p>
              </div>
              
              <div className="relative bg-gray-100 rounded-lg overflow-hidden">
                <Webcam
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 border-2 border-dashed border-blue-400 m-4 pointer-events-none" />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Camera size={20} />
                  Capture Photo
                </button>
                <button
                  onClick={() => setMode('upload')}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={20} />
                  Upload File
                </button>
              </div>
            </div>
          )}

          {mode === 'upload' && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Upload Receipt Image
                </h3>
                <p className="text-gray-600 mb-4">
                  Drag and drop or click to select a receipt image
                </p>
              </div>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                  isDragActive
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input {...getInputProps()} />
                <Upload size={48} className="mx-auto text-gray-400 mb-4" />
                {isDragActive ? (
                  <p className="text-blue-600">Drop the receipt here...</p>
                ) : (
                  <div>
                    <p className="text-gray-600 mb-2">
                      Drag & drop a receipt image, or click to select
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports JPEG, PNG, GIF, BMP
                    </p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setMode('camera')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                <Camera size={20} />
                Use Camera Instead
              </button>
            </div>
          )}

          {mode === 'processing' && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Processing Receipt...
              </h3>
              <p className="text-gray-600">
                Extracting information from your receipt
              </p>
            </div>
          )}

          {mode === 'review' && receiptData && extractedExpense && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Review Extracted Information
                </h3>
                <p className="text-gray-600">
                  Verify and edit the extracted expense details
                </p>
              </div>

              {/* Receipt Preview */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={20} className="text-gray-600" />
                  <span className="font-medium text-gray-900">Receipt Preview</span>
                </div>
                <img
                  src={receiptData.imageUrl}
                  alt="Receipt"
                  className="w-full max-h-48 object-contain rounded border"
                />
                {receiptData.extractedData && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p><strong>Merchant:</strong> {receiptData.extractedData.merchant || 'Unknown'}</p>
                    <p><strong>Total:</strong> ₹{receiptData.extractedData.total || 0}</p>
                    <p><strong>Date:</strong> {receiptData.extractedData.date ? new Date(receiptData.extractedData.date).toLocaleDateString() : 'Unknown'}</p>
                    <p><strong>Confidence:</strong> {(receiptData.confidence * 100).toFixed(1)}%</p>
                  </div>
                )}
              </div>

              {/* Expense Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={extractedExpense.amount || ''}
                    onChange={(e) => updateExtractedExpense('amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={extractedExpense.category || 'Other'}
                    onChange={(e) => updateExtractedExpense('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {storage.getCategories().map(category => (
                      <option key={category.id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={extractedExpense.date || ''}
                    onChange={(e) => updateExtractedExpense('date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Note
                  </label>
                  <textarea
                    value={extractedExpense.note || ''}
                    onChange={(e) => updateExtractedExpense('note', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Add a note about this expense..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={extractedExpense.paymentMethod || 'cash'}
                    onChange={(e) => updateExtractedExpense('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setMode('camera')}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleExpenseSave}
                  disabled={!extractedExpense.amount}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  Save Expense
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptScanner; 