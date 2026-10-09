const SOAL = [
  { n: 1, label: "Soal 1", type: "Pilihan ganda", mark: "✓", active: true },
  { n: 2, label: "Soal 2", type: "Pilihan ganda", mark: "⚠" },
  { n: 3, label: "Soal 3", type: "Essai", mark: "›" },
  { n: 4, label: "Soal 4", type: "Essai", mark: "›" },
];

export default function ReviewPage() {
  return (
    <div className="stack">
      <div className="row between center page-head">
        <div>
          <h1>Review &amp; Koreksi OCR</h1>
          <p className="muted">
            Bandingkan hasil OCR dengan dokumen asli, koreksi kesalahan
            pembacaan, dan pastikan teks siap dinilai.
          </p>
        </div>
        <div className="field" style={{ width: 260 }}>
          <select defaultValue="245678">
            <option value="245678">245678 · Budi Susanti</option>
            <option value="245679">245679 · Andi Pratama</option>
          </select>
        </div>
      </div>

      <div
        className="row"
        style={{ alignItems: "stretch", gap: 16 }}
      >
        {/* Column 1 — question list */}
        <div className="panel" style={{ width: 240, flex: "0 0 240px" }}>
          <h3>Daftar soal</h3>
          <span className="meta">1 dari 4 diverifikasi</span>
          <div className="col" style={{ marginTop: 12, gap: 8 }}>
            {SOAL.map((s) => (
              <div
                key={s.n}
                className="panel row between center"
                style={{
                  padding: 10,
                  background: s.active ? "var(--fill)" : "var(--panel)",
                }}
              >
                <div className="row center" style={{ gap: 10 }}>
                  <span className="avatar" style={{ width: 28, height: 28 }}>
                    {s.n}
                  </span>
                  <div>
                    <strong>{s.label}</strong>
                    <div className="meta">{s.type}</div>
                  </div>
                </div>
                <span
                  style={{
                    color:
                      s.mark === "✓"
                        ? "var(--ok)"
                        : s.mark === "⚠"
                        ? "var(--warn)"
                        : "var(--ink-faint)",
                  }}
                >
                  {s.mark}
                </span>
              </div>
            ))}
          </div>
          <hr />
          <span className="chip ok">Akurasi OCR 94%</span>
          <p className="meta" style={{ marginTop: 8 }}>
            Bagian berwarna perlu ditinjau sebelum konfirmasi.
          </p>
        </div>

        {/* Column 2 — original document */}
        <div className="panel grow">
          <div className="row between center">
            <div>
              <h3>Dokumen asli</h3>
              <span className="meta">mahasiswa_01.pdf</span>
            </div>
            <div className="row center meta" style={{ gap: 8 }}>
              <button className="btn sm">−</button>
              <span>88%</span>
              <button className="btn sm">+</button>
              <button className="btn sm">⤢</button>
            </div>
          </div>
          <hr />
          <div className="ph" style={{ padding: 24, minHeight: 420 }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid var(--line)",
                padding: 24,
              }}
            >
              <p style={{ textAlign: "center" }}>
                <strong>UJIAN TENGAH SEMESTER</strong>
                <br />
                <span className="meta">
                  Mata Kuliah: Komputasi Awan · Kelas IF-5A
                </span>
              </p>
              <p>
                <strong>1. Manakah yang merupakan contoh dari sistem operasi?</strong>
              </p>
              <p>A. Microsoft Word</p>
              <p>B. Windows</p>
              <p>C. Google Chrome</p>
              <p>D. Adobe Photoshop</p>
              <p className="chip warn">✎ Jawaban: B — Windows</p>
              <p style={{ marginTop: 16 }}>
                2. Jelaskan tiga karakteristik utama layanan cloud computing dan
                berikan satu contoh implementasinya.
              </p>
              <p className="muted">
                <em>
                  &ldquo;On-demand self service, resource pooling, dan measured
                  service...&rdquo;
                </em>
              </p>
            </div>
          </div>
          <hr />
          <div className="row between meta">
            <span>Halaman 1 / 1</span>
            <span>Gunakan ⌘ + scroll untuk memperbesar</span>
          </div>
        </div>

        {/* Column 3 — OCR result */}
        <div className="panel" style={{ width: 320, flex: "0 0 320px" }}>
          <div className="row between center">
            <div>
              <h3>Hasil OCR</h3>
              <span className="meta">Disimpan otomatis 2 menit lalu</span>
            </div>
            <span className="chip ok">Akurasi tinggi</span>
          </div>
          <hr />
          <div
            style={{
              padding: 10,
              marginBottom: 12,
              borderRadius: "var(--radius)",
              background: "var(--ok-soft)",
              color: "var(--ok)",
            }}
          >
            ✓ Teks pertanyaan terbaca dengan baik.
          </div>
          <div className="panel">
            <strong>1. Manakah yang merupakan contoh dari sistem operasi?</strong>
            <p style={{ margin: "8px 0 0" }}>A. Microsoft Word</p>
            <p style={{ margin: 0 }}>B. Windows</p>
            <p style={{ margin: 0 }}>C. Google Chrome</p>
            <p style={{ margin: 0 }}>D. Adobe Photoshop</p>
            <div
              className="row between center"
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: "var(--radius)",
                background: "var(--maroon-soft)",
                color: "var(--maroon)",
              }}
            >
              <span>Jawaban terdeteksi</span>
              <strong>B</strong>
            </div>
          </div>
          <p className="meta" style={{ marginTop: 12 }}>
            ✎ Tambahkan catatan koreksi bila diperlukan.
          </p>
          <div className="row" style={{ marginTop: 8 }}>
            <button className="btn grow">⚑ Tandai revisi</button>
            <button className="btn primary grow">✓ Konfirmasi</button>
          </div>
        </div>
      </div>
    </div>
  );
}
