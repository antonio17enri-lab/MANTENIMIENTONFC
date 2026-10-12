export type MachineStatus = 'OPERATIVA' | 'EN_REVISION' | 'PARADA_FALLA';

export interface MaintenanceRecord {
  id: string;
  date: string;
  type: 'Preventivo' | 'Correctivo' | 'Predictivo';
  technician: string;
  description: string;
  cost?: number; // Costo total
  partsCost?: number; // Costo en repuestos
  laborCost?: number; // Costo en mano de obra
  otherCost?: number; // Otros gastos (lubricantes, traslados, etc.)
  durationHours?: number;
  partsReplaced?: string[];
  photoUrl?: string;
  signatureUrl?: string;
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
  photoUrl?: string;
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
  signatureUrl?: string;
  photoUrl?: string;
}

export interface MachineDocument {
  id: string;
  title: string;
  type: 'manual' | 'diagram' | 'loto' | 'safety';
  filename: string;
  dateAdded: string;
  description: string;
}

export interface ProductionLog {
  id: string;
  date: string;
  hoursWorked: number; // ej. 135
  hoursStopped: number; // ej. 25
  stopReason?: string; // Falla mecánica, Falta de material, Mantenimiento preventivo, Ajuste, etc.
  unitsProduced: number; // ej. 540
  expectedUnits?: number; // ej. 600
  operator: string;
  notes?: string;
}

export interface BreakEvenConfig {
  fixedCostsMonthly: number; // Costos fijos mensuales ej. 15000
  salePricePerUnit: number; // Precio de venta por unidad ej. 50
  variableCostPerUnit: number; // Costo variable por unidad ej. 25
  currencySymbol: string; // 'Q'
}

export interface OperationalBudget {
  revenue: number; // Ingresos por producción ej. 45000
  rawMaterial: number; // Materia prima ej. 15000
  labor: number; // Mano de obra ej. 10000
  maintenance: number; // Mantenimiento ej. 3000
  energy: number; // Energía ej. 4000
  otherExpenses: number; // Otros gastos ej. 2000
  currencySymbol: string;
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
  // Production metrics
  productionMetrics?: {
    availableHours: number; // ej. 160
    workedHours: number; // ej. 135
    stoppedHours: number; // ej. 25
    producedUnits: number; // ej. 540
    expectedUnits: number; // ej. 600
  };
  productionHistory?: ProductionLog[];
  // Financial parameters per machine
  financials?: {
    monthlyFixedCost: number; // ej. 15000 (Costos fijos mensuales de la máquina)
    variableCostPerUnit: number; // ej. 25 (Costo de producción por unidad)
    salePricePerUnit: number; // ej. 50 (Precio de venta unitario)
    expectedUnitsPerMonth: number; // ej. 600 (Capacidad / producción esperada)
    // Control Presupuestario de Mantenimiento y Evaluación de Reemplazo
    maintenanceBudget?: number; // Presupuesto asignado para mantenimiento (anual o periodo), ej. 4000
    replacementEstimatedCost?: number; // Costo estimado de adquirir una máquina nueva de reemplazo, ej. 25000
    replacementAlertThresholdPct?: number; // Porcentaje límite para alerta de evaluación de reemplazo (default 70% o 80%)
  };
}

export type UserRole = 'admin' | 'operador';

export interface AppUser {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  passwordHash: string;
  assignedMachineCode?: string;
  createdAt: string;
}

export interface PlantStation {
  id: string;
  name: string;
  compliance5S: number; // 0-100
  machinesCount: number;
}
