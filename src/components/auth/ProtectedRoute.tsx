import React from 'react';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { isProfileComplete } from '@/utils/profile';

interface ProtectedRouteProps extends RouteProps {
  component: React.ComponentType<any>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  component: Component,
  ...rest
}) => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) {
          return <Redirect to="/auth" />;
        }

        const currentPath = props.location?.pathname || '';

        if (currentPath !== '/complete-profile' && !isProfileComplete(user)) {
          return <Redirect to="/complete-profile" />;
        }

        return <Component {...props} />;
      }}
    />
  );
};
