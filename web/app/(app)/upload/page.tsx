const FILES = [
  { name: "mahasiswa_01_budi-susanti.pdf", pages: "1 halaman", status: "OCR selesai", pct: 100 },
  { name: "mahasiswa_02_andi-pratama.pdf", pages: "1 halaman", status: "OCR selesai", pct: 100 },
  { name: "mahasiswa_03_siti-nurhaliza.pdf", pages: "2 halaman", status: "OCR selesai", pct: 65 },
  { name: "mahasiswa_04_rafi-ahmad.pdf", pages: "1 halaman", status: "OCR diproses", pct: 42 },
  { name: "mahasiswa_05_dewi-lestari.pdf", pages: "1 halaman", status: "OCR diproses", pct: 28 },
  { name: "mahasiswa_06_agung-setiawan.pdf", pages: "1 halaman", status: "OCR diproses", pct: 18 },
];

export default function UploadPage() {
  return (
    <div className="stack">
      <div className="row between center page-head">
        <div>
          <h1>Upload Dokumen</h1>
          <p className="muted">
            Unggah dokumen PDF secara massal. Sistem memproses OCR pada seluruh
            dokumen yang diunggah.
          </p>
        </div>
        <button className="btn">? Panduan upload</button>
      </div>

      {/* Document type cards */}
      <div className="grid-3">
        {[
          { t: "Lembar soal", d: "Soal ujian untuk rujukan penilaian.", f: "soal_uts_cloud.pdf · lengkap" },
          { t: "Kunci jawaban", d: "Kunci standar dosen pengampu.", f: "kunci_uts_cloud.pdf · lengkap" },
          { t: "Lembar mahasiswa", d: "Jawaban seluruh peserta ujian.", f: "6 dari 10 file terunggah" },
        ].map((c) => (
          <div className="panel" key={c.t}>
            <div className="row between center">
              <strong>{c.t}</strong>
              <span className="meta">›</span>
            </div>
            <p className="muted" style={{ margin: "4px 0" }}>
              {c.d}
            </p>
            <p className="meta" style={{ margin: 0 }}>
              {c.f}
            </p>
          </div>
        ))}
      </div>

      {/* File list */}
      <div className="panel">
        <div className="row between center">
          <div>
            <h3>File lembar mahasiswa</h3>
            <span className="meta">6 file · maksimal 10 MB per file</span>
          </div>
          <div className="row">
            <button className="btn">+ Tambah file</button>
            <button className="btn">🗑 Hapus terpilih</button>
          </div>
        </div>
        <hr />
        <table>
          <thead>
            <tr>
              <th style={{ width: 24 }}>
                <input type="checkbox" aria-label="pilih semua" />
              </th>
              <th>Nama file</th>
              <th>Status OCR</th>
              <th style={{ width: 220 }}>Progres</th>
              <th>Diunggah</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {FILES.map((f) => (
              <tr key={f.name}>
                <td>
                  <input type="checkbox" aria-label={f.name} />
                </td>
                <td>
                  <div>{f.name}</div>
                  <span className="meta">{f.pages}</span>
                </td>
                <td>
                  <span className="chip">{f.status}</span>
                </td>
                <td>
                  <div className="row center" style={{ gap: 8 }}>
                    <div className="bar grow">
                      <span style={{ width: `${f.pct}%` }} />
                    </div>
                    <span className="meta">{f.pct}%</span>
                  </div>
                </td>
                <td className="meta">Hari ini, 09:42</td>
                <td>
                  <button className="btn sm">Pratinjau</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <div className="row between center meta">
          <span>Total file: 8 · Lembar soal: 1 · Kunci jawaban: 1 · Lembar mahasiswa: 6</span>
          <span>18.4 MB dari 100 MB</span>
        </div>
      </div>
    </div>
  );
}
