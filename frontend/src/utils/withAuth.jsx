import { Navigate } from "react-router-dom";

const withAuth = (WrappedComponent) => {
  const AuthComponent = (props) => {
    const isAuthenticated = Boolean(localStorage.getItem("token"));

    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;