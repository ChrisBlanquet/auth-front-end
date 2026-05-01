import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login/LoginPage';
import Menu from '../pages/Menu/Menu';
import ProtectedRoute from '../components/ProtectedRoute';
import PrivateLayout from '../components/PrivateLayout';
import Perfil from '../pages/Perfil/Perfil';
import GestionUsuarios from '../pages/Admin/GestionUsuarios';
import RoleGuard from '../components/RoleGuard';

const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />

            <Route 
                element={
                    <ProtectedRoute>
                        <PrivateLayout />
                    </ProtectedRoute>
                }
            >
                {/* Todas las rutas*/}
                <Route path="/menu" element={<Menu />} />
                <Route path="/perfil" element={<Perfil />} />
                <Route path="/admin/usuarios" element={
                    <RoleGuard rolesPermitidos={['ROLE_ADMIN', 'ROLE_SISTEMA']}>
                        <GestionUsuarios />
                    </RoleGuard>
                } 
            />


            </Route>


            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRouter;