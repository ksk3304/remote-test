"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function ReportPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(
        `/api/projects/${projectId}/export?format=markdown`
      );
      const text = await res.text();
      setMarkdown(text);
      setLoading(false);
    };
    fetchReport();
  }, [projectId]);

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "research_report.md";
    a.click();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    alert("コピーしました");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/projects/${projectId}`}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-bold flex-1">リサーチレポート</h1>
            <Button variant="secondary" size="sm" onClick={handleCopy}>
              コピー
            </Button>
            <Button size="sm" onClick={handleDownload}>
              ダウンロード
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8">
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {markdown}
          </pre>
        </div>
      </main>
    </div>
  );
}
