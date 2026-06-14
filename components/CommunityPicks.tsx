"use client";

import { useCallback, useEffect, useState } from "react";
import type { Picks } from "@/components/ExportBoards";
import {
  EMPTY_COMMUNITY_STATS,
  type CommunitySongStat,
  type CommunityStats,
} from "@/lib/community";

type Lang = "en" | "ja";

interface CommunityPicksProps {
  active: boolean;
  lang: Lang;
  picks: Picks;
}

const VOTER_KEY = "ikizulive_community_voter_v1";

const text = {
  en: {
    eyebrow: "ANONYMOUS COMMUNITY RESULTS",
    title: "Community",
    accent: "Picks",
    intro: "See which songs appear most often across submitted IKIZULIVE! boards.",
    ballots: "pick boards",
    selections: "song selections",
    updated: "last updated",
    submit: "Add my picks",
    update: "Update my picks",
    sending: "Saving...",
    saved: "Your anonymous community ballot has been saved.",
    empty: "No community ballots yet. Your picks can be the first.",
    group: "Group songs",
    project: "Project songs",
    members: "Member solo songs",
    note: "One current ballot per browser. Display names are never submitted or stored.",
    retry: "Could not load Community Picks.",
  },
  ja: {
    eyebrow: "匿名コミュニティ集計",
    title: "みんなの",
    accent: "選曲",
    intro: "投稿されたIKIZULIVE!のピックボードから、よく選ばれている楽曲を表示します。",
    ballots: "ピックボード",
    selections: "選曲数",
    updated: "最終更新",
    submit: "選曲を追加",
    update: "選曲を更新",
    sending: "保存中...",
    saved: "匿名のコミュニティ選曲を保存しました。",
    empty: "まだ投稿がありません。最初のピックを追加できます。",
    group: "グループ楽曲",
    project: "プロジェクト楽曲",
    members: "メンバーソロ楽曲",
    note: "ブラウザごとに最新の1票のみ集計します。表示名は送信・保存されません。",
    retry: "Community Picksを読み込めませんでした。",
  },
} satisfies Record<Lang, Record<string, string>>;

function getVoterId(): string {
  const existing = localStorage.getItem(VOTER_KEY);
  if (existing) return existing;
  const created = crypto.randomUUID();
  localStorage.setItem(VOTER_KEY, created);
  return created;
}

function RankingSection({
  title,
  color,
  songs,
  ballots,
}: {
  title: string;
  color: string;
  songs: CommunitySongStat[];
  ballots: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? songs : songs.slice(0, 5);

  return (
    <section className="community-ranking">
      <header>
        <i style={{ background: color }} />
        <h3>{title}</h3>
        <span>TOP {Math.min(5, songs.length) || 5}</span>
      </header>
      <div className="ranking-list">
        {visible.map((song, index) => (
          <article className="ranking-row" key={song.slug}>
            <b>{String(index + 1).padStart(2, "0")}</b>
            <img src={song.cover} alt="" />
            <div>
              <strong>{song.title}</strong>
              <small>{song.artist}</small>
              <span>
                <i
                  style={{
                    width: `${Math.max(song.percentage * 100, 2)}%`,
                    background: color,
                  }}
                />
              </span>
            </div>
            <p>
              <strong>{song.count}</strong>
              <small>{ballots ? `${(song.percentage * 100).toFixed(1)}%` : "0%"}</small>
            </p>
          </article>
        ))}
      </div>
      {songs.length > 5 && (
        <button className="ranking-expand" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show top 5" : `Show all ${songs.length}`}
        </button>
      )}
    </section>
  );
}

export default function CommunityPicks({ active, lang, picks }: CommunityPicksProps) {
  const [stats, setStats] = useState<CommunityStats>(EMPTY_COMMUNITY_STATS);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [notice, setNotice] = useState("");
  const t = text[lang];
  const selectedCount = Object.keys(picks).length;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/community", { cache: "no-store" });
      if (!response.ok) throw new Error("Request failed");
      setStats(await response.json() as CommunityStats);
      setNotice("");
    } catch {
      setNotice(t.retry);
    } finally {
      setLoading(false);
    }
  }, [t.retry]);

  useEffect(() => {
    if (active) void load();
  }, [active, load]);

  const submit = async () => {
    setSubmitting(true);
    setNotice("");
    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voterId: getVoterId(), picks }),
      });
      const body = await response.json() as CommunityStats | { error: string };
      if (!response.ok || "error" in body) {
        throw new Error("error" in body ? body.error : "Could not save ballot.");
      }
      setStats(body);
      setSubmitted(true);
      setNotice(t.saved);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : t.retry);
    } finally {
      setSubmitting(false);
    }
  };

  const updated = stats.updatedAt
    ? new Intl.DateTimeFormat(lang === "ja" ? "ja-JP" : "en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(stats.updatedAt))
    : "—";

  return (
    <section className={`community-sheet${active ? "" : " view-hidden"}`}>
      <header className="community-hero">
        <div>
          <small>{t.eyebrow}</small>
          <h2>{t.title} <em>{t.accent}</em></h2>
          <p>{t.intro}</p>
        </div>
        <button
          className="community-submit"
          disabled={!selectedCount || submitting}
          onClick={submit}
        >
          <span>{submitting ? t.sending : submitted ? t.update : t.submit}</span>
          <small>{selectedCount} / 16</small>
        </button>
      </header>

      <div className="community-stats">
        <article><strong>{stats.ballots.toLocaleString()}</strong><span>{t.ballots}</span></article>
        <article><strong>{stats.selections.toLocaleString()}</strong><span>{t.selections}</span></article>
        <article><strong className="date-stat">{updated}</strong><span>{t.updated}</span></article>
      </div>

      {notice && <p className="community-notice">{notice}</p>}

      {loading ? (
        <div className="community-loading">Loading Community Picks...</div>
      ) : stats.ballots === 0 ? (
        <div className="community-empty">
          <strong>COMMUNITY PICKS</strong>
          <p>{t.empty}</p>
        </div>
      ) : (
        <div className="community-grid">
          <RankingSection title={t.group} color="#2397d4" songs={stats.group} ballots={stats.ballots} />
          <RankingSection title={t.project} color="#6f67c5" songs={stats.project} ballots={stats.ballots} />
          <RankingSection title={t.members} color="#e2779d" songs={stats.members} ballots={stats.ballots} />
        </div>
      )}

      <p className="community-privacy">{t.note}</p>
    </section>
  );
}
