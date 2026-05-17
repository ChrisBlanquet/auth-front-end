// src/routes/AppRouter.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/Login/LoginPage';
import Menu from '../pages/Menu/Menu';
import ProtectedRoute from '../components/ProtectedRoute';
import PrivateLayout from '../components/PrivateLayout';
import Perfil from '../pages/Perfil/Perfil';
import GestionUsuarios from '../pages/Admin/GestionUsuarios';
import RoleGuard from '../components/RoleGuard';
import FormularioIncidencia from '../components/CrearIncidencia/FormularioIncidencia';
import MisReportes from '../components/Incidencias/MisReportes';
import AsignarResponsable from "../components/Incidencias/AsignarResponsable";
import CambiarEstado from '../components/Incidencias/CambiarEstado';
import GestionIncidencias from '../pages/Admin/GestionIncidencias';
import ReportesAdmin from '../pages/Admin/ReportesAdmin';

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
                <Route path="/mis-reportes" element={<MisReportes />} />
                <Route path="/admin/usuarios" element={
                    <RoleGuard rolesPermitidos={['ROLE_ADMIN', 'ROLE_SISTEMA']}>
                        <GestionUsuarios />
                    </RoleGuard>
                }
                />
                <Route path="/reportar-incidencia" element={
                    <RoleGuard rolesPermitidos={['ROLE_CIUDADANO', 'CIUDADANO']}>
                        <FormularioIncidencia />
                    </RoleGuard>
                } />

                <Route path="/admin/asignar-responsable" element={
                    <RoleGuard rolesPermitidos={['ROLE_ADMIN', 'ROLE_SISTEMA']}>
                        <AsignarResponsable />
                    </RoleGuard>
                } />

                <Route path="/admin/cambiar-estado" element={
                    <RoleGuard rolesPermitidos={['ROLE_ADMIN', 'ROLE_SISTEMA']}>
                        <CambiarEstado />
                    </RoleGuard>
                } />
                <Route path="/admin/incidencias" element={
                    <RoleGuard rolesPermitidos={['ROLE_ADMIN', 'ROLE_SISTEMA']}>
                        <GestionIncidencias />
                    </RoleGuard>
                } />

                <Route path="/admin/reportes" element={
                    <RoleGuard rolesPermitidos={['ROLE_ADMIN', 'ROLE_SISTEMA']}>
                        <ReportesAdmin />
                    </RoleGuard>
                } />

            </Route>


            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
};

export default AppRouter;