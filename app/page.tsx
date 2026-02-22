import Link from "next/link";
import { Upload, Scan, BarChart3, ArrowRight } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#1e3a5f]">MCQ Scanner</h1>
          <nav className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="text-slate-600 hover:text-[#1e3a5f] font-medium transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center h-10 px-4 rounded-lg bg-[#1e3a5f] text-white font-medium hover:bg-[#0f2744] transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
            Automated OMR Grading,{" "}
            <span className="text-[#1e3a5f]">Simplified</span>
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            Save hours of manual grading. MCQ Scanner scans OMR sheets, extracts
            answers, and delivers results in seconds. Perfect for educators and
            institutions.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center gap-2 h-12 px-6 rounded-lg bg-[#1e3a5f] text-white font-medium hover:bg-[#0f2744] transition-colors"
            >
              Start Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:border-[#1e3a5f] hover:text-[#1e3a5f] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-24 sm:mt-32">
          <h3 className="text-center text-2xl font-semibold text-slate-900 mb-12">
            How It Works
          </h3>
          <div className="grid sm:grid-cols-3 gap-8 sm:gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1e3a5f]/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-[#1e3a5f]" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">
                Upload
              </h4>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                Drag and drop OMR sheet images or capture them directly from your
                phone. Supports batch uploads.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1e3a5f]/10 flex items-center justify-center">
                <Scan className="h-8 w-8 text-[#1e3a5f]" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">
                Scan
              </h4>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                Our system detects roll numbers and marked answers automatically.
                Manual edit available for corrections.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#1e3a5f]/10 flex items-center justify-center">
                <BarChart3 className="h-8 w-8 text-[#1e3a5f]" />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">
                Result
              </h4>
              <p className="mt-2 text-slate-600 text-sm leading-relaxed">
                View results in a table, export to CSV or PDF, and share with
                students or administrators.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-24 sm:mt-32 text-center">
          <div className="inline-block rounded-2xl bg-slate-50 border border-slate-200 px-8 py-6">
            <p className="text-slate-700 font-medium">
              Ready to streamline your grading?
            </p>
            <Link
              href="/auth/signup"
              className="mt-3 inline-flex items-center gap-2 text-[#1e3a5f] font-semibold hover:underline"
            >
              Create your free account <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} MCQ Scanner. Automated OMR grading for educators.
        </div>
      </footer>
    </div>
  );
}
