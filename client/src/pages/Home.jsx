import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCurrentUser } from "../services/auth.api.js";
import { listJobs } from "../services/jobs.api.js";
import useAuthStore from "../store/authStore.js";

function formatEmploymentType(value = "") {
  return value.toLowerCase().replaceAll("_", " ");
}

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id;
  const logout = useAuthStore((state) => state.logout);
  const updateUser = useAuthStore((state) => state.updateUser);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listJobs()
      .then((items) => {
        if (active) setJobs(items);
      })
      .catch(() => {
        if (active) setError("We couldn’t load jobs right now. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!userId) return undefined;

    let active = true;
    getCurrentUser()
      .then(({ user: currentUser }) => {
        if (active) updateUser(currentUser);
      })
      .catch((requestError) => {
        if (active && [401, 404].includes(requestError.response?.status)) {
          void logout();
        }
      });

    return () => {
      active = false;
    };
  }, [userId, logout, updateUser]);

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" to="/">Mosaic<span>.</span></Link>
        <nav className="topbar-actions" aria-label="Account">
          {user ? (
            <>
              {user.role === "RECRUITER" && (
                <Link className="button button-quiet" to="/recruiter">Recruiter workspace</Link>
              )}
              {user.role === "CANDIDATE" && (
                <Link className="button button-quiet" to="/signup" state={{ defaultRole: "RECRUITER" }}>
                  Recruiter account
                </Link>
              )}
              <span className="account-label">{user.email} · {user.role.toLowerCase()}</span>
              <button className="button button-quiet" onClick={() => void logout()}>Log out</button>
            </>
          ) : (
            <>
              <Link className="button button-quiet" to="/login">Log in</Link>
              <Link className="button button-dark" to="/signup">Create account</Link>
            </>
          )}
        </nav>
      </header>

      <section className="hero-section">
        <p className="eyebrow">{user?.role === "RECRUITER" ? "Recruiter workspace" : "A clearer path to your next role"}</p>
        <h1>{user?.role === "RECRUITER" ? <>Help the right people<br /><span>find your next role.</span></> : <>Find work that<br /><span>fits the whole picture.</span></>}</h1>
        <p className="hero-copy">{user?.role === "RECRUITER" ? "Publish an opening and make it visible to candidates." : "Explore opportunities from teams looking for people like you."}</p>
        {user?.role === "RECRUITER" && <Link className="button button-dark hero-action" to="/recruiter">Post a job</Link>}
        <div className="job-count">{jobs.length} open {jobs.length === 1 ? "role" : "roles"}</div>
      </section>

      <section className="jobs-section" aria-labelledby="jobs-heading">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Opportunities</p>
            <h2 id="jobs-heading">Open positions</h2>
          </div>
        </div>

        {loading && <p className="notice">Loading open roles…</p>}
        {error && <p className="notice notice-error" role="alert">{error}</p>}
        {!loading && !error && jobs.length === 0 && (
          <div className="empty-state">
            <h3>{user?.role === "RECRUITER" ? "No roles posted yet" : "No open roles yet"}</h3>
            <p>{user?.role === "RECRUITER" ? "Create your first opening to make this page useful to candidates." : "Check back soon. New opportunities will appear here."}</p>
            {user?.role === "RECRUITER" && <Link className="text-link" to="/recruiter">Set up your company and post a role →</Link>}
          </div>
        )}

        <div className="job-grid">
          {jobs.map((job) => (
            <article className="job-card" key={job.id}>
              <div className="job-card-topline">
                <span className="company-mark" aria-hidden="true">
                  {(job.company?.name || "M").slice(0, 1).toUpperCase()}
                </span>
                <span className="job-type">{formatEmploymentType(job.employmentType)}</span>
              </div>
              <p className="company-name">{job.company?.name || "Company"}</p>
              <h3>{job.title}</h3>
              <p className="job-meta">{job.location}{job.company?.industry ? ` · ${job.company.industry}` : ""}</p>
              <Link className="text-link" to={`/jobs/${job.id}`}>
                View role <span aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <footer className="site-footer">Mosaic <span>·</span> Better matches, more meaningful work.</footer>
    </main>
  );
}
