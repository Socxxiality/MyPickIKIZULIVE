import "server-only";

import { createHash } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { MEMBERS, SONG_BY_SLUG, type Song } from "@/lib/catalog";
import type { CommunitySongStat, CommunityStats } from "@/lib/community";

type Picks = Record<string, string>;

interface BallotRow {
  picks_json: string;
  updated_at: string;
}

const memberIds = new Set(MEMBERS.map((member) => member.id));
const validSlots = new Set([
  "group#0",
  "group#1",
  "group#2",
  "project#0",
  "project#1",
  "project#2",
  ...MEMBERS.map((member) => `${member.id}#0`),
]);

const globalCommunity = globalThis as typeof globalThis & {
  ikizuliveCommunityDb?: DatabaseSync;
  ikizuliveCommunityStatsCache?: {
    value: CommunityStats;
    expiresAt: number;
  };
};

function getDb(): DatabaseSync {
  if (globalCommunity.ikizuliveCommunityDb) {
    return globalCommunity.ikizuliveCommunityDb;
  }

  const dataDir = path.join(process.cwd(), "data");
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, "community-picks.sqlite3"));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA busy_timeout = 5000;
    CREATE TABLE IF NOT EXISTS ballots (
      voter_key TEXT PRIMARY KEY,
      picks_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  globalCommunity.ikizuliveCommunityDb = db;
  return db;
}

export function validatePicks(input: unknown): Picks {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Picks must be an object.");
  }

  const entries = Object.entries(input);
  if (entries.length < 1 || entries.length > 16) {
    throw new Error("A ballot must contain between 1 and 16 picks.");
  }

  const clean: Picks = {};
  const usedByBucket = new Map<string, Set<string>>();

  for (const [slot, slug] of entries) {
    if (!validSlots.has(slot) || typeof slug !== "string") {
      throw new Error("The ballot contains an invalid slot.");
    }

    const song = SONG_BY_SLUG[slug];
    const bucket = slot.split("#")[0];
    if (!song || song.bucket !== bucket) {
      throw new Error("A selected song does not belong to its slot.");
    }

    const used = usedByBucket.get(bucket) ?? new Set<string>();
    if (used.has(slug)) {
      throw new Error("The same song cannot be selected twice in one category.");
    }
    used.add(slug);
    usedByBucket.set(bucket, used);
    clean[slot] = slug;
  }

  return clean;
}

export function saveBallot(voterId: string, picks: Picks): void {
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(voterId)) {
    throw new Error("Invalid anonymous voter ID.");
  }

  const voterKey = createHash("sha256").update(voterId).digest("hex");
  getDb()
    .prepare(`
      INSERT INTO ballots (voter_key, picks_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(voter_key) DO UPDATE SET
        picks_json = excluded.picks_json,
        updated_at = excluded.updated_at
    `)
    .run(voterKey, JSON.stringify(picks), new Date().toISOString());
  globalCommunity.ikizuliveCommunityStatsCache = undefined;
}

export function deleteBallot(voterId: string): void {
  if (!/^[A-Za-z0-9_-]{8,100}$/.test(voterId)) {
    throw new Error("Invalid anonymous voter ID.");
  }

  const voterKey = createHash("sha256").update(voterId).digest("hex");
  getDb().prepare("DELETE FROM ballots WHERE voter_key = ?").run(voterKey);
  globalCommunity.ikizuliveCommunityStatsCache = undefined;
}

function categoryFor(song: Song): "group" | "project" | "members" {
  if (song.bucket === "group") return "group";
  if (song.bucket === "project") return "project";
  return memberIds.has(song.bucket) ? "members" : "members";
}

export function getCommunityStats(): CommunityStats {
  const now = Date.now();
  const cached = globalCommunity.ikizuliveCommunityStatsCache;
  if (cached && cached.expiresAt > now) return cached.value;

  const rows = getDb()
    .prepare("SELECT picks_json, updated_at FROM ballots ORDER BY updated_at DESC")
    .all() as unknown as BallotRow[];

  const tallies = {
    group: new Map<string, number>(),
    project: new Map<string, number>(),
    members: new Map<string, number>(),
  };
  let selections = 0;

  for (const row of rows) {
    let picks: Picks;
    try {
      picks = JSON.parse(row.picks_json) as Picks;
    } catch {
      continue;
    }

    for (const slug of Object.values(picks)) {
      const song = SONG_BY_SLUG[slug];
      if (!song) continue;
      const category = categoryFor(song);
      tallies[category].set(slug, (tallies[category].get(slug) ?? 0) + 1);
      selections += 1;
    }
  }

  const rank = (tally: Map<string, number>): CommunitySongStat[] =>
    [...tally.entries()]
      .map(([slug, count]) => {
        const song = SONG_BY_SLUG[slug];
        return {
          slug,
          title: song.title,
          artist: song.artist,
          cover: song.cover,
          count,
          percentage: rows.length ? count / rows.length : 0,
        };
      })
      .sort((a, b) => b.count - a.count || a.title.localeCompare(b.title, "ja"));

  const stats = {
    ballots: rows.length,
    selections,
    updatedAt: rows[0]?.updated_at ?? null,
    group: rank(tallies.group),
    project: rank(tallies.project),
    members: rank(tallies.members),
  };
  globalCommunity.ikizuliveCommunityStatsCache = {
    value: stats,
    expiresAt: now + 5_000,
  };
  return stats;
}
