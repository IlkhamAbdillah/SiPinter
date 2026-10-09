import Link from "next/link";

const ROWS = [
  { no: 1, nim: "245678", nama: "Budi Susanti", pg: 40, essai: 36, total: 76, status: "Lulus" },
  { no: 2, nim: "245679", nama: "Andi Pratama", pg: 38, essai: 32, total: 70, status: "Lulus" },
  { no: 3, nim: "245680", nama: "Siti Nurhaliza", pg: 36, essai: 30, total: 66, status: "Lulus" },
  { no: 4, nim: "245681", nama: "Rafi Ahmad", pg: 42, essai: 38, total: 80, status: "Lulus" },
  { no: 5, nim: "245682", nama: "Dewi Lestari", pg: 40, essai: 34, total: 74, status: "Lulus" },
  { no: 6, nim: "245683", nama: "Agung Setiawan", pg: 36, essai: 28, total: 64, status: "Tidak lulus" },
  { no: 7, nim: "245684", nama: "Maya Sari", pg: 44, essai: 40, total: 84, status: "Lulus" },
  { no: 8, nim: "245685", nama: "Fajar Nugroho", pg: 38, essai: 32, total: 70, status: "Lulus" },
];

export default function RekapitulasiPage() {
  return (
    <div className="stack">
      <div className="row between center page-head">
        <div>
          <h1>Rekapitulasi Nilai</h1>
          <p className="muted">
            Rekap nilai akhir setelah seluruh proses koreksi dan verifikasi.
            Unduh laporan untuk portal akademik.
          </p>
        </div>
        <button className="btn primary">⬇ Unduh Excel</button>
      </div>

      {/* Stats */}
      <div className="stats">
        {[
          { n: "75/100", t: "Rata-rata kelas", s: "+3,2 dari ujian sebelumnya" },
          { n: "90/100", t: "Nilai tertinggi", s: "Budi Susanti" },
          { n: "40/100", t: "Nilai terendah", s: "Perlu remedial" },
          { n: "9/10", t: "Kelulusan", s: "90% mencapai KKM" },
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

      {/* Filters */}
      <div className="row between center wrap">
        <div className="row">
          <div className="field" style={{ width: 280 }}>
            <span className="ic">⌕</span>
            <input placeholder="Cari NIM atau nama mahasiswa" />
          </div>
          <div className="field">
            <select defaultValue="all">
              <option value="all">Semua status</option>
              <option value="lulus">Lulus</option>
              <option value="tidak">Tidak lulus</option>
            </select>
          </div>
        </div>
        <div className="row center">
          <span className="meta" style={{ color: "var(--warn)" }}>
            8 dari 10 terverifikasi
          </span>
          <button className="btn">✓ Verifikasi semua</button>
        </div>
      </div>

      {/* Table */}
      <div className="panel">
        <div className="row between center">
          <h3>Tabel nilai akhir siswa</h3>
          <span className="meta">Terakhir diperbarui hari ini, 10:26</span>
        </div>
        <hr />
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>NIM</th>
              <th>Nama</th>
              <th>PG</th>
              <th>Essai</th>
              <th>Total</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.nim}>
                <td className="meta">{r.no}</td>
                <td>{r.nim}</td>
                <td>{r.nama}</td>
                <td>{r.pg}</td>
                <td>{r.essai}</td>
                <td>
                  <strong>{r.total}</strong>
                </td>
                <td>
                  <span
                    className={`chip ${r.status === "Lulus" ? "ok" : "danger"}`}
                  >
                    {r.status}
                  </span>
                </td>
                <td>
                  <Link className="btn sm" href={`/rekapitulasi/${r.nim}`}>
                    Lihat detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <hr />
        <div className="row between center">
          <span className="meta">Menampilkan 1–8 dari 10 mahasiswa</span>
          <div className="row">
            <button className="btn sm">‹</button>
            <button className="btn sm primary">1</button>
            <button className="btn sm">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
