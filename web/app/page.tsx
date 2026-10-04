import Link from "next/link";

export default function Home() {
  return (
    <main style={{ maxWidth: 560, margin: "80px auto", padding: 24 }}>
      <div className="panel stack">
        <div>
          <h1>SiPinter — Wireframe</h1>
          <p className="muted">
            Low-fidelity wireframe. Pick a screen to preview.
          </p>
        </div>
        <hr />
        <div className="col">
          <strong className="meta">AUTH</strong>
          <Link className="btn block" href="/login">
            Login
          </Link>
          <Link className="btn block" href="/signup">
            Sign up
          </Link>
          <strong className="meta" style={{ marginTop: 8 }}>
            APP
          </strong>
          <Link className="btn block" href="/dashboard">
            Dashboard
          </Link>
          <Link className="btn block" href="/upload">
            Upload Dokumen
          </Link>
          <Link className="btn block" href="/review">
            Review &amp; Koreksi OCR
          </Link>
          <Link className="btn block" href="/penilaian">
            Penilaian AI
          </Link>
          <Link className="btn block" href="/rekapitulasi">
            Rekapitulasi Nilai
          </Link>
          <Link className="btn block" href="/rekapitulasi/245678">
            Detail Nilai Mahasiswa
          </Link>
        </div>
      </div>
    </main>
  );
}
