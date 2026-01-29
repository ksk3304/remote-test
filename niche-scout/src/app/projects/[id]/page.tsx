"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Slider } from "@/components/ui/Slider";
import { PainPointsChart } from "@/components/charts/PainPointsChart";
import { ScoreRadarChart } from "@/components/charts/ScoreRadarChart";
import {
  calculateScore,
  determineDecision,
  KILL_CONDITIONS,
} from "@/lib/scoring";
import type {
  Project,
  Keyword,
  Competitor,
  Review,
  PainPoint,
  Monetization,
  Decision,
} from "@/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [painPoints, setPainPoints] = useState<PainPoint[]>([]);
  const [monetizationList, setMonetizationList] = useState<Monetization[]>([]);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  // モーダル状態
  const [keywordModal, setKeywordModal] = useState(false);
  const [competitorModal, setCompetitorModal] = useState(false);
  const [painPointModal, setPainPointModal] = useState(false);
  const [monetizationModal, setMonetizationModal] = useState(false);
  const [decisionModal, setDecisionModal] = useState(false);
  const [csvModal, setCsvModal] = useState(false);
  const [reviewModal, setReviewModal] = useState<number | null>(null);

  // フォームデータ
  const [keywordForm, setKeywordForm] = useState({ keyword: "", intent: "" });
  const [competitorForm, setCompetitorForm] = useState({
    appName: "",
    storeUrl: "",
    priceType: "free" as "free" | "paid" | "sub",
    priceValue: "",
    lastUpdate: "",
    rating: "",
    painTop3: "",
    lowQualityEvidence: "",
    winningPoint: "",
  });
  const [painPointForm, setPainPointForm] = useState({
    tag: "",
    count: 1,
    representativeQuotes: "",
    fixIdea: "",
  });
  const [monetizationForm, setMonetizationForm] = useState({
    model: "one_time" as "one_time" | "sub",
    price: "",
    paywallTrigger: "",
    valueProposition: "",
  });
  const [csvText, setCsvText] = useState("");
  const [reviewForm, setReviewForm] = useState({
    star: 1,
    text: "",
    date: "",
  });
  const [killConditions, setKillConditions] = useState<string[]>([]);
  const [decisionReasons, setDecisionReasons] = useState("");
  const [nextActions, setNextActions] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [
      projectRes,
      keywordsRes,
      competitorsRes,
      painPointsRes,
      monetizationRes,
      decisionsRes,
    ] = await Promise.all([
      fetch(`/api/projects/${projectId}`),
      fetch(`/api/projects/${projectId}/keywords`),
      fetch(`/api/projects/${projectId}/competitors`),
      fetch(`/api/projects/${projectId}/pain-points`),
      fetch(`/api/projects/${projectId}/monetization`),
      fetch(`/api/projects/${projectId}/decisions`),
    ]);

    setProject(await projectRes.json());
    setKeywords(await keywordsRes.json());
    setCompetitors(await competitorsRes.json());
    setPainPoints(await painPointsRes.json());
    setMonetizationList(await monetizationRes.json());
    setDecisions(await decisionsRes.json());
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProject = async (updates: Partial<Project>) => {
    await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    fetchData();
  };

  const handleAddKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${projectId}/keywords`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keywordForm),
    });
    setKeywordForm({ keyword: "", intent: "" });
    setKeywordModal(false);
    fetchData();
  };

  const handleDeleteKeyword = async (id: number) => {
    await fetch(`/api/keywords/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${projectId}/competitors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...competitorForm,
        rating: competitorForm.rating
          ? parseFloat(competitorForm.rating)
          : null,
      }),
    });
    setCompetitorForm({
      appName: "",
      storeUrl: "",
      priceType: "free",
      priceValue: "",
      lastUpdate: "",
      rating: "",
      painTop3: "",
      lowQualityEvidence: "",
      winningPoint: "",
    });
    setCompetitorModal(false);
    fetchData();
  };

  const handleDeleteCompetitor = async (id: number) => {
    await fetch(`/api/competitors/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleCsvImport = async () => {
    await fetch(`/api/projects/${projectId}/competitors`, {
      method: "POST",
      headers: { "Content-Type": "text/csv" },
      body: csvText,
    });
    setCsvText("");
    setCsvModal(false);
    fetchData();
  };

  const handleAddPainPoint = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${projectId}/pain-points`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(painPointForm),
    });
    setPainPointForm({
      tag: "",
      count: 1,
      representativeQuotes: "",
      fixIdea: "",
    });
    setPainPointModal(false);
    fetchData();
  };

  const handleDeletePainPoint = async (id: number) => {
    await fetch(`/api/pain-points/${id}`, { method: "DELETE" });
    fetchData();
  };

  const handleAddMonetization = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`/api/projects/${projectId}/monetization`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(monetizationForm),
    });
    setMonetizationForm({
      model: "one_time",
      price: "",
      paywallTrigger: "",
      valueProposition: "",
    });
    setMonetizationModal(false);
    fetchData();
  };

  const handleAddReview = async (e: React.FormEvent, competitorId: number) => {
    e.preventDefault();
    await fetch(`/api/competitors/${competitorId}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reviewForm),
    });
    setReviewForm({ star: 1, text: "", date: "" });
    setReviewModal(null);
    fetchData();
  };

  const handleDecision = async () => {
    if (!project) return;
    const score = calculateScore(project);
    const decision = determineDecision(score, killConditions);

    await fetch(`/api/projects/${projectId}/decisions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision,
        scoreTotal: score.total,
        reasons: decisionReasons,
        nextActions,
      }),
    });
    setKillConditions([]);
    setDecisionReasons("");
    setNextActions("");
    setDecisionModal(false);
    fetchData();
  };

  const handleExport = async (format: "markdown" | "csv") => {
    const res = await fetch(
      `/api/projects/${projectId}/export?format=${format}`
    );
    if (format === "markdown") {
      const text = await res.text();
      const blob = new Blob([text], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${project?.title || "report"}.md`;
      a.click();
    } else {
      const data = await res.json();
      Object.entries(data).forEach(([filename, content]) => {
        const blob = new Blob([content as string], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
      });
    }
  };

  if (loading || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  const score = calculateScore(project);
  const latestDecision = decisions[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-500 hover:text-gray-700 transition-colors"
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
            <h1 className="text-xl font-bold text-gray-900 flex-1">
              {project.title}
            </h1>
            <div className="flex gap-2">
              <Link href={`/projects/${projectId}/report`}>
                <Button size="sm" className="bg-green-600 hover:bg-green-700">
                  レポートを見る
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport("csv")}
              >
                CSV
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExport("markdown")}
              >
                Markdown
              </Button>
              <Button size="sm" onClick={() => setDecisionModal(true)}>
                判定
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* スコアサマリー */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                総合スコア
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-gray-900">
                  {score.total}
                </div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${score.total >= 70 ? "bg-green-500" : "bg-yellow-500"}`}
                      style={{ width: `${score.total}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {score.total >= 70 ? "Go条件達成" : "70点以上でGo"}
                  </p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                ステータス
              </h3>
              <span
                className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                  project.status === "go"
                    ? "bg-green-100 text-green-800"
                    : project.status === "kill"
                      ? "bg-red-100 text-red-800"
                      : project.status === "research"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                }`}
              >
                {project.status.toUpperCase()}
              </span>
              {latestDecision && (
                <p className="text-xs text-gray-500 mt-2">
                  最終判定:{" "}
                  {new Date(latestDecision.decidedAt).toLocaleDateString(
                    "ja-JP"
                  )}
                </p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">
                次のアクション
              </h3>
              <p className="text-sm text-gray-700">
                {latestDecision?.nextActions || "判定を行ってください"}
              </p>
            </div>
          </div>
        </div>

        <Tabs
          tabs={[
            {
              id: "niche",
              label: "ニッチ定義",
              content: (
                <NicheTab
                  project={project}
                  score={score}
                  onUpdate={updateProject}
                />
              ),
            },
            {
              id: "keywords",
              label: "キーワード",
              content: (
                <KeywordsTab
                  keywords={keywords}
                  onAdd={() => setKeywordModal(true)}
                  onDelete={handleDeleteKeyword}
                />
              ),
            },
            {
              id: "competitors",
              label: `競合(${competitors.length})`,
              content: (
                <CompetitorsTab
                  competitors={competitors}
                  onAdd={() => setCompetitorModal(true)}
                  onCsvImport={() => setCsvModal(true)}
                  onDelete={handleDeleteCompetitor}
                  onAddReview={(id) => setReviewModal(id)}
                />
              ),
            },
            {
              id: "pain-points",
              label: `不満タグ(${painPoints.length})`,
              content: (
                <PainPointsTab
                  painPoints={painPoints}
                  onAdd={() => setPainPointModal(true)}
                  onDelete={handleDeletePainPoint}
                />
              ),
            },
            {
              id: "monetization",
              label: "課金設計",
              content: (
                <MonetizationTab
                  monetization={monetizationList}
                  onAdd={() => setMonetizationModal(true)}
                />
              ),
            },
            {
              id: "decisions",
              label: "判定ログ",
              content: <DecisionsTab decisions={decisions} />,
            },
          ]}
        />
      </main>

      {/* キーワード追加モーダル */}
      <Modal
        isOpen={keywordModal}
        onClose={() => setKeywordModal(false)}
        title="キーワード追加"
      >
        <form onSubmit={handleAddKeyword} className="space-y-4">
          <Input
            label="キーワード"
            value={keywordForm.keyword}
            onChange={(e) =>
              setKeywordForm({ ...keywordForm, keyword: e.target.value })
            }
            required
          />
          <Input
            label="検索意図"
            value={keywordForm.intent}
            onChange={(e) =>
              setKeywordForm({ ...keywordForm, intent: e.target.value })
            }
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setKeywordModal(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </div>
        </form>
      </Modal>

      {/* 競合追加モーダル */}
      <Modal
        isOpen={competitorModal}
        onClose={() => setCompetitorModal(false)}
        title="競合追加"
        size="lg"
      >
        <form onSubmit={handleAddCompetitor} className="space-y-4">
          <Input
            label="アプリ名"
            value={competitorForm.appName}
            onChange={(e) =>
              setCompetitorForm({ ...competitorForm, appName: e.target.value })
            }
            required
          />
          <Input
            label="ストアURL"
            value={competitorForm.storeUrl}
            onChange={(e) =>
              setCompetitorForm({ ...competitorForm, storeUrl: e.target.value })
            }
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="価格タイプ"
              options={[
                { value: "free", label: "無料" },
                { value: "paid", label: "買い切り" },
                { value: "sub", label: "サブスク" },
              ]}
              value={competitorForm.priceType}
              onChange={(e) =>
                setCompetitorForm({
                  ...competitorForm,
                  priceType: e.target.value as "free" | "paid" | "sub",
                })
              }
            />
            <Input
              label="価格"
              value={competitorForm.priceValue}
              onChange={(e) =>
                setCompetitorForm({
                  ...competitorForm,
                  priceValue: e.target.value,
                })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="最終更新日"
              type="date"
              value={competitorForm.lastUpdate}
              onChange={(e) =>
                setCompetitorForm({
                  ...competitorForm,
                  lastUpdate: e.target.value,
                })
              }
            />
            <Input
              label="評価"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={competitorForm.rating}
              onChange={(e) =>
                setCompetitorForm({ ...competitorForm, rating: e.target.value })
              }
            />
          </div>
          <Textarea
            label="不満Top3"
            value={competitorForm.painTop3}
            onChange={(e) =>
              setCompetitorForm({ ...competitorForm, painTop3: e.target.value })
            }
            rows={2}
          />
          <Textarea
            label="品質低い根拠"
            value={competitorForm.lowQualityEvidence}
            onChange={(e) =>
              setCompetitorForm({
                ...competitorForm,
                lowQualityEvidence: e.target.value,
              })
            }
            rows={2}
          />
          <Input
            label="勝てる一点"
            value={competitorForm.winningPoint}
            onChange={(e) =>
              setCompetitorForm({
                ...competitorForm,
                winningPoint: e.target.value,
              })
            }
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setCompetitorModal(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </div>
        </form>
      </Modal>

      {/* CSVインポートモーダル */}
      <Modal
        isOpen={csvModal}
        onClose={() => setCsvModal(false)}
        title="CSVインポート"
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ヘッダー行:
            App名,URL,価格タイプ(free/paid/sub),価格,最終更新日,評価,インストール数,不満Top3,品質低い根拠,勝てる一点,メモ
          </p>
          <Textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            rows={10}
            placeholder="CSVをここに貼り付け..."
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setCsvModal(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleCsvImport}>インポート</Button>
          </div>
        </div>
      </Modal>

      {/* 不満タグ追加モーダル */}
      <Modal
        isOpen={painPointModal}
        onClose={() => setPainPointModal(false)}
        title="不満タグ追加"
      >
        <form onSubmit={handleAddPainPoint} className="space-y-4">
          <Input
            label="タグ"
            value={painPointForm.tag}
            onChange={(e) =>
              setPainPointForm({ ...painPointForm, tag: e.target.value })
            }
            required
          />
          <Input
            label="件数"
            type="number"
            min="1"
            value={painPointForm.count}
            onChange={(e) =>
              setPainPointForm({
                ...painPointForm,
                count: parseInt(e.target.value),
              })
            }
          />
          <Textarea
            label="代表的なコメント"
            value={painPointForm.representativeQuotes}
            onChange={(e) =>
              setPainPointForm({
                ...painPointForm,
                representativeQuotes: e.target.value,
              })
            }
            rows={2}
          />
          <Textarea
            label="改善案"
            value={painPointForm.fixIdea}
            onChange={(e) =>
              setPainPointForm({ ...painPointForm, fixIdea: e.target.value })
            }
            rows={2}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setPainPointModal(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </div>
        </form>
      </Modal>

      {/* 課金モデル追加モーダル */}
      <Modal
        isOpen={monetizationModal}
        onClose={() => setMonetizationModal(false)}
        title="課金モデル追加"
      >
        <form onSubmit={handleAddMonetization} className="space-y-4">
          <Select
            label="モデル"
            options={[
              { value: "one_time", label: "買い切り" },
              { value: "sub", label: "サブスクリプション" },
            ]}
            value={monetizationForm.model}
            onChange={(e) =>
              setMonetizationForm({
                ...monetizationForm,
                model: e.target.value as "one_time" | "sub",
              })
            }
          />
          <Input
            label="価格"
            value={monetizationForm.price}
            onChange={(e) =>
              setMonetizationForm({ ...monetizationForm, price: e.target.value })
            }
          />
          <Textarea
            label="課金トリガー"
            value={monetizationForm.paywallTrigger}
            onChange={(e) =>
              setMonetizationForm({
                ...monetizationForm,
                paywallTrigger: e.target.value,
              })
            }
            rows={2}
          />
          <Textarea
            label="価値提案"
            value={monetizationForm.valueProposition}
            onChange={(e) =>
              setMonetizationForm({
                ...monetizationForm,
                valueProposition: e.target.value,
              })
            }
            rows={2}
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setMonetizationModal(false)}
            >
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </div>
        </form>
      </Modal>

      {/* レビュー追加モーダル */}
      <Modal
        isOpen={reviewModal !== null}
        onClose={() => setReviewModal(null)}
        title="レビュー追加"
      >
        <form
          onSubmit={(e) => reviewModal && handleAddReview(e, reviewModal)}
          className="space-y-4"
        >
          <Select
            label="星評価"
            options={[
              { value: "1", label: "★1" },
              { value: "2", label: "★2" },
            ]}
            value={reviewForm.star.toString()}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, star: parseInt(e.target.value) })
            }
          />
          <Textarea
            label="レビュー内容"
            value={reviewForm.text}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, text: e.target.value })
            }
            rows={4}
          />
          <Input
            label="日付"
            type="date"
            value={reviewForm.date}
            onChange={(e) =>
              setReviewForm({ ...reviewForm, date: e.target.value })
            }
          />
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setReviewModal(null)}
            >
              キャンセル
            </Button>
            <Button type="submit">追加</Button>
          </div>
        </form>
      </Modal>

      {/* 判定モーダル */}
      <Modal
        isOpen={decisionModal}
        onClose={() => setDecisionModal(false)}
        title="Go/Kill 判定"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-2">現在のスコア: {score.total}点</h4>
            <p className="text-sm text-gray-600">
              {score.total >= 70
                ? "スコアはGo条件を満たしています"
                : "スコアがGo条件（70点）に達していません"}
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Kill条件チェック</h4>
            <div className="space-y-2">
              {KILL_CONDITIONS.map((condition) => (
                <label
                  key={condition.id}
                  className="flex items-start gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={killConditions.includes(condition.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setKillConditions([...killConditions, condition.id]);
                      } else {
                        setKillConditions(
                          killConditions.filter((id) => id !== condition.id)
                        );
                      }
                    }}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-sm">{condition.label}</div>
                    <div className="text-xs text-gray-500">
                      {condition.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-lg bg-gray-50">
            <h4 className="font-medium mb-2">判定結果</h4>
            <p
              className={`text-lg font-bold ${determineDecision(score, killConditions) === "go" ? "text-green-600" : "text-red-600"}`}
            >
              {determineDecision(score, killConditions).toUpperCase()}
            </p>
          </div>

          <Textarea
            label="判定理由"
            value={decisionReasons}
            onChange={(e) => setDecisionReasons(e.target.value)}
            rows={3}
          />

          <Textarea
            label="次のアクション"
            value={nextActions}
            onChange={(e) => setNextActions(e.target.value)}
            rows={3}
          />

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setDecisionModal(false)}
            >
              キャンセル
            </Button>
            <Button onClick={handleDecision}>判定を保存</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// タブコンポーネント
function NicheTab({
  project,
  score,
  onUpdate,
}: {
  project: Project;
  score: ReturnType<typeof calculateScore>;
  onUpdate: (updates: Partial<Project>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    nicheDesc: project.nicheDesc || "",
    targetUser: project.targetUser || "",
    scoreDemand: project.scoreDemand || 50,
    scoreCompetition: project.scoreCompetition || 50,
    scoreImprovement: project.scoreImprovement || 50,
    scoreDifferentiation: project.scoreDifferentiation || 50,
    scoreImplementation: project.scoreImplementation || 50,
  });

  const handleSave = () => {
    onUpdate(form);
    setEditing(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium">ニッチ定義</h3>
            {!editing && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                編集
              </Button>
            )}
          </div>
          {editing ? (
            <div className="space-y-4">
              <Textarea
                label="ニッチ説明"
                value={form.nicheDesc}
                onChange={(e) => setForm({ ...form, nicheDesc: e.target.value })}
                rows={4}
              />
              <Textarea
                label="ターゲットユーザー"
                value={form.targetUser}
                onChange={(e) =>
                  setForm({ ...form, targetUser: e.target.value })
                }
                rows={2}
              />
              <div className="space-y-3">
                <Slider
                  label="需要（入口の明確さ）"
                  min={0}
                  max={100}
                  value={form.scoreDemand}
                  onChange={(e) =>
                    setForm({ ...form, scoreDemand: parseInt(e.target.value) })
                  }
                />
                <Slider
                  label="競争（大手密度）"
                  min={0}
                  max={100}
                  value={form.scoreCompetition}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      scoreCompetition: parseInt(e.target.value),
                    })
                  }
                />
                <Slider
                  label="改善余地（不満の反復性）"
                  min={0}
                  max={100}
                  value={form.scoreImprovement}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      scoreImprovement: parseInt(e.target.value),
                    })
                  }
                />
                <Slider
                  label="差別化の明快さ"
                  min={0}
                  max={100}
                  value={form.scoreDifferentiation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      scoreDifferentiation: parseInt(e.target.value),
                    })
                  }
                />
                <Slider
                  label="実装容易性（2週間）"
                  min={0}
                  max={100}
                  value={form.scoreImplementation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      scoreImplementation: parseInt(e.target.value),
                    })
                  }
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setEditing(false)}>
                  キャンセル
                </Button>
                <Button onClick={handleSave}>保存</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">ジャンル</p>
                <p>{project.genre}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ニッチ説明</p>
                <p>{project.nicheDesc || "未設定"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ターゲットユーザー</p>
                <p>{project.targetUser || "未設定"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-medium mb-4">スコア内訳</h3>
        <ScoreRadarChart score={score} />
      </div>
    </div>
  );
}

function KeywordsTab({
  keywords,
  onAdd,
  onDelete,
}: {
  keywords: Keyword[];
  onAdd: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">キーワード（ASO）</h3>
        <Button size="sm" onClick={onAdd}>
          追加
        </Button>
      </div>
      {keywords.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          キーワードが登録されていません
        </div>
      ) : (
        <div className="divide-y">
          {keywords.map((keyword) => (
            <div
              key={keyword.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{keyword.keyword}</p>
                {keyword.intent && (
                  <p className="text-sm text-gray-500">{keyword.intent}</p>
                )}
              </div>
              <button
                onClick={() => onDelete(keyword.id)}
                className="text-gray-400 hover:text-red-500"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompetitorsTab({
  competitors,
  onAdd,
  onCsvImport,
  onDelete,
  onAddReview,
}: {
  competitors: Competitor[];
  onAdd: () => void;
  onCsvImport: () => void;
  onDelete: (id: number) => void;
  onAddReview: (id: number) => void;
}) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">競合アプリ</h3>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onCsvImport}>
            CSV貼り付け
          </Button>
          <Button size="sm" onClick={onAdd}>
            追加
          </Button>
        </div>
      </div>
      {competitors.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          競合が登録されていません
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  アプリ名
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  価格
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  評価
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  更新日
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  不満Top3
                </th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">
                  勝てる一点
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {competitors.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {c.storeUrl ? (
                      <a
                        href={c.storeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {c.appName}
                      </a>
                    ) : (
                      c.appName
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {c.priceType === "free"
                        ? "無料"
                        : c.priceType === "paid"
                          ? "買い切り"
                          : "サブスク"}
                    </span>
                    {c.priceValue && (
                      <span className="ml-1">{c.priceValue}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {c.rating ? `★${c.rating}` : "-"}
                  </td>
                  <td className="px-4 py-3">{c.lastUpdate || "-"}</td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {c.painTop3 || "-"}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {c.winningPoint || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onAddReview(c.id)}
                        className="text-gray-400 hover:text-blue-500"
                        title="レビュー追加"
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
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDelete(c.id)}
                        className="text-gray-400 hover:text-red-500"
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
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PainPointsTab({
  painPoints,
  onAdd,
  onDelete,
}: {
  painPoints: PainPoint[];
  onAdd: () => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">不満タグ一覧</h3>
          <Button size="sm" onClick={onAdd}>
            追加
          </Button>
        </div>
        {painPoints.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            不満タグが登録されていません
          </div>
        ) : (
          <div className="divide-y max-h-96 overflow-y-auto">
            {painPoints.map((p) => (
              <div key={p.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.tag}</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                        {p.count}件
                      </span>
                    </div>
                    {p.representativeQuotes && (
                      <p className="text-sm text-gray-500 mt-1">
                        &ldquo;{p.representativeQuotes}&rdquo;
                      </p>
                    )}
                    {p.fixIdea && (
                      <p className="text-sm text-green-600 mt-1">
                        改善案: {p.fixIdea}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDelete(p.id)}
                    className="text-gray-400 hover:text-red-500"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="bg-white rounded-lg border p-4">
        <h3 className="font-medium mb-4">不満タグTop10</h3>
        <PainPointsChart painPoints={painPoints} />
      </div>
    </div>
  );
}

function MonetizationTab({
  monetization,
  onAdd,
}: {
  monetization: Monetization[];
  onAdd: () => void;
}) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-medium">課金モデル</h3>
        <Button size="sm" onClick={onAdd}>
          追加
        </Button>
      </div>
      {monetization.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          課金モデルが登録されていません
        </div>
      ) : (
        <div className="divide-y">
          {monetization.map((m) => (
            <div key={m.id} className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`px-2 py-1 text-xs font-medium rounded ${m.model === "one_time" ? "bg-green-100 text-green-800" : "bg-purple-100 text-purple-800"}`}
                >
                  {m.model === "one_time" ? "買い切り" : "サブスク"}
                </span>
                {m.price && <span className="font-medium">{m.price}</span>}
              </div>
              {m.paywallTrigger && (
                <p className="text-sm text-gray-600 mb-1">
                  課金トリガー: {m.paywallTrigger}
                </p>
              )}
              {m.valueProposition && (
                <p className="text-sm text-gray-600">
                  価値提案: {m.valueProposition}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function DecisionsTab({ decisions }: { decisions: Decision[] }) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-medium">判定ログ</h3>
      </div>
      {decisions.length === 0 ? (
        <div className="p-8 text-center text-gray-500">判定がありません</div>
      ) : (
        <div className="divide-y">
          {decisions.map((d) => (
            <div key={d.id} className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className={`px-3 py-1 text-sm font-bold rounded ${d.decision === "go" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                >
                  {d.decision.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  スコア: {d.scoreTotal}点
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(d.decidedAt).toLocaleString("ja-JP")}
                </span>
              </div>
              {d.reasons && (
                <p className="text-sm text-gray-600 mb-1">理由: {d.reasons}</p>
              )}
              {d.nextActions && (
                <p className="text-sm text-gray-600">
                  次のアクション: {d.nextActions}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
