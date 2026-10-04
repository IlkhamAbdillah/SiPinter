import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="auth">
      <div className="art">[ ilustrasi ]</div>
      <div className="form-side">
        <div className="card panel stack">
          <div>
            <h2>Create an Account</h2>
            <p className="muted">Buat akun untuk mulai menilai ujian.</p>
          </div>

          <div>
            <label className="label">Full Name</label>
            <div className="field">
              <span className="ic">[&#9679;]</span>
              <input placeholder="Full Name" />
            </div>
          </div>

          <div>
            <label className="label">Email</label>
            <div className="field">
              <span className="ic">[@]</span>
              <input type="email" placeholder="Email" />
            </div>
          </div>

          <div>
            <label className="label">Password</label>
            <div className="field">
              <span className="ic">[&#8226;]</span>
              <input type="password" placeholder="Password" />
            </div>
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="field">
              <span className="ic">[&#8226;]</span>
              <input type="password" placeholder="Confirm Password" />
            </div>
          </div>

          <Link className="btn primary block" href="/dashboard">
            Sign Up
          </Link>

          <p className="meta" style={{ textAlign: "center" }}>
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
