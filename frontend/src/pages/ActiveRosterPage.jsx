import React from 'react';
import Header from '../components/Header';
import ShiftCell from '../components/ShiftCell';
import {useState, useContext, useEffect, useMemo} from 'react';
import DialogBox from '../components/Dialog_box';
import { LicenseExpiryContext } from '../context/LicenseExpiryContext';
import { useLicenseStatus } from '../hooks/useLicenseStatus';
import { SiteContext } from '../context/SiteContext';
import supabase from '../services/supabase/client';


// Helper function to get the Monday of the current real-world week
const getInitialMonday = () => {
  const today = new Date();
  const day = today.getDay();
  const distanceToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0); // Normalize time
  return monday;
};

export default function ActiveRosterPage({children, onTabChange}) {
  // console.log(new Date().getDate(), 'ActiveRosterPage: Rendering ActiveRosterPage.jsx');
  const [roster, setRoster] = useState([]);
  const [modalData, setModalData] = useState(null);
  const {currentLicenseExpiry, setCurrentLicenseExpiry} = useContext(LicenseExpiryContext);
  const {currentSite, setCurrentSite} = useContext(SiteContext);
  // Storing the starting Monday in state
  const [currentWeekMonday, setCurrentWeekMonday] = useState(getInitialMonday);
  const [sites, setSites] = useState([]);
  const [scheduleData, setScheduleData] = useState([]); // State to hold the fetched schedule data

  // Using custom hook to get guard expiry status and urgent guards
  const { guardStatus , urgentGuards, expiredGuards } = useLicenseStatus();

  // Generate the 7 days relative to the stored state
  const weekly_date = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const nextDay = new Date(currentWeekMonday);
      nextDay.setDate(currentWeekMonday.getDate() + i);
      
      return {
        dayNumber: nextDay.getDate(),
        dayName: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
        dayKey: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'][i],
        fullDate: nextDay // Useful if you need to pass timestamps down to shift cells
      };
    });
  }, [currentWeekMonday]);

  const handlePreviousWeek = () => {
    setCurrentWeekMonday(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }

  const handleNextWeek = () => {
    setCurrentWeekMonday(prev => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  // console.log('ActiveRosterPage: Current Date Array:', weekly_date);

  useEffect(() => {
    setCurrentLicenseExpiry(urgentGuards);
    // setCurrentSite(prev => prev || 'Alchmex - Kai Tak East'); 
  }, [urgentGuards, setCurrentLicenseExpiry]);

  useEffect(() => {
      setRoster(guardStatus) 
      // console.log('ActiveRosterPage: Guard Status Data:', guardStatus);
  }, [guardStatus]);

  // fetching sites from supabase database and setting them in state
  useEffect(() => {
    async function fetchSites() {
      try {
        const { data, error } = await supabase.from('sites').select('*');
        if (error) throw error;
        // console.log('Fetched sites data:', data);
        setSites(data);
      } catch (error) {
        console.error('Error fetching sites data:', error);
      }
    }
    fetchSites();
  }, [])

  // Fetching schedules from Supabase database with explicit date ordering
  useEffect(() => {
    async function fetchSchedules() {
      try {
        const { data, error } = await supabase
          .from('schedules')
          .select('*')
          .order('roster_date', { ascending: true }); // 👈 Ensures consistent order across reloads

        if (error) throw error;
        // console.log('Fetched schedules data:', data);
        setScheduleData(data);
      } catch (error) {
        console.error('Error fetching schedules data:', error);
      }
    }
    fetchSchedules();
  }, []);

  // export const getEmployeeSiteMap = (schedules) => {
  //   const map = new Map();
  //   schedules.forEach(item => {
  //     if (item.employee_id && item.site_id) {
  //       map.set(item.employee_id, item.site_id);
  //     }
  //   });
  //   return map;
  // }
  // console.log('ActiveRosterPage: Current License Expiry Context:', urgentGuards); 
  // console.log('ActiveRosterPage: Current License Expiry Context:', expiredGuards); 
  const guardExpiry = roster.filter((guard) => expiredGuards.some(expired => expired.id === guard.id));
  // console.log('ActiveRosterPage: Guards with Expired License:', guardExpiry);

  // asynchronous function to handle database updates
  const updateScheduleInSupabase = async (updatedScheduleRecord) => {
    try {
      const { data, error } = await supabase
        .from('schedules')
        .upsert(
          {
            employee_id: updatedScheduleRecord.employee_id,
            site_id: updatedScheduleRecord.site_id,
            roster_date: updatedScheduleRecord.roster_date,
            shift_type: updatedScheduleRecord.shift_type,
            duty_status: updatedScheduleRecord.duty_status,
            shift_hours: updatedScheduleRecord.shift_hours,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'employee_id, roster_date' }
        )
        .select();

      if (error) throw error;
      // console.log('Successfully updated schedule in Supabase:', data);
    } catch (error) {
      console.error('Failed to update schedule in Supabase:', error.message);
      // Optional: Add toast notification or rollback state here
    }
  }; 

  // Safely converts '2026-07-21 04:37:07.996517+00' or ISO strings to '2026-07-21'
  const formatRosterDate = (dateVal) => {
    if (!dateVal) return '';
    return String(dateVal).split('T')[0].split(' ')[0].trim();
  };

  // The toggle function that updates the scheduleData state based on the employeeId and date
  const handleToggle = async (employeeId, date) => {
    const targetDate = formatRosterDate(date);
    const targetEmpId = String(employeeId);

    // Find the existing item directly from current scheduleData
    const existingItem = scheduleData.find((item) => {
      const itemDate = formatRosterDate(item?.roster_date);
      const itemEmpId = String(item?.employee_id || '');
      return itemEmpId === targetEmpId && itemDate === targetDate;
    });

    if (!existingItem) {
      console.warn(`No matching record found for employee ${employeeId} on ${targetDate}`);
      return;
    }

    // Compute updated values directly
    const isOnDuty = existingItem.duty_status === 'On Duty';
    const newDutyStatus = isOnDuty ? 'Off Duty' : 'On Duty';
    const newShiftHours = newDutyStatus === 'Off Duty'
      ? '00:00 - 00:00'
      : (existingItem.shift_type === 'Night' ? '19:00 - 07:00' : '07:00 - 19:00');

    const updatedRecord = {
      ...existingItem,
      roster_date: targetDate,
      duty_status: newDutyStatus,
      shift_hours: newShiftHours,
    };

    // Update React local state optimistically
    setScheduleData((prevSchedule) =>
      prevSchedule.map((item) => {
        const itemDate = formatRosterDate(item?.roster_date);
        const itemEmpId = String(item?.employee_id || '');
        if (itemEmpId === targetEmpId && itemDate === targetDate) {
          return updatedRecord;
        }
        return item;
      })
    );

    // console.log("📡 Payload sent to Supabase:", updatedRecord);
    await updateScheduleInSupabase(updatedRecord);
  };
  
  // Function to toggle all shifts for a specific employee
  // const buttonToggle = (e, employeeId) => {
  //   // console.log('Button clicked! Event:', e.type);
  //   if (e.type == 'click') {
  //     setScheduleData(prevSchedule => 
  //       prevSchedule.map(employee => {
  //         if (employee?.employee_id === employeeId) { 
  //           if (employee.duty_status === 'On Leave') { 
  //             return employee; // Skip toggling if the employee is on leave
  //           }
  //           const updatedStatus = employee.duty_status === 'Off Duty' ? 'On Duty' : 'On Duty';
  //           // Set matching hours based on the resolved shift type
  //           let newShiftHours = '00:00 - 00:00';
  //           if (employee.shift_type === 'Day') {
  //             newShiftHours = '07:00 - 19:00';
  //           } else if (employee.shift_type === 'Night') {
  //             newShiftHours = '19:00 - 07:00';
  //           }
  //           return { ...employee, duty_status: updatedStatus, shift_hours: newShiftHours };
  //         };
  //         return employee;
  //         })
  //       )
  //   }
  // };

  // Function to toggle all week shifts for a specific employee
  const buttonToggle = async (e, employeeId) => {
    if (e.type !== 'click') return;

    const targetEmpId = String(employeeId);

    // Get current employee items from state
    const employeeRecords = scheduleData.filter(
      (item) => String(item?.employee_id) === targetEmpId
    );

    if (employeeRecords.length === 0) {
      console.warn(`No schedule records found for employee ID ${employeeId}`);
      return;
    }

    // Determine target status
    const hasOffDuty = employeeRecords.some((item) => item.duty_status === 'Off Duty');
    const targetDutyStatus = hasOffDuty ? 'On Duty' : 'Off Duty';

    // Build deduplicated map of updated records
    const updatedMap = new Map();

    employeeRecords.forEach((item) => {
      if (item.duty_status === 'On Leave') return; // Skip on leave

      let newShiftHours = '00:00 - 00:00';
      if (targetDutyStatus === 'On Duty') {
        newShiftHours = item.shift_type === 'Night' ? '19:00 - 07:00' : '07:00 - 19:00';
      }

      const cleanDate = String(item.roster_date).split('T')[0].split(' ')[0].trim();

      // Store in Map using composite key to prevent duplicates
      const key = `${item.employee_id}_${cleanDate}`;
      updatedMap.set(key, {
        ...item,
        roster_date: cleanDate,
        duty_status: targetDutyStatus,
        shift_hours: newShiftHours,
        updated_at: new Date().toISOString(),
      });
    });

    const updatedRecords = Array.from(updatedMap.values());

    if (updatedRecords.length === 0) return;

    // Update local React state safely
    setScheduleData((prevSchedule) =>
      prevSchedule.map((item) => {
        const cleanDate = String(item.roster_date).split('T')[0].split(' ')[0].trim();
        const key = `${item.employee_id}_${cleanDate}`;
        return updatedMap.has(key) ? updatedMap.get(key) : item;
      })
    );

    // Send clean, deduplicated array to Supabase
    try {
      // console.log("📡 Sending deduplicated bulk update to Supabase:", updatedRecords);

      const { data, error } = await supabase
        .from('schedules')
        .upsert(updatedRecords, { onConflict: 'employee_id, roster_date' })
        .select();

      if (error) throw error;
      // console.log("✅ Bulk update successful in Supabase:", data);
    } catch (err) {
      console.error("❌ Supabase bulk update failed:", err.message);
    }
  };

  // const handleDialogClick = (employeeId, date) => {
  //   const employee = roster.find(emp => emp.id === employeeId);
  //   if (employee) {
  //     const dayData = scheduleData.find(schedule => schedule.employee_id === employee.id && schedule.roster_date === date);
  //     setModalData({
  //       employeeId: employee.id,
  //       employeeName: employee.name,
  //       employeeRole: employee.role,
  //       day: dayData.roster_date,
  //       date: dayData.roster_date,
  //       defaultShift: dayData.shift_type,
  //       leaveLabel: dayData.label || 'On Leave'
  //     });
  //   }
  // };

  // const resolveLeaveConflict = (action) => {
  //   if (!modalData) {
  //     return;
  //   }
  //   setScheduleData(prevSchedule => 
  //     prevSchedule.map((employee) => {
  //       if (employee.employee_id === modalData.employeeId) {
  //         if (employee.roster_date.trim().toLowerCase() === modalData.date.trim().toLowerCase()) {
  //           if (action === 'schedule') {
  //             const isDay = modalData.defaultShift
  //             return {
  //               ...employee,
  //               duty_status: 'On Duty',
  //               shift_hours: isDay === 'Day' ? '07:00 - 19:00' : '19:00 - 07:00',
  //               label: null
  //             };
  //           } else if (action === 'off') {
  //             return {
  //               ...employee,
  //               duty_status: 'Off Duty',
  //               shift_hours: '00:00 - 00:00',
  //               label: null
  //             };
  //           }
  //         }     
  //       }
  //       return employee;
  //     })
  //   )
  //   setModalData(null);
  // }

  const handleDialogClick = (employeeId, date) => {
    const targetEmpId = String(employeeId);
    const targetDate = formatRosterDate(date);

    const employee = roster.find((emp) => String(emp.id) === targetEmpId);
    if (!employee) return;

    const dayData = scheduleData.find((schedule) => {
      const sDate = formatRosterDate(schedule?.roster_date);
      const sEmpId = String(schedule?.employee_id || '');
      return sEmpId === targetEmpId && sDate === targetDate;
    });

    setModalData({
      employeeId: employee.id,
      employeeName: employee.name,
      employeeRole: employee.role,
      day: targetDate,
      date: targetDate,
      defaultShift: dayData?.shift_type || 'Day',
      leaveLabel: dayData?.label || 'On Leave',
      scheduleRecord: dayData || null, // Keep reference to full DB record
    });
  };

  const resolveLeaveConflict = async (action) => {
    if (!modalData) return;

    const targetEmpId = String(modalData.employeeId);
    const targetDate = formatRosterDate(modalData.date);

    // Locate the existing record from scheduleData state directly
    const existingRecord = scheduleData.find((item) => {
      const itemDate = formatRosterDate(item?.roster_date);
      const itemEmpId = String(item?.employee_id || '');
      return itemEmpId === targetEmpId && itemDate === targetDate;
    });

    if (!existingRecord) {
      console.warn(`No existing schedule record found for employee ${targetEmpId} on ${targetDate}`);
      setModalData(null);
      return;
    }

    // Compute updated fields synchronously
    const isSchedule = action === 'schedule';
    const newDutyStatus = isSchedule ? 'On Duty' : 'Off Duty';
    const newShiftHours = isSchedule
      ? modalData.defaultShift === 'Night' ? '19:00 - 07:00' : '07:00 - 19:00'
      : '00:00 - 00:00';

    const updatedRecord = {
      ...existingRecord,
      roster_date: targetDate,
      duty_status: newDutyStatus,
      shift_hours: newShiftHours,
      label: null,
      updated_at: new Date().toISOString(),
    };

    // Optimistic React state update
    setScheduleData((prevSchedule) =>
      prevSchedule.map((item) => {
        const itemDate = formatRosterDate(item?.roster_date);
        const itemEmpId = String(item?.employee_id || '');
        return itemEmpId === targetEmpId && itemDate === targetDate ? updatedRecord : item;
      })
    );

    setModalData(null);

    try {
      const { error } = await supabase
        .from('schedules')
        .update({
          duty_status: updatedRecord.duty_status,
          shift_hours: updatedRecord.shift_hours,
          updated_at: updatedRecord.updated_at,
        })
        .eq('employee_id', updatedRecord.employee_id)
        .eq('roster_date', updatedRecord.roster_date);

      if (error) throw error;
      console.log('✅ Leave conflict resolved successfully in Supabase');
    } catch (err) {
      console.error('❌ Failed to update leave resolution in Supabase:', err.message);
    }
  };
  
  return (
  <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0e17] text-slate-100">
    <Header 
      message={currentLicenseExpiry} 
      next={handleNextWeek} 
      previous={handlePreviousWeek} 
      currentWeekMonday={currentWeekMonday} 
    />
    
    <main className="flex-1 p-6 overflow-auto space-y-4">
      
      {/* Main Roster Container */}
      <div className="bg-[#1a2b3a] rounded-xl shadow-2xl border border-slate-800/80 overflow-hidden">
        
        {/* Section Header & Operational Status Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800/80 bg-[#1a2b3a]">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-slate-100 tracking-wide uppercase text-xs">
              Weekly Roster Table
            </h2>
            <span className="text-slate-600">|</span>
            <span className="text-xs text-slate-400 font-medium">
              Site Overview
            </span>
          </div>

          {/* Operational Status Badges */}
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Active Guards: <strong className="text-white">42/48</strong></span>
            </div>

            <div className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span>Open Shifts: <strong className="text-white">3</strong></span>
            </div>

            <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
              <span>Unassigned: <strong className="text-white">1</strong></span>
            </div>
          </div>
        </div>

        {/* Responsive Table Wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse table-fixed">
            {/* Headers */}
            <thead>
              <tr className="bg-[#1a2b3a] border-b border-slate-800/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="w-64 p-4 pl-6">Personnel</th>
                {weekly_date.map((dateObj, index) => (
                  <th key={index} className="w-36 p-3 text-center border-l border-slate-800/40">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">
                        {dateObj.dayName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {dateObj.dayNumber}
                      </span>
                    </div>
                  </th> 
                ))}
              </tr>
            </thead>

            {/* Matrix Body */}
            <tbody className="divide-y divide-slate-800/50 bg-[#1a2b3a]">
              {(() => {
                const activeSite = sites.find(site => site.company_name === currentSite);
                const activeSiteId = activeSite?.id;
                
                return roster.map((employee) => {
                  if (!employee) return null;

                  const guard_at_site = scheduleData.find(
                    schedule => schedule?.employee_id === employee.id && schedule?.site_id === activeSiteId
                  );
                  
                  if (guard_at_site) {
                    const isDayShift = guard_at_site.shift_type === 'Day';
                    const shiftBadgeClasses = isDayShift 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';

                    const isExpired = guardExpiry?.some(guard => guard?.id === employee.id);

                    return (
                      <tr key={employee.id} className="hover:bg-[#1a2b3a] transition-colors group">
                        {/* Personnel Column */}
                        <td className="p-4 pl-6">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-semibold text-slate-100 text-sm group-hover:text-blue-400 transition-colors">
                                {employee.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-400">{employee.role}</span>
                                <span className={`inline-block border text-[9px] font-semibold px-1.5 py-0.5 rounded ${shiftBadgeClasses}`}>
                                  {guard_at_site.shift_type}
                                </span>
                              </div>
                            </div>

                            <button 
                              className="text-[10px] bg-slate-800/80 hover:bg-slate-700 text-slate-300 font-medium px-2 py-1 rounded border border-slate-700/80 transition shrink-0 whitespace-nowrap shadow-sm"
                              onClick={(e) => buttonToggle(e, employee.id)}
                            >
                              Scheduled
                            </button>  
                          </div>
                        </td>

                        {/* 7 Shift Cells */}
                        {scheduleData
                          .filter(schedule => schedule?.employee_id === employee.id)
                          .map((schedule) => (
                            <ShiftCell
                              key={schedule.id || schedule.roster_date}
                              status={isExpired ? 'expired' : schedule.duty_status}
                              hours={schedule.shift_hours}
                              label={isExpired ? 'Expired License' : schedule.duty_status}
                              employeeId={schedule.employee_id}
                              date={schedule.roster_date}
                              onToggle={handleToggle}
                              onDialogClick={handleDialogClick}
                            />
                          ))}
                      </tr>
                    );
                  }
                  return null;
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </main>

    {/* Global Dialog Box */}
    {modalData && (
      <DialogBox 
        ModalData={modalData} 
        onClose={() => setModalData(null)} 
        onResolve={resolveLeaveConflict}
      />
    )}
  </div>
);
}
