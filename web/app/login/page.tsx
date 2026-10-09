import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="auth">
      <div className="art">[ ilustrasi ]</div>
      <div className="form-side">
        <div className="card panel stack">
          <div>
            <h2>Login to Continue</h2>
            <p className="muted">Masuk untuk melanjutkan ke SiPinter.</p>
          </div>

          <div>
            <label className="label">Username</label>
            <div className="field">
              <span className="ic">[&#9679;]</span>
              <input placeholder="Username" />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="field">
              <span className="ic">[&#8226;]</span>
              <input type="password" placeholder="Password" />
            </div>
          </div>

          <Link className="btn accent block" href="/dashboard">
            Login
          </Link>

          <p className="meta" style={{ textAlign: "center" }}>
            Belum punya akun? <Link href="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
