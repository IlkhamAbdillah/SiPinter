import Link from "next/link";

export default function PenilaianPage() {
  return (
    <div className="stack">
      <div className="row between center page-head">
        <div>
          <h1>Penilaian AI</h1>
          <p className="muted">
            Analisis kecocokan jawaban menggunakan NLP, lalu tetapkan skor final
            dengan kendali dosen.
          </p>
        </div>
        <div className="field" style={{ width: 260 }}>
          <select defaultValue="245678">
            <option value="245678">245678 · Budi Susanti</option>
            <option value="245679">245679 · Andi Pratama</option>
          </select>
        </div>
      </div>

      {/* Top metrics */}
      <div className="grid-3">
        <div className="panel row center" style={{ gap: 16 }}>
          <div className="gauge">82%</div>
          <div>
            <strong>Ketepatan jawaban</strong>
            <div className="meta">16 dari 20 konsep terdeteksi benar</div>
            <span className="chip solid" style={{ marginTop: 6, display: "inline-block" }}>
              Di atas ambang 70%
            </span>
          </div>
        </div>
        <div className="panel row center" style={{ gap: 16 }}>
          <div className="gauge">74%</div>
          <div>
            <strong>Kesesuaian argumen</strong>
            <div className="meta">14 dari 20 indikator terpenuhi</div>
            <span className="chip solid" style={{ marginTop: 6, display: "inline-block" }}>
              Di atas ambang 70%
            </span>
          </div>
        </div>
        <div className="panel">
          <div className="row between center">
            <span className="meta">Rekomendasi skor AI</span>
            <span>✦</span>
          </div>
          <div className="n" style={{ fontSize: 36, fontWeight: 700 }}>
            80
          </div>
          <div className="meta">dari 100 · keyakinan model 88%</div>
        </div>
      </div>

      {/* NLP analysis */}
      <div className="panel row between center">
        <div className="row center" style={{ gap: 12 }}>
          <span className="avatar">✦</span>
          <div>
            <div className="row center" style={{ gap: 8 }}>
              <strong>Analisis NLP</strong>
              <span className="chip">2 bagian perlu perhatian</span>
            </div>
            <p className="muted" style={{ margin: "4px 0 0" }}>
              Jawaban menjelaskan karakteristik cloud dengan baik, tetapi
              perbandingan antara public cloud dan hybrid cloud belum lengkap.
              Periksa istilah &ldquo;resource pooling&rdquo; pada soal 2 dan contoh
              penerapan pada soal 3.
            </p>
          </div>
        </div>
        <button className="btn">⌖ Lihat penanda</button>
      </div>

      {/* Score breakdown */}
      <div className="row between center">
        <div>
          <h3>Rincian skor</h3>
          <span className="meta">
            Bobot dapat disesuaikan sebelum menyimpan nilai final.
          </span>
        </div>
        <button className="btn">⚙ Atur bobot</button>
      </div>
      <div className="grid-2">
        {[
          { t: "Skor final dari dosen", v: 90, s: "Konsistensi jawaban sangat baik." },
          { t: "Estimasi skor dari AI", v: 80, s: "Perlu tinjauan singkat pada bagian bertanda." },
          { t: "Kualitas analisis NLP", v: 82, s: "Perlu tinjauan singkat pada bagian bertanda." },
          { t: "Nilai essai", v: 90, s: "Konsistensi jawaban sangat baik.", label: "36/40" },
        ].map((b) => (
          <div className="panel" key={b.t}>
            <div className="row between center">
              <strong>{b.t}</strong>
              <span>{b.label ?? `${b.v}%`}</span>
            </div>
            <div className="bar" style={{ margin: "8px 0" }}>
              <span style={{ width: `${b.v}%` }} />
            </div>
            <span className="meta">{b.s}</span>
          </div>
        ))}
      </div>

      {/* Final score bar */}
      <div className="panel row between center">
        <div className="row center" style={{ gap: 12 }}>
          <span className="avatar">◉</span>
          <div>
            <span className="meta">Nilai final Budi Susanti</span>
            <div className="n">76 / 100</div>
          </div>
        </div>
        <div className="row">
          <button className="btn">⬓ Simpan draf</button>
          <Link className="btn primary" href="/rekapitulasi">
            → Lanjut ke rekapitulasi
          </Link>
        </div>
      </div>
    </div>
  );
}
