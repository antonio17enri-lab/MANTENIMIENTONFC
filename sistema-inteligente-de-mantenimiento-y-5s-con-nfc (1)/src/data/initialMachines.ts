import { Machine, PlantStation } from '../types';

export const INITIAL_STATIONS: PlantStation[] = [
  { id: 'Estación 1', name: 'Estación 1 (Tornos & Mecanizado)', compliance5S: 92, machinesCount: 3 },
  { id: 'Estación 2', name: 'Estación 2 (Fresado & Taladrado)', compliance5S: 78, machinesCount: 2 },
  { id: 'Estación 3', name: 'Estación 3 (Prensas & Estampado)', compliance5S: 88, machinesCount: 2 },
  { id: 'Estación 4', name: 'Estación 4 (Soldadura & Ensamble)', compliance5S: 82, machinesCount: 2 },
  { id: 'Estación 5', name: 'Estación 5 (Servicios & Compresores)', compliance5S: 85, machinesCount: 1 },
];

export const INITIAL_MACHINES: Machine[] = [
  {
    id: 'm-001',
    code: 'M-001',
    name: 'Torno paralelo',
    category: 'TORNO',
    brand: 'NARDINI',
    model: 'ND 250',
    year: 2018,
    location: 'Área de mecanizado',
    stationId: 'Estación 1',
    responsible: 'Juan Pérez',
    description: 'Torno paralelo utilizado para piezas cilíndricas y materiales metálicos de alta precisión.',
    status: 'OPERATIVA',
    nextRevisionDate: '2024-09-25',
    lastMaintenanceDate: '2024-06-25',
    lastMaintenanceType: 'Preventivo',
    maintenanceHistory: [
      {
        id: 'mnt-001-1',
        date: '25/06/2024',
        type: 'Preventivo',
        technician: 'Carlos Silva',
        description: 'Lubricación de bancada, cambio de aceite de cabezal y ajuste de holguras en husillo.',
        cost: 280,
        durationHours: 4,
        partsReplaced: ['Aceite ISO VG 68', 'Filtro de lubricación']
      },
      {
        id: 'mnt-001-2',
        date: '25/03/2024',
        type: 'Preventivo',
        technician: 'Carlos Silva',
        description: 'Inspección periódica trimestral, ajuste de correas trapezoidales y verificación eléctrica.',
        cost: 150,
        durationHours: 3,
        partsReplaced: ['Juego de correas A-42']
      },
      {
        id: 'mnt-001-3',
        date: '25/12/2023',
        type: 'Correctivo',
        technician: 'Mario Gómez',
        description: 'Reparación de embrague mecánico por recalentamiento tras ciclo continuo de roscado.',
        cost: 540,
        durationHours: 6,
        partsReplaced: ['Discos de fricción embrague', 'Retén de aceite']
      }
    ],
    failures: [
      {
        id: 'fl-001-1',
        date: '10/08/2024',
        type: 'Mecánica',
        severity: 'Baja',
        description: 'Vibración leve en contrapunta durante mecanizado de barras largas.',
        reportedBy: 'Juan Pérez',
        status: 'Solucionada',
        solutionNotes: 'Alineación y rectificado del punto giratorio MT3.'
      }
    ],
    latest5S: {
      id: '5s-001-1',
      date: '15/09/2024',
      auditor: 'Ing. Rodrigo Morales',
      generalCompliance: 85,
      categories: [
        {
          category: 'Clasificación',
          japaneseName: 'Seiri',
          score: 90,
          criteria: [
            { question: 'Solo herramientas de trabajo del turno en el área de trabajo', passed: true },
            { question: 'Sin piezas de descarte o virutas acumuladas sin clasificar', passed: true },
            { question: 'Materiales sobrantes devueltos a bodega central', passed: true }
          ]
        },
        {
          category: 'Orden',
          japaneseName: 'Seiton',
          score: 80,
          criteria: [
            { question: 'Herramientas de corte (buriles) en panel sombreado identificado', passed: true },
            { question: 'Llaves de mandril sujetas con resorte retráctil', passed: true },
            { question: 'Identificación clara de topes y carros portaherramientas', passed: false }
          ]
        },
        {
          category: 'Limpieza',
          japaneseName: 'Seiso',
          score: 90,
          criteria: [
            { question: 'Bandeja colectora de viruta vaciada y limpia', passed: true },
            { question: 'Bancada libre de polvo abrasivo y lubricada correctamente', passed: true },
            { question: 'Piso circundante sin restos de taladrina o aceite', passed: true }
          ]
        },
        {
          category: 'Estandarización',
          japaneseName: 'Seiketsu',
          score: 80,
          criteria: [
            { question: 'Checklist diario de inicio de turno completado y firmado', passed: true },
            { question: 'Niveles de aceite señalizados con marcas de máx/mín claras', passed: true },
            { question: 'Etiqueta NFC limpia y visible en cabezal principal', passed: false }
          ]
        },
        {
          category: 'Disciplina',
          japaneseName: 'Shitsuke',
          score: 80,
          criteria: [
            { question: 'Uso completo y obligatorio de EPP (gafas Z87, calzado dieléctrico)', passed: true },
            { question: 'Cumplimiento del protocolo de paro de emergencia mensual', passed: true },
            { question: 'Registro digital inmediato en tag NFC al cambiar estado', passed: false }
          ]
        },
        {
          category: 'Seguridad',
          japaneseName: 'Safety (6S)',
          score: 90,
          criteria: [
            { question: 'Guarda de protección de mandril con microinterruptor activo', passed: true },
            { question: 'Pulsador de parada de emergencia accesible y probado', passed: true },
            { question: 'Extintor CO2 de 5kg vigente a menos de 5 metros', passed: true }
          ]
        }
      ],
      observations: 'Excelente mantenimiento de bancada y limpieza. Falta delimitar la zona de espera de materia prima con cinta amarilla reglamentaria.'
    },
    documents: [
      {
        id: 'doc-1',
        title: 'Manual de Operación y Mantenimiento NARDINI ND-250',
        type: 'manual',
        filename: 'manual_operacion_nd250.pdf',
        dateAdded: '2023-01-15',
        description: 'Especificaciones mecánicas, velocidades de cabezal, pasos de rosca métrica y Withworth.'
      },
      {
        id: 'doc-2',
        title: 'Diagrama Eléctrico y Conexión Trifásica 380V',
        type: 'diagram',
        filename: 'esquema_electrico_m001.pdf',
        dateAdded: '2023-02-10',
        description: 'Plano unifilar de contactores, relé térmico y circuito de parada de seguridad.'
      },
      {
        id: 'doc-3',
        title: 'Procedimiento Estándar de Bloqueo y Etiquetado (LOTO)',
        type: 'loto',
        filename: 'loto_procedimiento_torno.pdf',
        dateAdded: '2023-05-20',
        description: 'Instrucciones obligatorias de desenergización antes de mantenimiento o cambio de mandril.'
      },
      {
        id: 'doc-4',
        title: 'Ficha de Seguridad Químicos: Aceite Hidráulico ISO 68',
        type: 'safety',
        filename: 'msds_aceite_lubricante_iso68.pdf',
        dateAdded: '2023-06-01',
        description: 'Ficha técnica de manipulación, primeros auxilios y control de derrames.'
      }
    ],
    specs: {
      power: '7.5 HP (5.5 kW)',
      rpm: '45 - 2000 RPM (12 vel)',
      voltage: '380V Trifásico 60Hz',
      weight: '1,850 kg'
    },
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
    productionMetrics: {
      availableHours: 160,
      workedHours: 135,
      stoppedHours: 25,
      producedUnits: 540,
      expectedUnits: 600,
    },
    financials: {
      monthlyFixedCost: 15000,
      variableCostPerUnit: 25,
      salePricePerUnit: 50,
      expectedUnitsPerMonth: 600,
      maintenanceBudget: 3500,
      replacementEstimatedCost: 28000,
      replacementAlertThresholdPct: 70,
    },
    productionHistory: [
      {
        id: 'prod-001-1',
        date: '2024-09-19',
        hoursWorked: 7.5,
        hoursStopped: 0.5,
        stopReason: 'Ajuste de herramienta y centrado',
        unitsProduced: 32,
        expectedUnits: 34,
        operator: 'Juan Pérez',
        notes: 'Turno matutino, corte continuo.'
      },
      {
        id: 'prod-001-2',
        date: '2024-09-18',
        hoursWorked: 5.0,
        hoursStopped: 3.0,
        stopReason: 'Falla mecánica (embrague)',
        unitsProduced: 18,
        expectedUnits: 34,
        operator: 'Juan Pérez',
        notes: 'Parada no programada por calentamiento de embrague. Reportado a mantenimiento.'
      },
      {
        id: 'prod-001-3',
        date: '2024-09-17',
        hoursWorked: 8.0,
        hoursStopped: 0.0,
        stopReason: 'Ninguno',
        unitsProduced: 36,
        expectedUnits: 34,
        operator: 'Juan Pérez',
        notes: 'Operación al 100% de rendimiento.'
      }
    ]
  },
  {
    id: 'm-002',
    code: 'M-002',
    name: 'Fresa universal',
    category: 'FRESADORA',
    brand: 'KONDIA',
    model: 'B-500',
    year: 2019,
    location: 'Área de mecanizado',
    stationId: 'Estación 1',
    responsible: 'Marcos Delgado',
    description: 'Fresadora universal para fresado horizontal y vertical, chaveteros y matricería.',
    status: 'OPERATIVA',
    nextRevisionDate: '2024-09-18', // Vence pronto!
    lastMaintenanceDate: '2024-06-18',
    lastMaintenanceType: 'Preventivo',
    maintenanceHistory: [
      {
        id: 'mnt-002-1',
        date: '18/06/2024',
        type: 'Preventivo',
        technician: 'Carlos Silva',
        description: 'Cambio de grasa en husillo vertical y calibración de reglas ópticas digitales.',
        cost: 210,
        durationHours: 3.5,
        partsReplaced: ['Grasa Kluber Isoflex']
      }
    ],
    failures: [],
    latest5S: {
      id: '5s-002-1',
      date: '12/09/2024',
      auditor: 'Ing. Rodrigo Morales',
      generalCompliance: 92,
      categories: [
        { category: 'Clasificación', japaneseName: 'Seiri', score: 95, criteria: [] },
        { category: 'Orden', japaneseName: 'Seiton', score: 90, criteria: [] },
        { category: 'Limpieza', japaneseName: 'Seiso', score: 95, criteria: [] },
        { category: 'Estandarización', japaneseName: 'Seiketsu', score: 90, criteria: [] },
        { category: 'Disciplina', japaneseName: 'Shitsuke', score: 90, criteria: [] },
        { category: 'Seguridad', japaneseName: 'Safety', score: 92, criteria: [] }
      ]
    },
    documents: [
      {
        id: 'doc-2-1',
        title: 'Manual de Usuario KONDIA B500',
        type: 'manual',
        filename: 'manual_kondia_b500.pdf',
        dateAdded: '2023-01-20',
        description: 'Tabla de avances y velocidades recomendadas para aceros duros y aluminios.'
      }
    ],
    specs: {
      power: '5.0 HP',
      rpm: '60 - 3000 RPM',
      voltage: '380V Trifásico',
      weight: '1,400 kg'
    },
    imageUrl: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?auto=format&fit=crop&w=600&q=80',
    productionMetrics: {
      availableHours: 160,
      workedHours: 148,
      stoppedHours: 12,
      producedUnits: 490,
      expectedUnits: 520,
    },
    financials: {
      monthlyFixedCost: 14000,
      variableCostPerUnit: 30,
      salePricePerUnit: 65,
      expectedUnitsPerMonth: 520,
      maintenanceBudget: 3000,
      replacementEstimatedCost: 24000,
      replacementAlertThresholdPct: 70,
    },
    productionHistory: []
  },
  {
    id: 'm-003',
    code: 'M-003',
    name: 'Prensa hidráulica 150T',
    category: 'PRENSA',
    brand: 'SCHULER',
    model: 'HP-150',
    year: 2017,
    location: 'Área de estampado',
    stationId: 'Estación 3',
    responsible: 'David Rivas',
    description: 'Prensa de conformado y troquelado de láminas metálicas de alto tonelaje.',
    status: 'EN_REVISION',
    nextRevisionDate: '2024-09-20', // Próxima a vencer
    lastMaintenanceDate: '2024-06-20',
    lastMaintenanceType: 'Preventivo',
    maintenanceHistory: [
      {
        id: 'mnt-003-1',
        date: '20/06/2024',
        type: 'Preventivo',
        technician: 'Mario Gómez',
        description: 'Inspección del grupo hidráulico, prueba de sellos de cilindro primario y cambio de filtro de retorno.',
        cost: 650,
        durationHours: 5,
        partsReplaced: ['Elemento filtrante 10 micras', 'O-rings brida principal']
      }
    ],
    failures: [
      {
        id: 'fl-003-1',
        date: '14/09/2024',
        type: 'Hidráulica',
        severity: 'Media',
        description: 'Goteo menor en manguera de retorno hacia el depósito central.',
        reportedBy: 'David Rivas',
        status: 'En Proceso'
      }
    ],
    latest5S: {
      id: '5s-003-1',
      date: '10/09/2024',
      auditor: 'Ing. Rodrigo Morales',
      generalCompliance: 88,
      categories: [
        { category: 'Clasificación', japaneseName: 'Seiri', score: 90, criteria: [] },
        { category: 'Orden', japaneseName: 'Seiton', score: 85, criteria: [] },
        { category: 'Limpieza', japaneseName: 'Seiso', score: 85, criteria: [] },
        { category: 'Estandarización', japaneseName: 'Seiketsu', score: 90, criteria: [] },
        { category: 'Disciplina', japaneseName: 'Shitsuke', score: 85, criteria: [] },
        { category: 'Seguridad', japaneseName: 'Safety', score: 95, criteria: [] }
      ]
    },
    documents: [
      {
        id: 'doc-3-1',
        title: 'Manual de Mantenimiento Hidráulico Schuler',
        type: 'manual',
        filename: 'schuler_hp150_hidraulica.pdf',
        dateAdded: '2022-11-10',
        description: 'Diagrama de presiones, válvulas proporcionales y ajuste de presostato.'
      }
    ],
    specs: {
      power: '15 HP',
      rpm: '1800 RPM (Bomba)',
      voltage: '440V Trifásico',
      weight: '6,200 kg'
    },
    imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=600&q=80',
    productionMetrics: {
      availableHours: 160,
      workedHours: 120,
      stoppedHours: 40,
      producedUnits: 1200,
      expectedUnits: 1600,
    },
    financials: {
      monthlyFixedCost: 18000,
      variableCostPerUnit: 20,
      salePricePerUnit: 48,
      expectedUnitsPerMonth: 1600,
      maintenanceBudget: 5000,
      replacementEstimatedCost: 45000,
      replacementAlertThresholdPct: 70,
    },
    productionHistory: []
  },
  {
    id: 'm-004',
    code: 'M-004',
    name: 'Centro de mecanizado CNC',
    category: 'CNC',
    brand: 'MAZAK',
    model: 'VTC 200B',
    year: 2021,
    location: 'Área CNC',
    stationId: 'Estación 2',
    responsible: 'Álvaro Torres',
    description: 'Centro de mecanizado vertical de 4 ejes para piezas complejas y herramentales aeronáuticos.',
    status: 'OPERATIVA',
    nextRevisionDate: '2024-10-15',
    lastMaintenanceDate: '2024-07-15',
    lastMaintenanceType: 'Preventivo',
    maintenanceHistory: [
      {
        id: 'mnt-004-1',
        date: '15/07/2024',
        type: 'Preventivo',
        technician: 'Carlos Silva',
        description: 'Calibración ballbar Renishaw de ejes X, Y, Z. Verificación de chiller de cabezal.',
        cost: 890,
        durationHours: 6
      }
    ],
    failures: [
      {
        id: 'fl-004-1',
        date: '02/09/2024',
        type: 'Eléctrica',
        severity: 'Media',
        description: 'Alarma intermitente por sensor de presión de aire comprimido bajo.',
        reportedBy: 'Álvaro Torres',
        status: 'Solucionada'
      }
    ],
    latest5S: {
      id: '5s-004-1',
      date: '08/09/2024',
      auditor: 'Ing. Rodrigo Morales',
      generalCompliance: 78,
      categories: [
        { category: 'Clasificación', japaneseName: 'Seiri', score: 80, criteria: [] },
        { category: 'Orden', japaneseName: 'Seiton', score: 75, criteria: [] },
        { category: 'Limpieza', japaneseName: 'Seiso', score: 80, criteria: [] },
        { category: 'Estandarización', japaneseName: 'Seiketsu', score: 75, criteria: [] },
        { category: 'Disciplina', japaneseName: 'Shitsuke', score: 80, criteria: [] },
        { category: 'Seguridad', japaneseName: 'Safety', score: 78, criteria: [] }
      ]
    },
    documents: [
      {
        id: 'doc-4-1',
        title: 'Manual de Control Mazatrol SmoothG',
        type: 'manual',
        filename: 'mazatrol_smoothg_manual.pdf',
        dateAdded: '2023-03-01',
        description: 'Programación conversacional y códigos G estándar ISO.'
      }
    ],
    specs: {
      power: '25 HP',
      rpm: '12000 RPM',
      voltage: '380V Trifásico',
      weight: '4,900 kg'
    },
    imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',
    productionMetrics: {
      availableHours: 160,
      workedHours: 142,
      stoppedHours: 18,
      producedUnits: 710,
      expectedUnits: 800,
    },
    financials: {
      monthlyFixedCost: 22000,
      variableCostPerUnit: 45,
      salePricePerUnit: 95,
      expectedUnitsPerMonth: 800,
      maintenanceBudget: 6000,
      replacementEstimatedCost: 65000,
      replacementAlertThresholdPct: 70,
    },
    productionHistory: []
  },
  {
    id: 'm-005',
    code: 'M-005',
    name: 'Compresor de tornillo',
    category: 'COMPRESOR',
    brand: 'ATLAS COPCO',
    model: 'GA 37 VSD',
    year: 2020,
    location: 'Sala de compresores',
    stationId: 'Estación 5',
    responsible: 'Héctor Salazar',
    description: 'Compresor rotativo de velocidad variable para alimentación de la red neumática de toda la planta.',
    status: 'PARADA_FALLA', // Vencido y en falla
    nextRevisionDate: '2024-09-10', // Vencido!
    lastMaintenanceDate: '2024-03-10',
    lastMaintenanceType: 'Preventivo',
    maintenanceHistory: [
      {
        id: 'mnt-005-1',
        date: '10/03/2024',
        type: 'Preventivo',
        technician: 'Mario Gómez',
        description: 'Cambio de kit de válvulas de descarga y aceite sintético Roto-Inject Fluid.',
        cost: 480,
        durationHours: 4
      }
    ],
    failures: [
      {
        id: 'fl-005-1',
        date: '12/09/2024',
        type: 'Mecánica',
        severity: 'Crítica',
        description: 'Parada por alta temperatura en unidad compresora (>105°C). Enfriador obstruido.',
        reportedBy: 'Héctor Salazar',
        status: 'En Proceso'
      }
    ],
    latest5S: {
      id: '5s-005-1',
      date: '05/09/2024',
      auditor: 'Ing. Rodrigo Morales',
      generalCompliance: 85,
      categories: [
        { category: 'Clasificación', japaneseName: 'Seiri', score: 85, criteria: [] },
        { category: 'Orden', japaneseName: 'Seiton', score: 85, criteria: [] },
        { category: 'Limpieza', japaneseName: 'Seiso', score: 85, criteria: [] },
        { category: 'Estandarización', japaneseName: 'Seiketsu', score: 85, criteria: [] },
        { category: 'Disciplina', japaneseName: 'Shitsuke', score: 85, criteria: [] },
        { category: 'Seguridad', japaneseName: 'Safety', score: 85, criteria: [] }
      ]
    },
    documents: [
      {
        id: 'doc-5-1',
        title: 'Manual de Servicio Atlas Copco GA 37',
        type: 'manual',
        filename: 'atlas_copco_ga37_manual.pdf',
        dateAdded: '2022-09-01',
        description: 'Rutinas de mantenimiento cada 500, 2000 y 4000 horas de servicio.'
      }
    ],
    specs: {
      power: '50 HP (37 kW)',
      rpm: 'Velocidad Variable',
      voltage: '440V Trifásico',
      weight: '780 kg'
    },
    imageUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?auto=format&fit=crop&w=600&q=80',
    productionMetrics: {
      availableHours: 160,
      workedHours: 105,
      stoppedHours: 55,
      producedUnits: 0,
      expectedUnits: 0,
    },
    financials: {
      monthlyFixedCost: 12000,
      variableCostPerUnit: 15,
      salePricePerUnit: 35,
      expectedUnitsPerMonth: 800,
      maintenanceBudget: 3500,
      replacementEstimatedCost: 32000,
      replacementAlertThresholdPct: 70,
    },
    productionHistory: []
  },
  {
    id: 'm-006',
    code: 'M-006',
    name: 'Soldadora MIG/MAG Inverter',
    category: 'SOLDADURA',
    brand: 'MILLER',
    model: 'Continuum 500',
    year: 2022,
    location: 'Área de soldadura',
    stationId: 'Estación 4',
    responsible: 'Roberto Méndez',
    description: 'Equipo de soldadura robotizado y semiautomático para calderería pesada y aceros estructurales.',
    status: 'OPERATIVA',
    nextRevisionDate: '2024-10-05',
    lastMaintenanceDate: '2024-07-05',
    lastMaintenanceType: 'Preventivo',
    financials: {
      monthlyFixedCost: 10000,
      variableCostPerUnit: 18,
      salePricePerUnit: 42,
      expectedUnitsPerMonth: 450,
      maintenanceBudget: 2500,
      replacementEstimatedCost: 18000,
      replacementAlertThresholdPct: 70,
    },
    productionMetrics: {
      availableHours: 160,
      workedHours: 140,
      stoppedHours: 20,
      producedUnits: 430,
      expectedUnits: 450,
    },
    productionHistory: [],
    maintenanceHistory: [
      {
        id: 'mnt-006-1',
        date: '05/07/2024',
        type: 'Preventivo',
        technician: 'Carlos Silva',
        description: 'Limpieza de rodillos de alimentación, soplado de transformador y prueba de aislamiento.',
        cost: 120,
        durationHours: 2
      }
    ],
    failures: [],
    latest5S: {
      id: '5s-006-1',
      date: '14/09/2024',
      auditor: 'Ing. Rodrigo Morales',
      generalCompliance: 82,
      categories: [
        { category: 'Clasificación', japaneseName: 'Seiri', score: 85, criteria: [] },
        { category: 'Orden', japaneseName: 'Seiton', score: 80, criteria: [] },
        { category: 'Limpieza', japaneseName: 'Seiso', score: 80, criteria: [] },
        { category: 'Estandarización', japaneseName: 'Seiketsu', score: 80, criteria: [] },
        { category: 'Disciplina', japaneseName: 'Shitsuke', score: 80, criteria: [] },
        { category: 'Seguridad', japaneseName: 'Safety', score: 85, criteria: [] }
      ]
    },
    documents: [
      {
        id: 'doc-6-1',
        title: 'Guía de Parámetros de Soldadura Miller',
        type: 'manual',
        filename: 'miller_continuum_guide.pdf',
        dateAdded: '2023-08-15',
        description: 'Tablas de sinergia de voltaje y velocidad de alambre según gas de protección.'
      }
    ],
    specs: {
      power: '22 kVA',
      rpm: 'N/A',
      voltage: '380V Trifásico',
      weight: '82 kg'
    },
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80'
  }
];
