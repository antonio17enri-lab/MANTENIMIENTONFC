import React, { useState } from 'react';
import { Shield, UserPlus, Trash2, Key, Users, CheckCircle2, AlertTriangle, X, Lock } from 'lucide-react';
import { AppUser, Machine } from '../types';

interface OperatorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  onAddUser: (user: AppUser) => void;
  onDeleteUser: (userId: string) => void;
  onChangeAdminPassword: (newPass: string) => void;
  machines: Machine[];
  currentUser: AppUser;
}

export const OperatorManagementModal: React.FC<OperatorManagementModalProps> = ({
  isOpen,
  onClose,
  users,
  onAddUser,
  onDeleteUser,
  onChangeAdminPassword,
  machines,
  currentUser,
}) => {
  const [activeTab, setActiveTab] = useState<'operators' | 'add' | 'admin-password'>('operators');
  
  // New operator form
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [assignedMachine, setAssignedMachine] = useState(machines[0]?.code || 'M-001');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Admin password change form
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [adminPassError, setAdminPassError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddOperator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim() || !name.trim()) return;

    if (users.some((u) => u.username.toLowerCase() === username.trim().toLowerCase())) {
      alert('Ya existe un usuario con este nombre de usuario.');
      return;
    }

    const newUser: AppUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      passwordHash: password.trim(),
      role: 'operador',
      assignedMachineCode: assignedMachine,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddUser(newUser);
    setName('');
    setUsername('');
    setPassword('');
    setSuccessMsg(`Operario "${newUser.name}" registrado exitosamente.`);
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveTab('operators');
    }, 1500);
  };

  const handleChangeAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminPassError(null);

    if (newAdminPass.length < 4) {
      setAdminPassError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    if (newAdminPass !== confirmAdminPass) {
      setAdminPassError('Las contraseñas no coinciden.');
      return;
    }

    onChangeAdminPassword(newAdminPass);
    setSuccessMsg('Contraseña de Administrador actualizada correctamente.');
    setNewAdminPass('');
    setConfirmAdminPass('');
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveTab('operators');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white">
                Gestión de Operarios y Seguridad
              </h2>
              <p className="text-[11px] text-slate-400">
                Solo tú como Administrador puedes autorizar operarios
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setActiveTab('operators')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'operators'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Operarios ({users.filter((u) => u.role === 'operador').length})
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'add'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            + Registrar Operario
          </button>
          <button
            onClick={() => setActiveTab('admin-password')}
            className={`pb-2.5 px-3 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'admin-password'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Mi Clave Admin
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LIST OPERATORS */}
          {activeTab === 'operators' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Usuarios con acceso a la app:</span>
                <button
                  onClick={() => setActiveTab('add')}
                  className="text-blue-600 font-bold hover:underline"
                >
                  + Agregar nuevo operario
                </button>
              </div>

              <div className="space-y-2">
                {users.map((u) => (
                  <div
                    key={u.id}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{u.name}</span>
                        <span
                          className={`px-1.5 py-0.2 text-[10px] font-bold rounded ${
                            u.role === 'admin'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {u.role.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-slate-500 text-[11px] font-mono">
                        Usuario: <strong>{u.username}</strong> • Clave: <strong>{u.passwordHash}</strong>
                      </div>
                      {u.assignedMachineCode && (
                        <div className="text-[10px] text-slate-400">
                          Máquina asignada: <span className="font-semibold text-slate-600">{u.assignedMachineCode}</span>
                        </div>
                      )}
                    </div>

                    {u.role !== 'admin' && (
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar al operario ${u.name}? Ya no podrá ingresar al escanear.`)) {
                            onDeleteUser(u.id);
                          }
                        }}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar operario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADD OPERATOR */}
          {activeTab === 'add' && (
            <form onSubmit={handleAddOperator} className="space-y-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre Completo del Operario</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Carlos Silva"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Usuario de Inicio de Sesión</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej: csilva"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contraseña Asignada</label>
                  <input
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ej: clave123"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Máquina Asignada Principal</label>
                <select
                  value={assignedMachine}
                  onChange={(e) => setAssignedMachine(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                >
                  {machines.map((m) => (
                    <option key={m.id} value={m.code}>
                      {m.code} - {m.name} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-[11px] text-slate-500 pt-1">
                ✓ El operario podrá escanear etiquetas NFC e ingresar para realizar inspecciones, registrar mantenimientos, llenar checklists 5S y reportar fallas. No podrá borrar máquinas ni resetear la base de datos.
              </p>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Guardar Nuevo Operario
              </button>
            </form>
          )}

          {/* TAB 3: CHANGE ADMIN PASSWORD */}
          {activeTab === 'admin-password' && (
            <form onSubmit={handleChangeAdminPasswordSubmit} className="space-y-3">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
                <p className="font-bold">Seguridad del Administrador:</p>
                <p className="text-[11px] mt-0.5">
                  Esta contraseña protege: Agregar nuevas máquinas, Configurar etiquetas NFC, y Restablecer/Borrar datos. Solo tú debes conocerla.
                </p>
              </div>

              {adminPassError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {adminPassError}
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nueva Contraseña de Administrador</label>
                <input
                  type="password"
                  required
                  value={newAdminPass}
                  onChange={(e) => setNewAdminPass(e.target.value)}
                  placeholder="Mínimo 4 caracteres"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  required
                  value={confirmAdminPass}
                  onChange={(e) => setConfirmAdminPass(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Actualizar Mi Contraseña de Administrador
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
