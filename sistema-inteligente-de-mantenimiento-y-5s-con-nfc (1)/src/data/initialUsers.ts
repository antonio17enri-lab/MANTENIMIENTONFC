import { AppUser } from '../types';

export const INITIAL_USERS: AppUser[] = [
  {
    id: 'usr-admin',
    name: 'Administrador General',
    username: 'admin',
    role: 'admin',
    passwordHash: 'admin123',
    createdAt: '2024-01-01',
  },
  {
    id: 'usr-operador-1',
    name: 'Juan Pérez (Operario Torno)',
    username: 'operador',
    role: 'operador',
    passwordHash: 'operador123',
    assignedMachineCode: 'M-001',
    createdAt: '2024-01-15',
  },
  {
    id: 'usr-operador-2',
    name: 'Carlos Silva (Operario Fresado)',
    username: 'csilva',
    role: 'operador',
    passwordHash: 'silva2024',
    assignedMachineCode: 'M-002',
    createdAt: '2024-02-01',
  },
];
