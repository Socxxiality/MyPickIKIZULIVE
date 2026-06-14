"use client";

import { MEMBERS, SONG_BY_SLUG, type Member } from "@/lib/catalog";

export type Picks = Record<string, string>;

interface ExportBoardsProps {
  picks: Picks;
  name: string;
  showTitles: boolean;
  transparent: boolean;
}

const MEMBER_COLORS = MEMBERS.map((member) => member.color);

function Spectrum({ mutedFrom = 10 }: { mutedFrom?: number }) {
  return (
    <div className="export-spectrum">
      {MEMBER_COLORS.map((color, index) => (
        <i key={color} style={{ background: color, opacity: index >= mutedFrom ? 0.18 : 1 }} />
      ))}
    </div>
  );
}

function ExportHeader({ section }: { section: string }) {
  return (
    <header className="export-header">
      <small>イキヅライブ！ LOVELIVE! BLUEBIRD</small>
      <h1>MY PICK <em>IKIZULIVE!</em></h1>
      <p>いきづらい部！ お気に入り楽曲選</p>
      <div>
        <span>{section}</span>
      </div>
    </header>
  );
}

function ExportFooter({ name }: { name: string }) {
  return (
    <footer className="export-footer">
      <strong>UNOFFICIAL FAN SELECTION BOARD</strong>
      <span>{name.trim() ? `Selected by ${name.trim()}` : "MY PICK IKIZULIVE!"}</span>
    </footer>
  );
}

function Cover({
  picks,
  slot,
  placeholder,
  showTitles,
  compact = false,
}: {
  picks: Picks;
  slot: string;
  placeholder: string;
  showTitles: boolean;
  compact?: boolean;
}) {
  const song = SONG_BY_SLUG[picks[slot]];
  return (
    <div className={`export-cover${compact ? " compact" : ""}${song ? " filled" : ""}`}>
      {song ? (
        <>
          <img src={song.cover} alt="" />
          {showTitles && (
            <div className="export-cover-title">
              <strong>{song.title}</strong>
              <span>{song.artist}</span>
            </div>
          )}
        </>
      ) : (
        <span>{placeholder}</span>
      )}
    </div>
  );
}



export default function ExportBoards({
  picks,
  name,
  showTitles,
  transparent,
}: ExportBoardsProps) {
  const boardClass = `export-board${transparent ? " transparent" : ""}`;

  return (
    <div className="export-stage" aria-hidden>
      <section id="export-songs" className={boardClass}>
        <ExportHeader section="GROUP, PROJECT & SOLO SONGS" />
        <Spectrum />

        <div className="export-block group-block">
          <h2>いきづらい部！</h2>
          <div className="export-three">
            {[0, 1, 2].map((index) => (
              <Cover
                key={index}
                picks={picks}
                slot={`group#${index}`}
                placeholder={`#${index + 1}`}
                showTitles={showTitles}
              />
            ))}
          </div>
        </div>

        <div className="export-block project-block">
          <h2>PROJECT SONGS</h2>
          <div className="export-three">
            {[0, 1, 2].map((index) => (
              <Cover
                key={index}
                picks={picks}
                slot={`project#${index}`}
                placeholder={`#${index + 1}`}
                showTitles={showTitles}
              />
            ))}
          </div>
        </div>

        <div className="export-block solo-block">
          <h2>MEMBER SOLO SONGS</h2>
          <div className="export-three">
            {[0, 1, 2].map((index) => (
              <Cover
                key={index}
                picks={picks}
                slot={`solo#${index}`}
                placeholder={`#${index + 1}`}
                showTitles={showTitles}
              />
            ))}
          </div>
        </div>

        <ExportFooter name={name} />
      </section>
    </div>
  );
}
