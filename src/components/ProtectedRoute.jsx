import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from './LoadingScreen/LoadingScreen';

const ProtectedRoute = ({ children }) => {

    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <LoadingScreen />;
    }

    // 3. Si ya terminó de cargar y resulta que NO está autenticado, ahora sí lo regresamos al login
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;