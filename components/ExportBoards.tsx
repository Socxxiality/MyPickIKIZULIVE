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

function ExportHeader({ section, page }: { section: string; page: string }) {
  return (
    <header className="export-header">
      <small>イキヅライブ！ LOVELIVE! BLUEBIRD</small>
      <h1>MY PICK <em>IKIZULIVE!</em></h1>
      <p>いきづらい部！ お気に入り楽曲選</p>
      <div>
        <span>{section}</span>
        <span>{page}</span>
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

function MemberRow({
  member,
  picks,
  showTitles,
}: {
  member: Member;
  picks: Picks;
  showTitles: boolean;
}) {
  return (
    <article className="export-member-row" style={{ borderColor: member.color }}>
      <div className="export-member-label" style={{ background: member.color }}>
        <strong>{member.name}</strong>
        <span>{member.nameJa}</span>
      </div>
      <Cover
        picks={picks}
        slot={`${member.id}#0`}
        placeholder="PICK"
        showTitles={showTitles}
        compact
      />
    </article>
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
        <ExportHeader section="GROUP & PROJECT SONGS" page="1 / 2" />
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

        <div className="export-note">
          <strong>10 MEMBER PICKS</strong>
          <span>Continue on page 2</span>
        </div>
        <ExportFooter name={name} />
      </section>

      <section id="export-members" className={boardClass}>
        <ExportHeader section="MEMBER SOLO PICKS" page="2 / 2" />
        <Spectrum />
        <div className="export-members-grid">
          {MEMBERS.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              picks={picks}
              showTitles={showTitles}
            />
          ))}
        </div>
        <ExportFooter name={name} />
      </section>
    </div>
  );
}
