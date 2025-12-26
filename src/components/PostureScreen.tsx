import React, { useState, useRef } from 'react';
import { Button } from '../components/Button';
import { ArrowLeft, Camera, X } from 'lucide-react';
import { toast } from 'sonner';

interface PostureScreenProps {
  onBack: () => void;
}

export function PostureScreen({ onBack }: PostureScreenProps) {
  const [stage, setStage] = useState<'intro' | 'camera' | 'results'>('intro');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      
      setStage('camera');
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Unable to access camera. Please check permissions.');
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  const captureAndAnalyze = async () => {
    setAnalyzing(true);
    stopCamera();
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock results
    const results = [
      {
        score: 'Good',
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        improvements: [
          'Keep your core engaged throughout the movement',
          'Align your shoulders over your hips',
          'Maintain a neutral spine position'
        ],
        tips: 'Your form is solid! Focus on controlled movements and breathing.'
      },
      {
        score: 'Average',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        improvements: [
          'Lower your hips more to reach proper depth',
          'Keep your back straight during the movement',
          'Distribute your weight evenly on both feet'
        ],
        tips: 'You\'re on the right track! Work on depth and balance.'
      },
      {
        score: 'Needs Improvement',
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        improvements: [
          'Straighten your back to prevent injury',
          'Keep your knees behind your toes',
          'Engage your core for better stability',
          'Distribute weight evenly across your feet'
        ],
        tips: 'Focus on form over speed. Consider working with lighter weights first.'
      }
    ];
    
    const randomResult = results[Math.floor(Math.random() * results.length)];
    setResult(randomResult);
    setStage('results');
    setAnalyzing(false);
  };
  
  const handleBack = () => {
    stopCamera();
    if (stage === 'intro') {
      onBack();
    } else {
      setStage('intro');
      setResult(null);
    }
  };
  
  const checkAgain = () => {
    setResult(null);
    setStage('intro');
  };
  
  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-secondary hover:text-primary mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
        
        <h1 className="text-slate-900 mb-2">Posture Check</h1>
        <p className="text-secondary">Analyze your exercise form with AI</p>
      </div>
      
      {/* Content */}
      <div className="max-w-2xl mx-auto">
        {stage === 'intro' && (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl" style={{ backgroundColor: '#D946EF' }}>
              <Camera className="w-10 h-10 text-white" />
            </div>
            
            <h2 className="text-center text-slate-900 mb-6">How It Works</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: '#0EA5E9' }}>
                  1
                </div>
                <div>
                  <h4 className="text-slate-900 mb-1">Position Your Camera</h4>
                  <p className="text-secondary">Place your camera 6-8 feet away from where you'll exercise</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: '#0EA5E9' }}>
                  2
                </div>
                <div>
                  <h4 className="text-slate-900 mb-1">Full Body Visible</h4>
                  <p className="text-secondary">Ensure your entire body is visible in the frame</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white" style={{ backgroundColor: '#0EA5E9' }}>
                  3
                </div>
                <div>
                  <h4 className="text-slate-900 mb-1">Perform Exercise</h4>
                  <p className="text-secondary">Do a squat, push-up, or any exercise you want to check</p>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
              <p className="text-amber-900 text-sm">
                <strong>Important:</strong> Ensure good lighting and a clear background for best results
              </p>
            </div>
            
            <Button
              variant="primary"
              className="w-full"
              onClick={startCamera}
            >
              <Camera className="w-5 h-5 mr-2" />
              Start Camera
            </Button>
          </div>
        )}
        
        {stage === 'camera' && (
          <div className="bg-white rounded-3xl p-6 shadow-xl">
            <div className="relative bg-black/90 rounded-3xl overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-4 border-sky-500 border-dashed rounded-3xl pointer-events-none" />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                Position yourself in frame
              </div>
            </div>
            
            {analyzing ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-secondary">Analyzing your posture...</p>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    stopCamera();
                    setStage('intro');
                  }}
                >
                  <X className="w-5 h-5 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={captureAndAnalyze}
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Capture & Analyze
                </Button>
              </div>
            )}
          </div>
        )}
        
        {stage === 'results' && result && (
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="text-center mb-8">
              <div className={`inline-flex px-6 py-3 rounded-full ${result.bgColor} ${result.color} mb-4`}>
                <span className="text-xl">{result.score}</span>
              </div>
              <h2 className="text-slate-900 mb-2">Posture Analysis Complete</h2>
              <p className="text-secondary">Here's your personalized feedback</p>
            </div>
            
            <div className="bg-gray-50 rounded-3xl p-6 mb-6">
              <h3 className="text-slate-900 mb-4">Key Improvements</h3>
              <div className="space-y-3">
                {result.improvements.map((improvement: string, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-6 h-6 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm" style={{ backgroundColor: '#0EA5E9' }}>
                      {index + 1}
                    </div>
                    <p className="text-secondary">{improvement}</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-3xl p-6 mb-6 border border-purple-200">
              <h4 className="text-slate-900 mb-2">💡 Pro Tip</h4>
              <p className="text-secondary">{result.tips}</p>
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={handleBack}
              >
                Done
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={checkAgain}
              >
                <Camera className="w-5 h-5 mr-2" />
                Check Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
