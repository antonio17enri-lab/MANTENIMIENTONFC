export type MachineStatus = 'OPERATIVA' | 'EN_REVISION' | 'PARADA_FALLA';

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Preventivo' | 'Correctivo' | 'Predictivo';
  technician: string;
  description: string;
  cost?: number;
  durationHours?: number;
  partsReplaced?: string[];
}

export interface FailureReport {
  id: string;
  date: string;
  type: 'Mecánica' | 'Eléctrica' | 'Hidráulica' | 'Neumática' | 'Otras';
  severity: 'Baja' | 'Media' | 'Alta' | 'Crítica';
  description: string;
  reportedBy: string;
  status: 'Abierta' | 'En Proceso' | 'Solucionada';
  solutionNotes?: string;
}

export interface FiveSCategoryScore {
  category: 'Clasificación' | 'Orden' | 'Limpieza' | 'Estandarización' | 'Disciplina' | 'Seguridad';
  japaneseName: string;
  score: number; // 0 - 100
  criteria: {
    question: string;
    passed: boolean;
  }[];
}

export interface FiveSAudit {
  id: string;
  date: string;
  auditor: string;
  generalCompliance: number; // e.g. 85
  categories: FiveSCategoryScore[];
  observations?: string;
}

export interface MachineDocument {
  id: string;
  title: string;
  type: 'manual' | 'diagram' | 'loto' | 'safety';
  filename: string;
  dateAdded: string;
  description: string;
}

export interface Machine {
  id: string;
  code: string; // e.g. 'M-001'
  name: string; // e.g. 'Torno paralelo'
  category: string; // e.g. 'TORNO'
  brand: string; // e.g. 'NARDINI'
  model: string; // e.g. 'ND 250'
  year: number; // e.g. 2018
  location: string; // e.g. 'Área de mecanizado'
  stationId: string; // e.g. 'Estación 1'
  responsible: string; // e.g. 'Juan Pérez'
  description: string;
  status: MachineStatus;
  nextRevisionDate: string; // YYYY-MM-DD
  lastMaintenanceDate: string; // YYYY-MM-DD
  lastMaintenanceType: 'Preventivo' | 'Correctivo' | 'Predictivo';
  maintenanceHistory: MaintenanceRecord[];
  failures: FailureReport[];
  latest5S: FiveSAudit;
  documents: MachineDocument[];
  specs: {
    power?: string;
    rpm?: string;
    voltage?: string;
    weight?: string;
  };
  imageUrl?: string;
}

export interface PlantStation {
  id: string;
  name: string;
  compliance5S: number; // 0-100
  machinesCount: number;
}
