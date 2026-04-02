'use client';
import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/AppLayout';
import Topbar from '@/components/Topbar';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Download, Plus, X, AlertCircle, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type ShiftType = 'Matin' | 'Après-midi' | 'Soir' | 'Nuit';

interface Employee {
  id: string;
  name: string;
  role: 'Caissier' | 'Manager';
  shop: string;
  avatar: string;
  availability: { [key: string]: ShiftType[] };
}

interface Shift {
  id: string;
  employeeId: string;
  date: string;
  type: ShiftType;
  shop: string;
  hours: string;
}

interface SwapRequest {
  id: string;
  fromEmployeeId: string;
  toEmployeeId: string;
  shiftId: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  date: string;
}

const MOCK_EMPLOYEES: Employee[] = [
  { id: 'e1', name: 'Amadou Diallo', role: 'Manager', shop: 'Boutique Conakry', avatar: 'AD', availability: { '2026-04-07': ['Matin', 'Après-midi'], '2026-04-08': ['Matin', 'Après-midi', 'Soir'], '2026-04-09': ['Matin', 'Après-midi'] } },
  { id: 'e2', name: 'Fatoumata Bah', role: 'Caissier', shop: 'Boutique Conakry', avatar: 'FB', availability: { '2026-04-07': ['Matin', 'Après-midi', 'Soir'], '2026-04-08': ['Après-midi', 'Soir'], '2026-04-09': ['Matin', 'Après-midi'] } },
  { id: 'e3', name: 'Mamadou Camara', role: 'Caissier', shop: 'Boutique Conakry', avatar: 'MC', availability: { '2026-04-07': ['Après-midi', 'Soir'], '2026-04-08': ['Matin', 'Après-midi'], '2026-04-09': ['Soir', 'Nuit'] } },
  { id: 'e4', name: 'Aissatou Sow', role: 'Caissier', shop: 'Boutique Kindia', avatar: 'AS', availability: { '2026-04-07': ['Matin', 'Après-midi'], '2026-04-08': ['Matin', 'Soir'], '2026-04-09': ['Après-midi', 'Soir'] } },
  { id: 'e5', name: 'Ibrahim Barry', role: 'Manager', shop: 'Boutique Kindia', avatar: 'IB', availability: { '2026-04-07': ['Matin', 'Après-midi', 'Soir'], '2026-04-08': ['Matin', 'Après-midi'], '2026-04-09': ['Matin', 'Après-midi', 'Soir'] } },
  { id: 'e6', name: 'Mariama Kouyaté', role: 'Caissier', shop: 'Boutique Labé', avatar: 'MK', availability: { '2026-04-07': ['Matin', 'Après-midi'], '2026-04-08': ['Après-midi', 'Soir'], '2026-04-09': ['Matin', 'Soir'] } },
];

const SHIFT_TYPES: { type: ShiftType; hours: string; color: string }[] = [
  { type: 'Matin', hours: '08:00 - 14:00', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { type: 'Après-midi', hours: '14:00 - 20:00', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { type: 'Soir', hours: '20:00 - 02:00', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { type: 'Nuit', hours: '02:00 - 08:00', color: 'bg-slate-100 text-slate-700 border-slate-200' },
];

const SHOPS = ['Boutique Conakry', 'Boutique Kindia', 'Boutique Labé'];

function getWeekDates(startDate: Date): Date[] {
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

interface AssignShiftModalProps {
  date: string;
  shop: string;
  onClose: () => void;
  onAssign: (shift: Omit<Shift, 'id'>) => void;
  employees: Employee[];
  existingShifts: Shift[];
}

function AssignShiftModal({ date, shop, onClose, onAssign, employees, existingShifts }: AssignShiftModalProps) {
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedType, setSelectedType] = useState<ShiftType>('Matin');

  const availableEmployees = employees.filter(e => {
    const alreadyAssigned = existingShifts.some(s => s.employeeId === e.id && s.date === date && s.type === selectedType);
    const isAvailable = e.availability[date]?.includes(selectedType);
    const matchesShop = e.shop === shop;
    return !alreadyAssigned && isAvailable && matchesShop;
  });

  const handleAssign = () => {
    if (!selectedEmployee) return;
    const shiftConfig = SHIFT_TYPES.find(s => s.type === selectedType);
    onAssign({
      employeeId: selectedEmployee,
      date,
      type: selectedType,
      shop,
      hours: shiftConfig?.hours || '08:00 - 14:00',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-900">Assigner un shift</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm text-slate-500 mb-1">Date</p>
            <p className="font-semibold text-slate-800">{new Date(date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div>
            <p className="text-sm text-slate-500 mb-1">Magasin</p>
            <p className="font-semibold text-slate-800">{shop}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Type de shift</label>
            <div className="grid grid-cols-2 gap-2">
              {SHIFT_TYPES.map(st => (
                <button
                  key={st.type}
                  onClick={() => setSelectedType(st.type)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border transition-colors ${selectedType === st.type ? st.color : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                >
                  {st.type}
                  <span className="block text-xs font-normal opacity-75">{st.hours}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Employé disponible</label>
            {availableEmployees.length === 0 ? (
              <div className="text-center py-4 text-slate-400 text-sm">
                <AlertCircle size={20} className="mx-auto mb-1 opacity-50" />
                Aucun employé disponible pour ce shift
              </div>
            ) : (
              <select
                value={selectedEmployee}
                onChange={e => setSelectedEmployee(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">Sélectionner un employé</option>
                {availableEmployees.map(e => (
                  <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">Annuler</button>
          <button
            onClick={handleAssign}
            disabled={!selectedEmployee}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all"
          >
            Assigner
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ShiftSchedulingPage() {
  const supabase = createClient();
  const [weekStart, setWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(today.setDate(diff));
  });
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [selectedShop, setSelectedShop] = useState('Tous');
  const [showAssignModal, setShowAssignModal] = useState<{ date: string; shop: string } | null>(null);
  const [swapRequests, setSwapRequests] = useState<SwapRequest[]>([]);
  const [draggedShift, setDraggedShift] = useState<Shift | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const weekDates = getWeekDates(weekStart);

  const fetchTenantId = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('user_profiles').select('tenant_id').eq('id', user.id).single();
    return data?.tenant_id || null;
  }, [supabase]);

  const fetchShifts = useCallback(async (tid: string) => {
    setLoading(true);
    const weekStartStr = formatDate(weekStart);
    const weekEndDate = new Date(weekStart);
    weekEndDate.setDate(weekStart.getDate() + 6);
    const weekEndStr = formatDate(weekEndDate);

    const { data, error } = await supabase
      .from('shifts')
      .select('*')
      .eq('tenant_id', tid)
      .gte('shift_date', weekStartStr)
      .lte('shift_date', weekEndStr);

    if (error) {
      toast.error('Erreur de chargement', { description: error.message });
    } else {
      const mapped: Shift[] = (data || []).map(row => ({
        id: row.id,
        employeeId: row.employee_id,
        date: row.shift_date,
        type: row.shift_type as ShiftType,
        shop: row.shop_name,
        hours: row.hours,
      }));
      setShifts(mapped);
    }
    setLoading(false);
  }, [supabase, weekStart]);

  useEffect(() => {
    fetchTenantId().then(tid => {
      if (tid) { setTenantId(tid); fetchShifts(tid); }
      else setLoading(false);
    });
  }, [fetchTenantId, fetchShifts]);

  const filteredShifts = selectedShop === 'Tous' ? shifts : shifts.filter(s => s.shop === selectedShop);

  const handlePrevWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() - 7);
    setWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + 7);
    setWeekStart(newStart);
  };

  const handleAssignShift = async (shift: Omit<Shift, 'id'>) => {
    if (!tenantId) { toast.error('Tenant non trouvé'); return; }
    const employee = MOCK_EMPLOYEES.find(e => e.id === shift.employeeId);
    const { data, error } = await supabase
      .from('shifts')
      .insert({
        tenant_id: tenantId,
        shop_name: shift.shop,
        employee_id: shift.employeeId,
        employee_name: employee?.name || '',
        employee_role: employee?.role || 'Caissier',
        shift_date: shift.date,
        shift_type: shift.type,
        hours: shift.hours,
      })
      .select()
      .single();

    if (error) {
      toast.error('Erreur d\'assignation', { description: error.message });
    } else if (data) {
      setShifts(prev => [...prev, {
        id: data.id,
        employeeId: data.employee_id,
        date: data.shift_date,
        type: data.shift_type as ShiftType,
        shop: data.shop_name,
        hours: data.hours,
      }]);
      toast.success('Shift assigné', { description: `${employee?.name} — ${shift.type}` });
    }
  };

  const handleRemoveShift = async (shiftId: string) => {
    const { error } = await supabase.from('shifts').delete().eq('id', shiftId);
    if (error) {
      toast.error('Erreur de suppression', { description: error.message });
    } else {
      setShifts(prev => prev.filter(s => s.id !== shiftId));
    }
  };

  const handleExport = () => {
    toast.info('Export du planning', { description: 'Fonctionnalité d\'export disponible prochainement.' });
  };

  const handleDragStart = (shift: Shift) => setDraggedShift(shift);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (date: string, type: ShiftType) => {
    if (!draggedShift || !tenantId) return;
    const employee = MOCK_EMPLOYEES.find(e => e.id === draggedShift.employeeId);
    if (!employee) return;
    const isAvailable = employee.availability[date]?.includes(type);
    if (!isAvailable) {
      toast.error(`${employee.name} n'est pas disponible pour ce shift.`);
      setDraggedShift(null);
      return;
    }
    const alreadyAssigned = shifts.some(s => s.employeeId === draggedShift.employeeId && s.date === date && s.type === type);
    if (alreadyAssigned) {
      toast.error(`${employee.name} est déjà assigné à ce shift.`);
      setDraggedShift(null);
      return;
    }
    const shiftConfig = SHIFT_TYPES.find(st => st.type === type);
    const { data, error } = await supabase
      .from('shifts')
      .update({ shift_date: date, shift_type: type, hours: shiftConfig?.hours || draggedShift.hours })
      .eq('id', draggedShift.id)
      .select()
      .single();

    if (error) {
      toast.error('Erreur de déplacement', { description: error.message });
    } else if (data) {
      setShifts(prev => prev.map(s => s.id === draggedShift.id ? { ...s, date, type, hours: shiftConfig?.hours || s.hours } : s));
    }
    setDraggedShift(null);
  };

  return (
    <AppLayout>
      <Topbar title="Planning des shifts" subtitle="Gestion des horaires et disponibilités des employés" />
      <div className="px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 max-w-screen-2xl mx-auto space-y-4 sm:space-y-6">

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button onClick={handlePrevWeek} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronLeft size={16} className="text-slate-600" />
            </button>
            <div className="px-3 py-1 text-sm font-semibold text-slate-800 min-w-[140px] text-center">
              {weekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {weekDates[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
            <button onClick={handleNextWeek} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedShop}
              onChange={e => setSelectedShop(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              <option value="Tous">Tous les magasins</option>
              {SHOPS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Shifts planifiés', value: filteredShifts.length, color: 'text-slate-700' },
            { label: 'Employés actifs', value: new Set(filteredShifts.map(s => s.employeeId)).size, color: 'text-blue-700' },
            { label: 'Demandes d\'échange', value: swapRequests.filter(r => r.status === 'Pending').length, color: 'text-amber-700' },
            { label: 'Shifts cette semaine', value: filteredShifts.filter(s => weekDates.some(d => formatDate(d) === s.date)).length, color: 'text-green-700' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
              <p className="text-xs text-slate-500 mb-1 truncate">{s.label}</p>
              <p className={`text-xl font-bold ${s.color} tabular-nums`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-2xl border border-slate-200">
            <Loader2 size={32} className="animate-spin text-amber-500" />
          </div>
        ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Header */}
              <div className="grid grid-cols-8 border-b border-slate-200 bg-slate-50">
                <div className="p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Shift</div>
                {weekDates.map(date => (
                  <div key={formatDate(date)} className="p-3 text-center border-l border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase">{date.toLocaleDateString('fr-FR', { weekday: 'short' })}</p>
                    <p className="text-sm font-bold text-slate-900 mt-0.5">{date.getDate()}</p>
                  </div>
                ))}
              </div>

              {/* Shift Rows */}
              {SHIFT_TYPES.map(shiftType => (
                <div key={shiftType.type} className="grid grid-cols-8 border-b border-slate-100 last:border-0">
                  <div className={`p-3 border-r border-slate-200 flex flex-col justify-center ${shiftType.color}`}>
                    <p className="text-sm font-bold">{shiftType.type}</p>
                    <p className="text-xs opacity-75">{shiftType.hours}</p>
                  </div>
                  {weekDates.map(date => {
                    const dateStr = formatDate(date);
                    const dayShifts = filteredShifts.filter(s => s.date === dateStr && s.type === shiftType.type);
                    return (
                      <div
                        key={dateStr}
                        className="p-2 border-l border-slate-100 min-h-[80px] hover:bg-slate-50 transition-colors relative"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(dateStr, shiftType.type)}
                      >
                        {dayShifts.map(shift => {
                          const employee = MOCK_EMPLOYEES.find(e => e.id === shift.employeeId);
                          if (!employee) return null;
                          return (
                            <div
                              key={shift.id}
                              draggable
                              onDragStart={() => handleDragStart(shift)}
                              className="bg-amber-100 border border-amber-200 rounded-lg p-2 mb-1 cursor-move hover:shadow-md transition-shadow group"
                            >
                              <div className="flex items-center justify-between gap-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shrink-0">
                                    <span className="text-white text-xs font-bold">{employee.avatar[0]}</span>
                                  </div>
                                  <p className="text-xs font-semibold text-slate-800 truncate">{employee.name}</p>
                                </div>
                                <button
                                  onClick={() => handleRemoveShift(shift.id)}
                                  className="opacity-0 group-hover:opacity-100 w-4 h-4 rounded hover:bg-red-100 flex items-center justify-center transition-opacity"
                                >
                                  <X size={10} className="text-red-600" />
                                </button>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">{employee.role}</p>
                            </div>
                          );
                        })}
                        <button
                          onClick={() => setShowAssignModal({ date: dateStr, shop: selectedShop === 'Tous' ? SHOPS[0] : selectedShop })}
                          className="w-full py-1.5 border border-dashed border-slate-300 rounded-lg text-xs text-slate-400 hover:text-amber-600 hover:border-amber-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <Plus size={12} /> Assigner
                        </button>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        )}

        {/* Employee Availability */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <Users size={16} className="text-amber-500" />
            <h3 className="font-bold text-slate-900">Disponibilités des employés</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {MOCK_EMPLOYEES.filter(e => selectedShop === 'Tous' || e.shop === selectedShop).map(emp => {
              const empShifts = filteredShifts.filter(s => s.employeeId === emp.id && weekDates.some(d => formatDate(d) === s.date));
              return (
                <div key={emp.id} className="border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{emp.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.role} · {emp.shop}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-600">
                    <Clock size={11} />
                    <span>{empShifts.length} shift{empShifts.length !== 1 ? 's' : ''} cette semaine</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assign Shift Modal */}
      {showAssignModal && (
        <AssignShiftModal
          date={showAssignModal.date}
          shop={showAssignModal.shop}
          onClose={() => setShowAssignModal(null)}
          onAssign={handleAssignShift}
          employees={MOCK_EMPLOYEES}
          existingShifts={shifts}
        />
      )}
    </AppLayout>
  );
}
