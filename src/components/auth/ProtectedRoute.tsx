import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect to="/auth" />
        )
      }
    />
  );
};
