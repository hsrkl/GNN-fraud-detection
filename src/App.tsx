import React, { useState, FormEvent, ChangeEvent } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Sliders, 
  FileText, 
  Code2 
} from 'lucide-react';

// Data Interfaces
export interface MetricScore {
  name: string;
  score: number;
  max: number;
  comment: string;
}

export interface EvaluationResponse {
  overallScore: number;
  summary: string;
  metrics: MetricScore[];
}

export default function App(): React.JSX.Element {
  // Input Form States
  const [candidateName, setCandidateName] = useState<string>('');
  const [submissionContent, setSubmissionContent] = useState<string>('');
  const [evaluationCriteria, setEvaluationCriteria] = useState<string>('');

  // UI Flow States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluationResults, setEvaluationResults] = useState<EvaluationResponse | null>(null);

  // Form Submit Handler
  const handleEvaluate = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!submissionContent.trim()) {
      setError('Please provide submission text or code before evaluating.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const payload = {
      candidate_name: candidateName || 'Anonymous',
      submission: submissionContent,
      criteria: evaluationCriteria,
    };

    try {
      // Dummy score payload for preview (Replace this block when hooking up API)
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockData: EvaluationResponse = {
        overallScore: 88,
        summary: 'Submission demonstrates high technical accuracy, clean logic, and strong adherence to criteria.',
        metrics: [
          { name: 'Technical Depth', score: 90, max: 100, comment: 'Well-structured reasoning and execution.' },
          { name: 'Content / Code Quality', score: 85, max: 100, comment: 'Clean, readable presentation with proper formatting.' },
          { name: 'Rubric Alignment', score: 92, max: 100, comment: 'Directly addresses all requirements provided.' },
          { name: 'Edge Case Coverage', score: 82, max: 100, comment: 'Good overall coverage of standard constraints.' }
        ]
      };

      setEvaluationResults(mockData);

      // Smooth scroll to results on the same view
      setTimeout(() => {
        document.getElementById('evaluation-results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error(err);
      setError('Failed to evaluate submission. Please check input parameters.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0e0e10] text-zinc-200 font-sans selection:bg-amber-500/20 selection:text-amber-200">
      
      {/* Claude-Style Navbar */}
      <header className="border-b border-zinc-800/80 bg-[#0e0e10]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-amber-600/20 border border-amber-500/40 flex items-center justify-center font-semibold text-amber-400 text-sm">
              TR
            </div>
            <span className="font-medium text-zinc-100 tracking-tight text-base">TechRush Studio</span>
          </div>
          <div className="text-xs text-zinc-500 font-mono bg-zinc-900 border border-zinc-800/80 px-3 py-1 rounded-full">
            Single-Page Evaluation
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        
        {/* Title Header */}
        <section className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">Submission Evaluator</h1>
          <p className="text-zinc-400 text-sm">
            Enter candidate details and submission text below to run automated evaluation on this page.
          </p>
        </section>

        {/* Input Form Section */}
        <form onSubmit={handleEvaluate} className="space-y-5">
          <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-6 space-y-5">
            
            {/* Candidate Name Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-amber-500" />
                Candidate / Team Identifier
              </label>
              <input
                type="text"
                value={candidateName}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setCandidateName(e.target.value)}
                placeholder="e.g. Team Alpha / Candidate #1042"
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition"
              />
            </div>

            {/* Submission Content Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-amber-500" />
                Submission Content / Response Data *
              </label>
              <textarea
                rows={8}
                value={submissionContent}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setSubmissionContent(e.target.value)}
                placeholder="Paste technical answer, project details, or code snippet here..."
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-3.5 text-sm font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition resize-y"
                required
              />
            </div>

            {/* Criteria Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
                Evaluation Rubric / Focus Areas (Optional)
              </label>
              <textarea
                rows={3}
                value={evaluationCriteria}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setEvaluationCriteria(e.target.value)}
                placeholder="Specify key scoring parameters or guidelines..."
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-3.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition resize-y"
              />
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3.5 rounded-lg bg-red-950/30 border border-red-800/40 flex items-center gap-2.5 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Bottom Bar with Evaluate Trigger */}
            <div className="pt-2 flex items-center justify-between border-t border-zinc-800/50">
              <span className="text-xs text-zinc-500">Ready for automated evaluation</span>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium px-5 py-2.5 rounded-lg transition flex items-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Evaluate</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </>
                )}
              </button>
            </div>

          </div>
        </form>

        {/* Unified Results Display (Inline on same page) */}
        {evaluationResults && (
          <section id="evaluation-results" className="space-y-5 pt-4 border-t border-zinc-800/80 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-amber-500 uppercase tracking-wider">Evaluation Output</span>
                <h2 className="text-xl font-medium text-zinc-100">Score Summary</h2>
              </div>
              <div className="bg-zinc-900 border border-zinc-800 px-4 py-2 rounded-lg flex items-center gap-2">
                <span className="text-xs text-zinc-400">Total Score:</span>
                <span className="text-lg font-bold font-mono text-amber-400">{evaluationResults.overallScore}/100</span>
              </div>
            </div>

            {/* Overview Box */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Assessment Overview
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {evaluationResults.summary}
              </p>
            </div>

            {/* Metric Score Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluationResults.metrics?.map((metric: MetricScore, idx: number) => (
                <div key={idx} className="bg-zinc-900/30 border border-zinc-800/80 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-200">{metric.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300 border border-zinc-700">
                      {metric.score} / {metric.max}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-800/80 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${(metric.score / metric.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-zinc-400">{metric.comment}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
