import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RoleGuard = ({ rolesPermitidos, children }) => {
    const { rol, loading } = useAuth();

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                Validando permisos de acceso...
            </div>
        );
    }

    if (!rol || !rolesPermitidos.includes(rol)) {
        console.warn(`🔒 Acceso bloqueado. Tu rol es ${rol}, se requiere: ${rolesPermitidos.join(' o ')}`);
        return <Navigate to="/menu" replace />;
    }
    return children;
};

export default RoleGuard;