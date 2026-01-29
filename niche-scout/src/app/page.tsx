"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import type { Project, ProjectStatus } from "@/types";
import { calculateScore } from "@/lib/scoring";
import Link from "next/link";

const STATUS_OPTIONS = [
  { value: "", label: "すべて" },
  { value: "idea", label: "アイデア" },
  { value: "research", label: "リサーチ中" },
  { value: "go", label: "Go" },
  { value: "kill", label: "Kill" },
];

const SORT_OPTIONS = [
  { value: "updatedAt", label: "更新日順" },
  { value: "score", label: "スコア順" },
];

const STATUS_COLORS: Record<ProjectStatus, string> = {
  idea: "bg-gray-100 text-gray-800",
  research: "bg-yellow-100 text-yellow-800",
  go: "bg-green-100 text-green-800",
  kill: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<ProjectStatus, string> = {
  idea: "アイデア",
  research: "リサーチ中",
  go: "Go",
  kill: "Kill",
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    genre: "",
    nicheDesc: "",
    targetUser: "",
  });

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    params.set("sortBy", sortBy);

    const res = await fetch(`/api/projects?${params}`);
    const data = await res.json();
    setProjects(data);
    setLoading(false);
  }, [statusFilter, sortBy]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    setFormData({ title: "", genre: "", nicheDesc: "", targetUser: "" });
    setIsModalOpen(false);
    fetchProjects();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("この案件を削除しますか？")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  return (
    <div className="min-h-screen">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">NicheScout</h1>
            <Button onClick={() => setIsModalOpen(true)}>新規案件</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4 mb-6">
          <Select
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          />
          <Select
            options={SORT_OPTIONS}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-40"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">読み込み中...</div>
        ) : projects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">案件がありません</p>
            <Button onClick={() => setIsModalOpen(true)}>
              最初の案件を作成
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const score = calculateScore(project);
              return (
                <div
                  key={project.id}
                  className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-lg font-semibold text-gray-900 hover:text-blue-600"
                    >
                      {project.title}
                    </Link>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[project.status]}`}
                    >
                      {STATUS_LABELS[project.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{project.genre}</p>
                  {project.nicheDesc && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {project.nicheDesc}
                    </p>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${score.total >= 70 ? "bg-green-500" : "bg-yellow-500"}`}
                          style={{ width: `${score.total}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {score.total}点
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/projects/${project.id}/report`}
                      className="text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      レポートを見る
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="新規案件"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="タイトル"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            placeholder="例: 睡眠トラッカー特化型アプリ"
          />
          <Input
            label="ジャンル"
            value={formData.genre}
            onChange={(e) =>
              setFormData({ ...formData, genre: e.target.value })
            }
            required
            placeholder="例: ヘルスケア / 睡眠管理"
          />
          <Textarea
            label="ニッチ説明"
            value={formData.nicheDesc}
            onChange={(e) =>
              setFormData({ ...formData, nicheDesc: e.target.value })
            }
            rows={3}
            placeholder="誰が・いつ・何のために使うか"
          />
          <Textarea
            label="ターゲットユーザー"
            value={formData.targetUser}
            onChange={(e) =>
              setFormData({ ...formData, targetUser: e.target.value })
            }
            rows={2}
            placeholder="例: 不眠に悩む30代会社員"
          />
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">作成</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
