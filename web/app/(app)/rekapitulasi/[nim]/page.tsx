import Link from "next/link";

const SOAL = [
  { no: "01", judul: "Model layanan cloud", tipe: "Pilihan ganda", ai: "10/10", final: "10/10", status: "Sesuai" },
  { no: "02", judul: "Virtualisasi", tipe: "Pilihan ganda", ai: "10/10", final: "10/10", status: "Sesuai" },
  { no: "03", judul: "Karakteristik cloud", tipe: "Essai", ai: "16/20", final: "18/20", status: "Dikoreksi" },
  { no: "04", judul: "Strategi deployment", tipe: "Essai", ai: "14/20", final: "16/20", status: "Dikoreksi" },
];

const RIWAYAT = [
  { t: "Nilai final disimpan", d: "Monica · hari ini, 10:24" },
  { t: "Skor essai dikoreksi", d: "34 menjadi 36 · hari ini, 10:18" },
  { t: "Analisis AI selesai", d: "Keyakinan model 88% · 09:56" },
  { t: "OCR terverifikasi", d: "Akurasi dokumen 94% · 09:42" },
  { t: "Laporan siap diunduh", d: "Menunggu sinkronisasi portal akademik" },
];

export default function DetailNilaiPage({
  params,
}: {
  params: { nim: string };
}) {
  return (
    <div className="stack">
      <div className="row between center page-head">
        <div>
          <h1>Detail Nilai Mahasiswa</h1>
          <p className="muted">
            Tinjau seluruh komponen nilai, riwayat koreksi, dan bukti verifikasi
            untuk satu mahasiswa.
          </p>
        </div>
        <div className="row">
          <Link className="btn" href="/rekapitulasi">
            ← Kembali
          </Link>
          <button className="btn">⬇ Unduh laporan</button>
        </div>
      </div>

      {/* Top summary cards */}
      <div className="grid-3">
        <div className="panel row center" style={{ gap: 12 }}>
          <span className="avatar">BS</span>
          <div>
            <strong>Budi Susanti</strong>
            <div className="meta">NIM {params.nim} · Informatika 2024</div>
            <div className="row" style={{ gap: 6, marginTop: 6 }}>
              <span className="chip">Kelas IF-5A</span>
              <span className="chip solid">Terverifikasi</span>
            </div>
          </div>
        </div>
        <div className="panel">
          <span className="meta">Nilai akhir</span>
          <div className="n">
            76 <span className="meta">/100</span>
          </div>
          <span className="chip solid">Lulus · predikat B</span>
        </div>
        <div className="panel">
          <span className="meta">Komposisi nilai</span>
          <h3>PG 40 · Essai 36</h3>
          <div className="bar" style={{ margin: "8px 0" }}>
            <span style={{ width: "76%" }} />
          </div>
          <span className="meta">KKM mata kuliah: 65</span>
        </div>
      </div>

      <div className="row" style={{ alignItems: "flex-start", gap: 16 }}>
        {/* Left: per-question table + note */}
        <div className="grow stack">
          <div className="panel">
            <div className="row between center">
              <div>
                <h3>Rincian per soal</h3>
                <span className="meta">
                  Skor AI dibandingkan dengan keputusan final dosen.
                </span>
              </div>
              <button className="btn sm">⬈ Buka lembar jawaban</button>
            </div>
            <hr />
            <table>
              <thead>
                <tr>
                  <th>Soal</th>
                  <th>Skor AI</th>
                  <th>Skor final</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {SOAL.map((s) => (
                  <tr key={s.no}>
                    <td>
                      <div className="row center" style={{ gap: 10 }}>
                        <span className="avatar" style={{ width: 28, height: 28 }}>
                          {s.no}
                        </span>
                        <div>
                          <strong>{s.judul}</strong>
                          <div className="meta">{s.tipe}</div>
                        </div>
                      </div>
                    </td>
                    <td className="meta">{s.ai}</td>
                    <td>
                      <strong>{s.final}</strong>
                    </td>
                    <td>
                      <span className="chip">{s.status}</span>
                    </td>
                    <td>
                      <button className="btn sm">Tinjau</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel row between center">
            <div className="row center" style={{ gap: 12 }}>
              <span className="avatar">❝</span>
              <div>
                <strong>Catatan dosen</strong>
                <p className="muted" style={{ margin: "4px 0 0" }}>
                  Pemahaman konsep baik. Skor essai dinaikkan karena contoh
                  implementasi hybrid cloud relevan meskipun istilah teknis belum
                  lengkap.
                </p>
              </div>
            </div>
            <button className="btn sm">✎ Edit catatan</button>
          </div>
        </div>

        {/* Right: verification status + activity log */}
        <div className="col" style={{ width: 320, flex: "0 0 320px" }}>
          <div className="panel">
            <div className="row between center">
              <h3>Status verifikasi</h3>
              <span className="chip solid">Selesai</span>
            </div>
            <div className="row between" style={{ margin: "8px 0" }}>
              <span className="meta">Kelengkapan proses</span>
              <strong>100%</strong>
            </div>
            <div className="bar">
              <span style={{ width: "100%" }} />
            </div>
            <hr />
            <p style={{ margin: 0 }}>✓ OCR dikonfirmasi</p>
            <p style={{ margin: 0 }}>✓ Skor AI ditinjau</p>
            <p style={{ margin: 0 }}>✓ Nilai final ditetapkan</p>
          </div>

          <div className="panel">
            <h3>Riwayat aktivitas</h3>
            <span className="meta">Jejak proses penilaian</span>
            <div className="col" style={{ gap: 12, marginTop: 12 }}>
              {RIWAYAT.map((r) => (
                <div key={r.t} className="row" style={{ gap: 10 }}>
                  <span aria-hidden>●</span>
                  <div>
                    <strong>{r.t}</strong>
                    <div className="meta">{r.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
