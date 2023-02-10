/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Chart as ChartJS,
  LinearScale,
  CategoryScale,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  LineController,
  BarController,
  Colors,
  ArcElement,
  PieController
} from 'chart.js';

import { GlobalStyles } from '../../styles/GlobalStyles';
import { Container, Content } from './styles';

import 'primereact/resources/themes/lara-light-indigo/theme.css';  //theme
import 'primereact/resources/primereact.min.css';                  //core css
import 'primeicons/primeicons.css';                                //icons

import { Router } from '../../Router';
import { Sidebar } from '../Sidebar';
import { useSearchParams } from 'react-router-dom';
import { createContext, useCallback, useEffect, useState } from 'react';
import { useFirstRender } from '../../hooks/useFirstRender';
import UserService from '../../services/UserService';
import { ToastContainer } from '../Toast/ToastContainer';

ChartJS.register(
  LinearScale,
  CategoryScale,
  ArcElement,
  BarElement,
  PointElement,
  LineElement,
  Legend,
  Tooltip,
  Colors,
  LineController,
  BarController,
  PieController,
);

ChartJS.defaults.color = '#CFD4D6';
ChartJS.defaults.borderColor = '#506167';
ChartJS.defaults.font = {
  family: 'Montserrat, sans-serif',
  size: 12,
  weight: '500',
};

interface UserContextType {
  hasPermission: (_params: PermissionType) => boolean;
}

export const UserContext: React.Context<UserContextType> = createContext({}) as any;

export function App() {
  const [permissions, setPermissions] = useState<PermissionType[]>([]);

  const isFirstRender = useFirstRender();

  const [query] = useSearchParams();
  const idUsuario = query.get('idUsuario');
  const databaseName = query.get('dbNome');

  useEffect(() => {
    async function loadData() {
      if (isFirstRender && idUsuario) {
        const permissionsData = await UserService.findPermissions(
          Number(idUsuario),
          databaseName ? databaseName : undefined
        );
        setPermissions([...permissionsData]);
      }
    }

    loadData();
  }, [idUsuario, isFirstRender, databaseName]);

  const hasPermission = useCallback((permissionCode: PermissionType) => {
    return permissions.includes(permissionCode);
  }, [permissions]);

  return (
    <UserContext.Provider value={{ hasPermission }}>
      <Container>
        <GlobalStyles />
        <Sidebar />
        <Content>
          <Router />
        </Content>
      </Container>
      <ToastContainer />
    </UserContext.Provider>
  );
}
