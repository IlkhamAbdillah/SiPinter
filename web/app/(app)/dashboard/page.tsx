import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="stack">
      <div className="page-head">
        <h1>Selamat datang, Monica!</h1>
        <p className="muted">
          Pantau progres koreksi Ujian Tengah Semester Komputasi Awan dalam satu
          ruang kerja.
        </p>
      </div>

      {/* Exam banner */}
      <div className="panel hero">
        <h2>Ujian Tengah Semester</h2>
        <p className="muted">Komputasi Awan · Kelas IF-5A</p>
        <p className="meta">[cal] Rabu, 16 Oktober</p>
      </div>

      {/* Stats */}
      <div className="stats">
        {[
          { n: "10", t: "Total mahasiswa", s: "Seluruh lembar diterima" },
          { n: "15", t: "Soal pilihan ganda", s: "Bobot 40 poin" },
          { n: "3", t: "Soal essai", s: "Bobot 60 poin" },
          { n: "100", t: "Nilai maksimal", s: "KKM 65" },
        ].map((c) => (
          <div className="panel stat" key={c.t}>
            <div className="between row">
              <span className="meta">{c.t}</span>
              <span className="chip">◦</span>
            </div>
            <div className="n">{c.n}</div>
            <div className="meta">{c.s}</div>
          </div>
        ))}
      </div>

      {/* Upload shortcut */}
      <div className="panel">
        <div className="row between center">
          <div className="row center" style={{ gap: 12 }}>
            <span className="avatar">↑</span>
            <div>
              <h3>Upload dokumen</h3>
              <p className="muted" style={{ margin: 0 }}>
                Unggah lembar soal, kunci jawaban, dan lembar kerja mahasiswa
                secara massal dalam format PDF.
              </p>
            </div>
          </div>
          <span className="chip info">9 file tersimpan</span>
        </div>
        <hr />
        <div className="row between center">
          <span className="meta" style={{ color: "var(--ok)" }}>
            Semua dokumen utama lengkap
          </span>
          <Link className="btn primary" href="/upload">
            → Upload dokumen
          </Link>
        </div>
      </div>

      {/* Rekap shortcut */}
      <div className="panel">
        <div className="row between center">
          <div className="row center" style={{ gap: 12 }}>
            <span className="avatar">▦</span>
            <div>
              <h3>Rekapitulasi nilai</h3>
              <p className="muted" style={{ margin: 0 }}>
                Tinjau distribusi nilai akhir dan unduh spreadsheet untuk
                integrasi portal akademik.
              </p>
            </div>
          </div>
          <span className="chip ok">7 nilai terverifikasi</span>
        </div>
        <hr />
        <div className="row between center">
          <span className="meta" style={{ color: "var(--warn)" }}>
            3 nilai menunggu konfirmasi
          </span>
          <Link className="btn primary" href="/rekapitulasi">
            → Lihat rekapitulasi
          </Link>
        </div>
      </div>
    </div>
  );
}
