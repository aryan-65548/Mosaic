import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createCompany, getMyCompanies } from "../services/companies.api.js";
import { createJob, getMyJobs } from "../services/jobs.api.js";
import useAuthStore from "../store/authStore.js";

const emptyCompany = { name: "", industry: "", size: "" };
const emptyJob = {
  title: "",
  description: "",
  location: "",
  employmentType: "FULL_TIME",
  salaryMin: "",
  salaryMax: "",
};

export default function RecruiterDashboard() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [companies, setCompanies] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [companyId, setCompanyId] = useState("");
  const [companyForm, setCompanyForm] = useState(emptyCompany);
  const [jobForm, setJobForm] = useState(emptyJob);
  const [loading, setLoading] = useState(true);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (user?.role !== "RECRUITER") return undefined;

    let active = true;
    Promise.all([getMyCompanies(), getMyJobs()])
      .then(([ownedCompanies, ownedJobs]) => {
        if (!active) return;
        setCompanies(ownedCompanies);
        setJobs(ownedJobs);
        if (ownedCompanies.length) setCompanyId(ownedCompanies[0].id);
      })
      .catch((requestError) => {
        if (active) {
          setError(requestError.response?.data?.error || "Couldn’t load your recruiter workspace.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user?.role]);

  async function handleCreateCompany(event) {
    event.preventDefault();
    setSavingCompany(true);
    setError("");
    setNotice("");
    try {
      const company = await createCompany(Object.fromEntries(
        Object.entries(companyForm).filter(([, value]) => value.trim())
      ));
      setCompanies((current) => [company, ...current]);
      setCompanyId(company.id);
      setCompanyForm(emptyCompany);
      setNotice(`${company.name} is ready for job postings.`);
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Couldn’t create the company. Please try again.");
    } finally {
      setSavingCompany(false);
    }
  }

  async function handleCreateJob(event) {
    event.preventDefault();
    setSavingJob(true);
    setError("");
    setNotice("");
    const payload = {
      companyId,
      title: jobForm.title.trim(),
      description: jobForm.description.trim(),
      location: jobForm.location.trim(),
      employmentType: jobForm.employmentType,
    };
    if (jobForm.salaryMin) payload.salaryMin = Number(jobForm.salaryMin);
    if (jobForm.salaryMax) payload.salaryMax = Number(jobForm.salaryMax);

    try {
      const job = await createJob(payload);
      const company = companies.find((item) => item.id === companyId);
      setJobs((current) => [{ ...job, company }, ...current]);
      setJobForm(emptyJob);
      setNotice("Your job is live and visible in the open positions list.");
    } catch (requestError) {
      setError(requestError.response?.data?.error || "Couldn’t publish the job. Please try again.");
    } finally {
      setSavingJob(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <Link className="brand" to="/">Mosaic<span>.</span></Link>
        <nav className="topbar-actions" aria-label="Recruiter navigation">
          <Link className="button button-quiet" to="/">Browse roles</Link>
          {user ? (
            <>
              <span className="account-label">{user.email}</span>
              <button className="button button-quiet" onClick={() => void logout()}>Log out</button>
            </>
          ) : (
            <Link className="button button-dark" to="/login">Log in</Link>
          )}
        </nav>
      </header>

      <section className="workspace-heading">
        <p className="eyebrow">Recruiter workspace</p>
        <h1>Bring the right people<br /><span>into the picture.</span></h1>
        <p className="hero-copy">Set up your company and publish a role for candidates to discover.</p>
      </section>

      {!user && (
        <div className="notice notice-error" role="alert">
          Log in with a recruiter account to post a job. <Link to="/login">Log in</Link>
        </div>
      )}
      {user && user.role !== "RECRUITER" && (
        <div className="notice notice-error" role="alert">
          This workspace is for recruiter accounts. <Link to="/signup" state={{ defaultRole: "RECRUITER" }}>Create a recruiter account</Link>
        </div>
      )}
      {user?.role === "RECRUITER" && loading && <p className="notice">Loading your workspace…</p>}
      {user?.role === "RECRUITER" && error && <p className="notice notice-error" role="alert">{error}</p>}
      {user?.role === "RECRUITER" && notice && <p className="notice notice-success" role="status">{notice}</p>}

      {user?.role === "RECRUITER" && !loading && (
        <section className="workspace-grid">
          <div className="workspace-card">
            <p className="eyebrow">Step 1</p>
            <h2>Your company</h2>
            {companies.length > 0 && (
              <div className="field-group">
                <label htmlFor="company-select">Choose a company</label>
                <select id="company-select" value={companyId} onChange={(event) => setCompanyId(event.target.value)}>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
            )}
            <form className="workspace-form" onSubmit={handleCreateCompany}>
              <h3>{companies.length ? "Add another company" : "Create your first company"}</h3>
              <div className="field-group">
                <label htmlFor="company-name">Company name</label>
                <input id="company-name" value={companyForm.name} onChange={(event) => setCompanyForm({ ...companyForm, name: event.target.value })} required />
              </div>
              <div className="form-row">
                <div className="field-group">
                  <label htmlFor="company-industry">Industry</label>
                  <input id="company-industry" value={companyForm.industry} onChange={(event) => setCompanyForm({ ...companyForm, industry: event.target.value })} />
                </div>
                <div className="field-group">
                  <label htmlFor="company-size">Company size</label>
                  <input id="company-size" value={companyForm.size} onChange={(event) => setCompanyForm({ ...companyForm, size: event.target.value })} placeholder="e.g. 20–50" />
                </div>
              </div>
              <button className="button button-quiet" type="submit" disabled={savingCompany}>
                {savingCompany ? "Saving…" : "Save company"}
              </button>
            </form>
          </div>

          <div className="workspace-card">
            <p className="eyebrow">Step 2</p>
            <h2>Post a job</h2>
            {companies.length === 0 ? (
              <p className="application-note">Create a company first to enable job postings.</p>
            ) : (
              <form className="workspace-form" onSubmit={handleCreateJob}>
                <div className="field-group">
                  <label htmlFor="job-title">Job title</label>
                  <input id="job-title" value={jobForm.title} onChange={(event) => setJobForm({ ...jobForm, title: event.target.value })} required />
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label htmlFor="job-location">Location</label>
                    <input id="job-location" value={jobForm.location} onChange={(event) => setJobForm({ ...jobForm, location: event.target.value })} required />
                  </div>
                  <div className="field-group">
                    <label htmlFor="job-type">Employment type</label>
                    <select id="job-type" value={jobForm.employmentType} onChange={(event) => setJobForm({ ...jobForm, employmentType: event.target.value })}>
                      <option value="FULL_TIME">Full time</option>
                      <option value="PART_TIME">Part time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="field-group">
                    <label htmlFor="salary-min">Minimum salary (₹)</label>
                    <input id="salary-min" type="number" min="1" value={jobForm.salaryMin} onChange={(event) => setJobForm({ ...jobForm, salaryMin: event.target.value })} />
                  </div>
                  <div className="field-group">
                    <label htmlFor="salary-max">Maximum salary (₹)</label>
                    <input id="salary-max" type="number" min="1" value={jobForm.salaryMax} onChange={(event) => setJobForm({ ...jobForm, salaryMax: event.target.value })} />
                  </div>
                </div>
                <div className="field-group">
                  <label htmlFor="job-description">Description</label>
                  <textarea id="job-description" rows="6" value={jobForm.description} onChange={(event) => setJobForm({ ...jobForm, description: event.target.value })} required />
                </div>
                <button className="button button-dark" type="submit" disabled={savingJob || !companyId}>
                  {savingJob ? "Publishing…" : "Publish job"}
                </button>
              </form>
            )}
          </div>
        </section>
      )}

      {user?.role === "RECRUITER" && !loading && (
        <section className="workspace-jobs">
          <div className="section-heading">
            <div><p className="eyebrow">Your activity</p><h2>Posted jobs <span className="count-pill">{jobs.length}</span></h2></div>
          </div>
          {jobs.length === 0 ? (
            <div className="empty-state"><h3>No jobs posted yet</h3><p>Your published jobs will appear here.</p></div>
          ) : (
            <div className="posted-job-list">
              {jobs.map((job) => (
                <article className="posted-job" key={job.id}>
                  <div>
                    <p className="company-name">{job.company?.name}</p>
                    <h3>{job.title}</h3>
                    <p className="job-meta">{job.location} · {job.status.toLowerCase()}</p>
                  </div>
                  <Link className="text-link" to={`/jobs/${job.id}`}>View role →</Link>
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      <footer className="site-footer">Mosaic <span>·</span> Better matches, more meaningful work.</footer>
    </main>
  );
}
