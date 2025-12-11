
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useGraphStore } from "./store/graphStore";

// Role components
import { RoleSelection } from "./components/RoleSelection";
import { EducatorInterface } from "./components/Educator/EducatorInterface";
import { LearnerInterface } from "./components/Learner/LearnerInterface";
import { AdminInterface } from "./components/Admin/AdminInterface";

function App() {
  const { user } = useGraphStore();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Root route - role selection */}
          <Route
            path="/"
            element={
              !user.role ? (
                <RoleSelection />
              ) : (
                <Navigate to={`/${user.role}`} replace />
              )
            }
          />

          {/* Educator routes */}
          <Route
            path="/educator/*"
            element={
              user.role === 'educator' ? (
                <EducatorInterface />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Learner routes */}
          <Route
            path="/learner/*"
            element={
              user.role === 'learner' ? (
                <LearnerInterface />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              user.role === 'admin' ? (
                <AdminInterface />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch all - redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
