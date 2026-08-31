import { Link } from "react-router-dom";
import useAuthStore from "../store/authStore.js";

export default function Home() {
  const { user, logout } = useAuthStore();

  return (
    <div className="container">
      <h1>Mosaic</h1>
      {user ? (
        <div>
          <p>Logged in as {user.email} ({user.role})</p>
          <button onClick={logout}>Log Out</button>
        </div>
      ) : (
        <div>
          <p>You're not logged in.</p>
          <p className="link">
            <Link to="/login">Log in</Link> or <Link to="/signup">Sign up</Link>
          </p>
        </div>
      )}
    </div>
  );
}