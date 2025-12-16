import React, { useState } from 'react';
import { Check, Key, ExternalLink, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface ApiKeySetupProps {
  onComplete: (apiKey: string) => void;
}

export const ApiKeySetup: React.FC<ApiKeySetupProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleNext = () => {
    if (step === 3 && !apiKey.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    if (step === 3) {
        if (!apiKey.startsWith('AIza')) {
             setError('This doesn\'t look like a valid Gemini API key (usually starts with AIza)');
             return;
        }
    }
    
    if (step < 4) {
      setStep(step + 1);
      setError('');
    } else {
      onComplete(apiKey);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Welcome",
      description: "Let's set up your AI Course Designer",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 2,
      title: "Get Key",
      description: "Get your free Gemini API key",
      icon: <Key className="w-5 h-5" />,
    },
    {
      id: 3,
      title: "Connect",
      description: "Enter your API key",
      icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
      id: 4,
      title: "Ready",
      description: "Start creating",
      icon: <Check className="w-5 h-5" />,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-3xl animate-pulse delay-1000" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-teal-400/20 blur-3xl animate-pulse delay-2000" />
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-white/50 relative z-10">
        {/* Sidebar / Stepper */}
        <div className="bg-slate-900/95 text-white p-10 md:w-1/3 flex flex-col justify-between relative overflow-hidden">
            {/* Abstract shapes in sidebar */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-10 tracking-tight">Setup Guide</h2>
            <div className="space-y-8">
              {steps.map((s) => (
                <div key={s.id} className={`flex items-center space-x-4 group ${step >= s.id ? 'text-white' : 'text-slate-500'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300
                    ${step > s.id ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-transparent shadow-lg shadow-green-900/20' : 
                      step === s.id ? 'border-blue-400 bg-blue-500/20 shadow-lg shadow-blue-900/20' : 'border-slate-700 bg-slate-800/50'}`}>
                    {step > s.id ? <Check className="w-5 h-5 text-white" /> : <span className={step === s.id ? "text-blue-400" : ""}>{s.icon}</span>}
                  </div>
                  <div className="flex flex-col">
                      <span className={`font-semibold text-lg transition-colors ${step === s.id ? "text-blue-400" : ""}`}>{s.title}</span>
                      <span className="text-xs text-slate-400 font-medium">{s.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative z-10 text-slate-400 text-sm mt-8 flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Powered by Google Gemini</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-12 md:w-2/3 flex flex-col bg-gradient-to-br from-white via-white to-blue-50/30">
          <div className="flex-1 flex flex-col justify-center">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-blue-100">
                  <Sparkles className="w-10 h-10 text-blue-600" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                    Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Tangible</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Experience the future of course design. We use Google's advanced Gemini AI to generate comprehensive skill maps tailored to your curriculum in seconds.
                </p>
                <div className="pt-4">
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">To get started</p>
                    <p className="text-gray-700 mt-1">We'll need a free API key from Google AI Studio. It's quick, free, and secure.</p>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-purple-100">
                  <Key className="w-10 h-10 text-purple-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Get Your API Key</h1>
                    <p className="text-lg text-gray-600">Follow these simple steps to unlock the power of AI.</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">1</div>
                        <p className="text-gray-700 pt-1">Go to <span className="font-semibold">Google AI Studio</span>.</p>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">2</div>
                        <p className="text-gray-700 pt-1">Sign in with your Google account.</p>
                    </div>
                    <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">3</div>
                        <p className="text-gray-700 pt-1">Click <span className="font-semibold">"Get API key"</span> and create a new key.</p>
                    </div>
                </div>
                
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 text-white font-semibold px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 w-full justify-center"
                >
                  <span>Open Google AI Studio</span>
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-emerald-100">
                  <ShieldCheck className="w-10 h-10 text-emerald-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Connect Your Key</h1>
                    <p className="text-lg text-gray-600">Paste your API key below to activate the AI assistant.</p>
                </div>
                
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider">API Key</label>
                  <div className="relative">
                    <input
                        type="password"
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            setError('');
                        }}
                        placeholder="AIza..."
                        className="w-full p-4 pl-12 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-lg font-mono"
                    />
                    <Key className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  </div>
                  {error && <p className="text-red-500 text-sm font-medium flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>{error}</p>}
                </div>
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start space-x-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                        Your key is stored locally in your browser session. We never transmit it to our servers or store it permanently.
                    </p>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-3xl flex items-center justify-center mb-8 shadow-inner ring-1 ring-green-100">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">You're All Set!</h1>
                    <p className="text-xl text-gray-600">Your AI assistant is ready to help you design amazing courses.</p>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-white p-6 rounded-2xl border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-2">What happens next?</h3>
                  <p className="text-gray-600">
                    We'll guide you through a few questions about your course topic, target audience, and goals. Then, our AI will generate a complete skill map for you.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-end">
            <button
              onClick={handleNext}
              className="group flex items-center space-x-3 bg-slate-900 text-white px-8 py-4 rounded-xl hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20 transition-all transform active:scale-95 font-semibold text-lg"
            >
              <span>{step === 4 ? "Start Designing" : "Continue"}</span>
              {step === 4 ? <Sparkles className="w-5 h-5 group-hover:animate-spin" /> : <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
