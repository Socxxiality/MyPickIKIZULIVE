"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { domToBlob } from "modern-screenshot";
import CommunityPicks from "@/components/CommunityPicks";
import ExportBoards, { type Picks } from "@/components/ExportBoards";
import PreviewModal from "@/components/PreviewModal";
import SongPicker from "@/components/SongPicker";
import {
  MEMBERS,
  SONG_BY_SLUG,
  songsForBucket,
  type Song,
  type SongBucket,
} from "@/lib/catalog";

type Lang = "en" | "ja";
type View = "picker" | "community";

interface ActivePicker {
  bucket: SongBucket;
  slot: string;
  label: string;
  color: string;
}

const copy = {
  en: {
    subtitle: "Choose the songs that make your IKIZULIVE! story.",
    group: "Group songs",
    groupHelp: "Choose your top three songs by いきづらい部！",
    project: "Project songs",
    projectHelp: "Units, aliases, and collaboration songs.",
    members: "Member solo picks",
    membersHelp: "Choose one song for each of the ten members.",
    name: "Your name (optional)",
    download: "Download images",
    pickerTab: "Build my picks",
    communityTab: "Community Picks",
    clear: "Clear all",
    selected: "selected",
  },
  ja: {
    subtitle: "あなたのイキヅライブ！お気に入り楽曲を選ぼう。",
    group: "グループ楽曲",
    groupHelp: "いきづらい部！の楽曲から3曲を選択",
    project: "プロジェクト楽曲",
    projectHelp: "ユニット・別名義・コラボ楽曲から3曲を選択",
    members: "メンバーソロ",
    membersHelp: "10人それぞれのお気に入り楽曲を1曲ずつ選択",
    name: "名前（任意）",
    download: "画像をダウンロード",
    pickerTab: "選曲を作る",
    communityTab: "みんなの選曲",
    clear: "すべてクリア",
    selected: "曲選択済み",
  },
} satisfies Record<Lang, Record<string, string>>;

const STORAGE_KEY = "ikizulive_mypicks_v1";
const NAME_KEY = "ikizulive_mypick_name";

function SongSlot({
  slot,
  placeholder,
  color,
  picks,
  onOpen,
}: {
  slot: string;
  placeholder: string;
  color: string;
  picks: Picks;
  onOpen: () => void;
}) {
  const song = SONG_BY_SLUG[picks[slot]];
  return (
    <button className={`song-slot${song ? " filled" : ""}`} onClick={onOpen} style={{ "--slot-color": color } as React.CSSProperties}>
      {song ? (
        <>
          <img src={song.cover} alt="" />
          <span>
            <strong>{song.title}</strong>
            <small>{song.artist}</small>
          </span>
        </>
      ) : (
        <span className="song-placeholder">
          <b>＋</b>
          {placeholder}
        </span>
      )}
    </button>
  );
}

export default function MyPickApp() {
  const [picks, setPicks] = useState<Picks>({});
  const [name, setName] = useState("");
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<View>("picker");
  const [active, setActive] = useState<ActivePicker | null>(null);
  const [previews, setPreviews] = useState<{ first: string; second: string } | null>(null);
  const [showTitles, setShowTitles] = useState(true);
  const [transparent, setTransparent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const urls = useRef<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Picks;
        const cleaned = Object.fromEntries(
          Object.entries(parsed).filter(([, slug]) => Boolean(SONG_BY_SLUG[slug])),
        );
        setPicks(cleaned);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned));
      }
      setName(localStorage.getItem(NAME_KEY) ?? "");
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const savePicks = useCallback((next: Picks) => {
    setPicks(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const updateName = (value: string) => {
    setName(value);
    localStorage.setItem(NAME_KEY, value);
  };

  const selectedCount = Object.keys(picks).length;
  const t = copy[lang];

  const pickerSongs = useMemo(
    () => (active ? songsForBucket(active.bucket) : []),
    [active],
  );
  const unavailable = useMemo(() => {
    if (!active) return new Set<string>();
    return new Set(
      Object.entries(picks)
        .filter(([slot]) => slot !== active.slot && slot.startsWith(`${active.bucket}#`))
        .map(([, slug]) => slug),
    );
  }, [active, picks]);

  const closePreviews = useCallback(() => {
    for (const url of urls.current) URL.revokeObjectURL(url);
    urls.current = [];
    setPreviews(null);
  }, []);

  const generate = useCallback(async () => {
    setGenerating(true);
    try {
      if (document.fonts?.ready) await document.fonts.ready;
      await new Promise((resolve) => setTimeout(resolve, 80));
      const options = {
        scale: 2,
        timeout: 20000,
        type: "image/webp",
        quality: 0.92,
      } as const;
      const first = await domToBlob(document.getElementById("export-songs")!, options);
      const second = await domToBlob(document.getElementById("export-members")!, options);
      for (const url of urls.current) URL.revokeObjectURL(url);
      const next = [URL.createObjectURL(first), URL.createObjectURL(second)];
      urls.current = next;
      setPreviews({ first: next[0], second: next[1] });
    } catch (error) {
      console.error(error);
      window.alert("Could not generate the images. Please try again.");
    } finally {
      setGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (!previews) return;
    const timer = window.setTimeout(generate, 100);
    return () => window.clearTimeout(timer);
  }, [generate, showTitles, transparent]);

  useEffect(() => () => {
    for (const url of urls.current) URL.revokeObjectURL(url);
  }, []);

  const chooseSong = (song: Song) => {
    if (!active) return;
    savePicks({ ...picks, [active.slot]: song.slug });
    setActive(null);
  };

  const clearAll = () => {
    if (!selectedCount || window.confirm("Clear every selection?")) {
      savePicks({});
    }
  };

  return (
    <main className="page-shell">
      <div className="top-spectrum">
        {MEMBERS.map((member) => <i key={member.id} style={{ background: member.color }} />)}
      </div>

      <header className="site-header">
        <div>
          <small>イキヅライブ！ LOVELIVE! BLUEBIRD</small>
          <h1>MY PICK <span>IKIZULIVE!</span></h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="language-toggle" aria-label="Language">
          <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "ja" ? "active" : ""} onClick={() => setLang("ja")}>日本語</button>
        </div>
      </header>

      <nav className="view-tabs" aria-label="Page sections">
        <button className={view === "picker" ? "active" : ""} onClick={() => setView("picker")}>
          <span>01</span>{t.pickerTab}
        </button>
        <button className={view === "community" ? "active" : ""} onClick={() => setView("community")}>
          <span>02</span>{t.communityTab}
        </button>
      </nav>

      <div className={view === "picker" ? "" : "view-hidden"}>
        <section className="control-panel">
        <label>
          <span>{t.name}</span>
          <input value={name} maxLength={40} onChange={(event) => updateName(event.target.value)} placeholder="Selected by..." />
        </label>
        <div className="control-actions">
          <span><strong>{selectedCount}</strong> / 16 {t.selected}</span>
          <button className="secondary-button" onClick={clearAll} disabled={!selectedCount}>{t.clear}</button>
          <button className="primary-button" onClick={generate} disabled={generating || !selectedCount}>
            {generating ? "Generating..." : t.download}
          </button>
        </div>
        </section>

        <section className="selection-sheet">
        <header className="section-heading">
          <div>
            <small>01</small>
            <h2>{t.group}</h2>
          </div>
          <p>{t.groupHelp}</p>
        </header>
        <div className="feature-card group-card">
          <div className="feature-label">
            <strong>いきづらい部！</strong>
            <span>IKIZULIVE!</span>
          </div>
          <div className="three-slots">
            {[0, 1, 2].map((index) => (
              <SongSlot
                key={index}
                slot={`group#${index}`}
                placeholder={`PICK #${index + 1}`}
                color="#2397d4"
                picks={picks}
                onOpen={() => setActive({ bucket: "group", slot: `group#${index}`, label: `${t.group} #${index + 1}`, color: "#2397d4" })}
              />
            ))}
          </div>
        </div>

        <header className="section-heading spaced">
          <div>
            <small>02</small>
            <h2>{t.project}</h2>
          </div>
          <p>{t.projectHelp}</p>
        </header>
        <div className="feature-card project-card">
          <div className="feature-label">
            <strong>PROJECT</strong>
            <span>UNIT · ALIAS · COLLAB</span>
          </div>
          <div className="three-slots">
            {[0, 1, 2].map((index) => (
              <SongSlot
                key={index}
                slot={`project#${index}`}
                placeholder={`PICK #${index + 1}`}
                color="#6f67c5"
                picks={picks}
                onOpen={() => setActive({ bucket: "project", slot: `project#${index}`, label: `${t.project} #${index + 1}`, color: "#6f67c5" })}
              />
            ))}
          </div>
        </div>

        <header className="section-heading spaced">
          <div>
            <small>03</small>
            <h2>{t.members}</h2>
          </div>
          <p>{t.membersHelp}</p>
        </header>
        <div className="member-grid">
          {MEMBERS.map((member, index) => (
            <article className="member-card" key={member.id} style={{ "--member-color": member.color } as React.CSSProperties}>
              <header>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <strong>{lang === "ja" ? member.nameJa : member.name}</strong>
                  <small>{lang === "ja" ? member.name : member.nameJa}</small>
                </div>
              </header>
              <SongSlot
                slot={`${member.id}#0`}
                placeholder="PICK SONG"
                color={member.color}
                picks={picks}
                onOpen={() => setActive({ bucket: member.id, slot: `${member.id}#0`, label: member.nameJa, color: member.color })}
              />
            </article>
          ))}
        </div>
        </section>
      </div>

      <CommunityPicks active={view === "community"} lang={lang} picks={picks} />

      <footer className="site-footer">
        <div className="footer-brand">
          <strong>MY PICK IKIZULIVE!</strong>
          <span>Unofficial fan selection board</span>
          <span className="footer-credit">Developed by <b>SCX</b></span>
          <span className="footer-credit">Deployed by <b>Jayjayli</b></span>
        </div>
        <div className="footer-meta">
          <p>
            Song titles and cover images belong to their respective rights holders.
            Catalog based on the official IKIZULIVE! music pages.
          </p>
          <p className="footer-inspired">
            Inspired by{" "}
            <a href="https://github.com/rurimegu/MyPickHasunosora" target="_blank" rel="noreferrer">
              MyPickHasunosora
            </a>
            ,{" "}
            <a href="https://aqours-mypick.ccwu.cc/" target="_blank" rel="noreferrer">
              MyPickAqours
            </a>
            , and{" "}
            <a href="https://github.com/naufaruuu/mypick-nijigaku" target="_blank" rel="noreferrer">
              MyPickNijigasaki
            </a>
            .
          </p>
        </div>
      </footer>

      {active && (
        <SongPicker
          label={active.label}
          color={active.color}
          songs={pickerSongs}
          currentSlug={picks[active.slot]}
          unavailable={unavailable}
          onClose={() => setActive(null)}
          onSelect={chooseSong}
          onClear={picks[active.slot] ? () => {
            const next = { ...picks };
            delete next[active.slot];
            savePicks(next);
            setActive(null);
          } : undefined}
        />
      )}

      <ExportBoards picks={picks} name={name} showTitles={showTitles} transparent={transparent} />

      {previews && (
        <PreviewModal
          images={previews}
          showTitles={showTitles}
          transparent={transparent}
          generating={generating}
          onToggleTitles={setShowTitles}
          onToggleTransparent={setTransparent}
          onClose={closePreviews}
        />
      )}
    </main>
  );
}
