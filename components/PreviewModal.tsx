"use client";

interface PreviewModalProps {
  images: { first: string; second: string };
  showTitles: boolean;
  transparent: boolean;
  generating: boolean;
  onToggleTitles: (value: boolean) => void;
  onToggleTransparent: (value: boolean) => void;
  onClose: () => void;
}

function download(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
}

export default function PreviewModal({
  images,
  showTitles,
  transparent,
  generating,
  onToggleTitles,
  onToggleTransparent,
  onClose,
}: PreviewModalProps) {
  return (
    <div className="modal-shell preview-shell" role="dialog" aria-modal="true" aria-label="Image preview">
      <button className="modal-backdrop" aria-label="Close preview" onClick={onClose} />
      <section className="preview-panel">
        <header className="preview-header">
          <div>
            <strong>Your My Pick images</strong>
            <span>Two portrait boards, ready for sharing.</span>
          </div>
          <button className="icon-button dark" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>

        <div className="preview-images">
          <figure>
            <img src={images.first} alt="Group and project song board" />
            <button onClick={() => download(images.first, "mypick-ikizulive-songs.webp")}>
              Download songs
            </button>
          </figure>
          <figure>
            <img src={images.second} alt="Member song board" />
            <button onClick={() => download(images.second, "mypick-ikizulive-members.webp")}>
              Download members
            </button>
          </figure>
        </div>

        <footer className="preview-options">
          <label>
            <input
              type="checkbox"
              checked={showTitles}
              onChange={(event) => onToggleTitles(event.target.checked)}
            />
            Show song titles
          </label>
          <label>
            <input
              type="checkbox"
              checked={transparent}
              onChange={(event) => onToggleTransparent(event.target.checked)}
            />
            Transparent background
          </label>
          <button
            className="primary-button"
            disabled={generating}
            onClick={() => {
              download(images.first, "mypick-ikizulive-songs.webp");
              download(images.second, "mypick-ikizulive-members.webp");
            }}
          >
            {generating ? "Regenerating..." : "Download both"}
          </button>
        </footer>
      </section>
    </div>
  );
}
