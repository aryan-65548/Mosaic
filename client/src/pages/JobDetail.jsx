import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { applyToJob, getJob, getMyApplications } from "../services/jobs.api.js";
import useAuthStore from "../store/authStore.js";

function formatEmploymentType(value = "") {
  return value.toLowerCase().replaceAll("_", " ");
}

function formatSalary(min, max) {
  if (!min && !max) return null;
  const format = (amount) => `₹${amount.toLocaleString("en-IN")}`;
  if (min && max) return `${format(min)} – ${format(max)}`;
  return `${min ? "From" : "Up to"} ${format(min || max)}`;
}

export default function JobDetail() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user);
  const [jobState, setJobState] = useState({ id: null, job: null, loading: true, error: "" });
  const [applicationState, setApplicationState] = useState({ id: null, value: null });
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState("");

  useEffect(() => {
    let active = true;
    getJob(id)
      .then((result) => {
        if (active) setJobState({ id, job: result, loading: false, error: "" });
      })
      .catch((requestError) => {
        if (active) {
          setJobState({
            id,
            job: null,
            loading: false,
            error: requestError.response?.status === 404
              ? "This role couldn’t be found. It may have been removed."
              : "We couldn’t load this role. Please try again.",
          });
        }
      });

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    if (user?.role !== "CANDIDATE") return undefined;

    getMyApplications()
      .then((applications) => {
        if (active) {
          setApplicationState({ id, value: applications.find((item) => item.jobId === id) || null });
        }
      })
      .catch(() => {
        if (active) setApplicationState({ id, value: null });
      });

    return () => {
      active = false;
    };
  }, [id, user?.id, user?.role]);

  const job = jobState.id === id ? jobState.job : null;
  const loading = jobState.id !== id || jobState.loading;
  const error = jobState.id === id ? jobState.error : "";
  const application = user?.role === "CANDIDATE" && applicationState.id === id
    ? applicationState.value
    : null;

  async function handleApply() {
    setApplying(true);
    setApplyError("");
    try {
      const created = await applyToJob(id);
      setApplicationState({ id, value: created });
    } catch (requestError) {
      if (requestError.response?.status === 409) {
        setApplyError(requestError.response.data.error || "You’ve already applied to this role.");
        if (requestError.response.data.error?.includes("already applied")) {
          setApplicationState({ id, value: { status: "APPLIED" } });
        }
      } else {
        setApplyError(requestError.response?.data?.error || "We couldn’t submit your application. Please try again.");
      }
    } finally {
      setApplying(false);
    }
  }

  const salary = job ? formatSalary(job.salaryMin, job.salaryMax) : null;

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" to="/">Mosaic<span>.</span></Link>
        <Link className="button button-quiet" to="/">← All roles</Link>
      </header>

      {loading && <p className="notice">Loading role…</p>}
      {error && !job && <p className="notice notice-error" role="alert">{error}</p>}
      {job && (
        <section className="detail-layout">
          <div className="detail-main">
            <Link className="back-link" to="/">← Back to all roles</Link>
            <div className="detail-company-mark" aria-hidden="true">
              {(job.company?.name || "M").slice(0, 1).toUpperCase()}
            </div>
            <p className="company-name">{job.company?.name || "Company"}</p>
            <h1 className="detail-title">{job.title}</h1>
            <p className="detail-meta">
              {job.location} <span>·</span> {formatEmploymentType(job.employmentType)}
              {job.company?.industry && <><span>·</span> {job.company.industry}</>}
            </p>
            {salary && <p className="salary-range">{salary}</p>}

            <div className="description-block">
              <p className="eyebrow">About the role</p>
              <p className="job-description">{job.description}</p>
            </div>
          </div>

          <aside className="apply-panel">
            <p className="eyebrow">Interested?</p>
            <h2>Take the next step.</h2>
            {job.status !== "OPEN" ? (
              <p className="application-note">This role is no longer accepting applications.</p>
            ) : application ? (
              <div className="application-confirmation" role="status">
                <span className="status-check" aria-hidden="true">✓</span>
                <div>
                  <strong>Application received</strong>
                  <p>Status: {application.status?.toLowerCase() || "applied"}</p>
                </div>
              </div>
            ) : user?.role === "CANDIDATE" ? (
              <button className="button button-dark button-wide" onClick={handleApply} disabled={applying}>
                {applying ? "Submitting…" : "Apply for this role"}
              </button>
            ) : user ? (
              <p className="application-note">Sign in with a candidate account to apply.</p>
            ) : (
              <Link className="button button-dark button-wide" to="/login" state={{ from: `/jobs/${id}` }}>
                Log in to apply
              </Link>
            )}
            {applyError && <p className="inline-error" role="alert">{applyError}</p>}
            <p className="application-note">Your application status will appear here after you apply.</p>
          </aside>
        </section>
      )}

      <footer className="site-footer">Mosaic <span>·</span> Better matches, more meaningful work.</footer>
    </main>
  );
}
