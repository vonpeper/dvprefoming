"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  AuditionRegistration,
  Production,
  EvaluationCriteria,
} from "@/types/mock";

interface StudentAggregated {
  studentFolio: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate?: string;
  age?: number | string;
  bloodType?: string;
  headshotUrl?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  medicalNotes?: string;
  experienceNotes?: string;
  history: AuditionRegistration[];
  totalAuditions: number;
  activeRoles: string[];
  highestScore?: number;
  averageScore?: number;
  latestAudition: AuditionRegistration;
}

export default function AlumnosDashboardPage() {
  const [auditions, setAuditions] = useState<AuditionRegistration[]>([]);
  const [productions, setProductions] = useState<Production[]>([]);
  const [criteria, setCriteria] = useState<EvaluationCriteria[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductionFilter, setSelectedProductionFilter] = useState("ALL");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedVocalFilter, setSelectedVocalFilter] = useState("ALL");
  const [selectedBloodFilter, setSelectedBloodFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<"NAME_ASC" | "NAME_DESC" | "FOLIO_ASC" | "SCORE_DESC" | "RECENT">("RECENT");

  // Selection & Bulk Actions
  const [selectedStudentFolios, setSelectedStudentFolios] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Modals
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [dossierTarget, setDossierTarget] = useState<AuditionRegistration | null>(null);
  const [dossierActiveTab, setDossierActiveTab] = useState<"casting" | "medical" | "evaluation" | "history">("casting");
  const [dossierEditing, setDossierEditing] = useState(false);
  const [dossierSaving, setDossierSaving] = useState(false);

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [roleTargetAudition, setRoleTargetAudition] = useState<AuditionRegistration | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState("");
  const [customRoleName, setCustomRoleName] = useState("");
  const [roleCategory, setRoleCategory] = useState<"PROTAGONICO" | "CO_PROTAGONICO" | "CUADRO_PRINCIPAL" | "ENSAMBLE_VOCAL" | "COVER_SWING">("PROTAGONICO");
  const [directorNotes, setDirectorNotes] = useState("");
  const [notifyRoleWhatsApp, setNotifyRoleWhatsApp] = useState(true);
  const [roleSaving, setRoleSaving] = useState(false);

  // New Student Modal
  const [newStudentModalOpen, setNewStudentModalOpen] = useState(false);
  const [newStudentSaving, setNewStudentSaving] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    birthDate: "",
    age: "",
    productionId: "",
    vocalRange: "Mezzo-Soprano (Belter)",
    bloodType: "O+",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "Madre / Tutor Legal",
    medicalNotes: "",
    experienceNotes: "",
    desiredRole: "",
    sendNotifications: true,
  });

  // Theatrical Dossier Form State
  const [dossierFormData, setDossierFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    studentFolio: "",
    folio: "",
    productionCode: "",
    age: "",
    birthDate: "",
    experienceNotes: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    bloodType: "",
    medicalNotes: "",
    vocalRange: "",
    danceStyles: [] as string[],
    desiredRole: "",
    castingCategory: "PROTAGONICO",
    assignedRole: "",
    notes: "",
    googleDriveUrl: "",
    headshotUrl: "",
    fullBodyPhotoUrl: "",
  });

  // Load Data
  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/auditions/list").then((res) => res.json()),
      fetch("/api/productions").then((res) => res.json()),
      fetch("/api/auditions/criteria").then((res) => res.json()),
    ])
      .then(([audData, prodData, critData]) => {
        if (audData?.auditions) {
          setAuditions(audData.auditions);
          if (dossierTarget) {
            const updated = audData.auditions.find((a: AuditionRegistration) => a.id === dossierTarget.id);
            if (updated) setDossierTarget(updated);
          }
        }
        if (prodData?.productions) {
          setProductions(prodData.productions);
          if (!newStudentForm.productionId && prodData.productions.length > 0) {
            const active = prodData.productions.find((p: Production) => p.isAuditionActive) || prodData.productions[0];
            setNewStudentForm((prev) => ({ ...prev, productionId: active.id }));
          }
        }
        if (critData?.criteria) setCriteria(critData.criteria);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // Group Auditions by Unique Student Folio / Phone
  const aggregatedStudents: StudentAggregated[] = useMemo(() => {
    const studentMap = new Map<string, AuditionRegistration[]>();

    auditions.forEach((aud) => {
      const cleanPhone = aud.phone ? aud.phone.replace(/\D/g, "").slice(-10) : "";
      const studentKey = aud.studentFolio?.trim() || (cleanPhone ? `DV-${cleanPhone.slice(-4)}` : aud.id);

      if (!studentMap.has(studentKey)) {
        studentMap.set(studentKey, []);
      }
      studentMap.get(studentKey)!.push(aud);
    });

    const result: StudentAggregated[] = [];

    studentMap.forEach((history, key) => {
      // Sort history descending by creation date
      const sortedHistory = [...history].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const latest = sortedHistory[0];

      // Collect scores
      const scoresWithOverall = sortedHistory.filter(
        (a) => a.overallScore !== undefined && a.overallScore > 0
      );
      const highestScore =
        scoresWithOverall.length > 0
          ? Math.max(...scoresWithOverall.map((a) => a.overallScore || 0))
          : undefined;
      const averageScore =
        scoresWithOverall.length > 0
          ? Number(
              (
                scoresWithOverall.reduce((acc, a) => acc + (a.overallScore || 0), 0) /
                scoresWithOverall.length
              ).toFixed(1)
            )
          : undefined;

      // Collect active roles
      const activeRoles = sortedHistory
        .filter((a) => Boolean(a.assignedRole))
        .map((a) => `${a.assignedRole} (${a.productionCode || "SNEA"})`);

      result.push({
        studentFolio: latest.studentFolio || key,
        fullName: latest.fullName,
        phone: latest.phone,
        email: latest.email,
        birthDate: latest.birthDate ? String(latest.birthDate) : undefined,
        age: latest.age,
        bloodType: latest.bloodType || "O+",
        headshotUrl: latest.headshotUrl,
        emergencyContactName: latest.emergencyContactName,
        emergencyContactPhone: latest.emergencyContactPhone,
        emergencyContactRelation: latest.emergencyContactRelation,
        medicalNotes: latest.medicalNotes,
        experienceNotes: latest.experienceNotes,
        history: sortedHistory,
        totalAuditions: sortedHistory.length,
        activeRoles,
        highestScore,
        averageScore,
        latestAudition: latest,
      });
    });

    return result;
  }, [auditions]);

  // Filtered and Sorted Students
  const filteredStudents = useMemo(() => {
    return aggregatedStudents
      .filter((st) => {
        // 1. Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = st.fullName.toLowerCase().includes(q);
          const matchFolio = st.studentFolio.toLowerCase().includes(q);
          const matchPhone = st.phone.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
          const matchEmail = st.email.toLowerCase().includes(q);
          const matchCastFolio = st.history.some((h) => (h.folio || "").toLowerCase().includes(q));
          const matchRole = st.activeRoles.some((r) => r.toLowerCase().includes(q));
          if (!matchName && !matchFolio && !matchPhone && !matchEmail && !matchCastFolio && !matchRole) {
            return false;
          }
        }

        // 2. Production filter
        if (selectedProductionFilter !== "ALL") {
          const hasProduction = st.history.some(
            (h) => h.productionId === selectedProductionFilter || h.productionCode === selectedProductionFilter
          );
          if (!hasProduction) return false;
        }

        // 3. Status filter
        if (selectedStatusFilter !== "ALL") {
          if (selectedStatusFilter === "APPROVED") {
            const isApproved = st.history.some((h) => h.status === "APPROVED" || Boolean(h.assignedRole));
            if (!isApproved) return false;
          } else if (selectedStatusFilter === "ATTENDED") {
            const isAttended = st.history.some(
              (h) => h.status === "ATTENDED" || (h.scores && h.scores.length > 0)
            );
            if (!isAttended) return false;
          } else if (selectedStatusFilter === "BLACKLIST") {
            const isBlacklisted = st.history.some((h) => h.status === "BLACKLIST");
            if (!isBlacklisted) return false;
          } else if (selectedStatusFilter === "PENDING_REVIEW") {
            const isPending = st.history.some((h) => h.status === "PENDING_REVIEW" || !h.status);
            if (!isPending) return false;
          } else if (selectedStatusFilter === "SECOND_CHANCE") {
            const isSecondChance = st.history.some((h) => h.status === "SECOND_CHANCE");
            if (!isSecondChance) return false;
          } else if (selectedStatusFilter === "REJECTED") {
            const isRejected = st.history.some((h) => h.status === "REJECTED");
            if (!isRejected) return false;
          }
        }

        // 4. Vocal Range filter
        if (selectedVocalFilter !== "ALL") {
          const matchesVocal = st.history.some(
            (h) => (h.vocalRange || "").toLowerCase().includes(selectedVocalFilter.toLowerCase())
          );
          if (!matchesVocal) return false;
        }

        // 5. Blood Type filter
        if (selectedBloodFilter !== "ALL") {
          if ((st.bloodType || "O+") !== selectedBloodFilter) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "NAME_ASC") return a.fullName.localeCompare(b.fullName);
        if (sortBy === "NAME_DESC") return b.fullName.localeCompare(a.fullName);
        if (sortBy === "FOLIO_ASC") return a.studentFolio.localeCompare(b.studentFolio);
        if (sortBy === "SCORE_DESC") return (b.averageScore || 0) - (a.averageScore || 0);
        // RECENT: latest audition timestamp
        const timeA = new Date(a.latestAudition.createdAt).getTime();
        const timeB = new Date(b.latestAudition.createdAt).getTime();
        return timeB - timeA;
      });
  }, [
    aggregatedStudents,
    searchQuery,
    selectedProductionFilter,
    selectedStatusFilter,
    selectedVocalFilter,
    selectedBloodFilter,
    sortBy,
  ]);

  // Selection handlers
  const handleToggleSelectAll = () => {
    if (selectedStudentFolios.length === filteredStudents.length) {
      setSelectedStudentFolios([]);
    } else {
      setSelectedStudentFolios(filteredStudents.map((s) => s.studentFolio));
    }
  };

  const handleToggleSelectStudent = (folio: string) => {
    setSelectedStudentFolios((prev) =>
      prev.includes(folio) ? prev.filter((f) => f !== folio) : [...prev, folio]
    );
  };

  // Open Full Theatrical Student Dossier Modal
  const openTheatricalDossier = (
    aud: AuditionRegistration,
    tab: "casting" | "medical" | "evaluation" | "history" = "casting",
    startInEditMode = false
  ) => {
    setDossierTarget(aud);
    setDossierActiveTab(tab);
    setDossierEditing(startInEditMode);
    setDossierFormData({
      fullName: aud.fullName || "",
      phone: aud.phone || "",
      email: aud.email || "",
      studentFolio: aud.studentFolio || "",
      folio: aud.folio || "",
      productionCode: aud.productionCode || "",
      age: aud.age !== undefined ? String(aud.age) : "",
      birthDate: aud.birthDate
        ? typeof aud.birthDate === "string"
          ? aud.birthDate.slice(0, 10)
          : new Date(aud.birthDate).toISOString().slice(0, 10)
        : "",
      experienceNotes: aud.experienceNotes || "",
      emergencyContactName: aud.emergencyContactName || "Contacto Familiar Registrado",
      emergencyContactPhone:
        aud.emergencyContactPhone ||
        (aud.phone ? `477${aud.phone.replace(/\D/g, "").slice(-7)}` : "4776558156"),
      emergencyContactRelation: aud.emergencyContactRelation || "Madre / Tutor Legal",
      bloodType: aud.bloodType || "O+",
      medicalNotes:
        aud.medicalNotes ||
        "Sin padecimientos crónicos declarados. Acondicionamiento físico óptimo para ensayos y escena.",
      vocalRange: aud.vocalRange || "Mezzo-Soprano (Belter)",
      danceStyles: aud.danceStyles || ["Jazz Musical", "Expresión Corporal", "Urbano"],
      desiredRole: aud.desiredRole || "Personaje asignado por Dirección General",
      castingCategory: aud.castingCategory || (aud.assignedRole ? "PROTAGONICO" : "CUADRO_PRINCIPAL"),
      assignedRole: aud.assignedRole || "",
      notes: aud.notes || "",
      googleDriveUrl: aud.googleDriveUrl || "",
      headshotUrl: aud.headshotUrl || "",
      fullBodyPhotoUrl: aud.fullBodyPhotoUrl || "",
    });
    setDossierModalOpen(true);
  };

  // Save updates to Theatrical Technical Sheet / Dossier
  const handleSaveTheatricalDossier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dossierTarget) return;

    setDossierSaving(true);
    try {
      const res = await fetch("/api/auditions/dossier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: dossierTarget.id,
          ...dossierFormData,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✓ Cédula técnica y datos del aspirante guardados correctamente.");
        setDossierTarget(data.audition);
        setDossierEditing(false);
        loadData();
      } else {
        alert(data.error || "Error al actualizar la cédula técnica.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al guardar los datos.");
    } finally {
      setDossierSaving(false);
    }
  };

  // Delete Single Audition Registration
  const handleDeleteSingleAudition = async (id: string, candidateName?: string) => {
    if (
      !confirm(
        `¿Estás seguro de que deseas ELIMINAR el registro de audición de "${candidateName || id}"?\n\nEsta acción eliminará su calificación y datos de esta convocatoria.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/auditions/dossier?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("✓ Registro de audición eliminado correctamente.");
        if (dossierModalOpen && dossierTarget?.id === id) {
          setDossierModalOpen(false);
        }
        loadData();
      } else {
        alert(data.error || "Error al eliminar el registro.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al eliminar.");
    }
  };

  // Delete Full Student Dossier (All historical records)
  const handleDeleteStudentExpediente = async (studentFolioOrPhone: string, studentName: string) => {
    if (
      !confirm(
        `⚠️ ALERTA DE SEGURIDAD:\n\n¿Deseas ELIMINAR TODO EL EXPEDIENTE del alumno "${studentName}" (${studentFolioOrPhone}) y todas sus participaciones históricas en todas las obras?\n\nEsta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/auditions/dossier?studentFolio=${encodeURIComponent(studentFolioOrPhone)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Expediente de ${studentName} eliminado (${data.deletedCount} registros eliminados).`);
        if (dossierModalOpen) {
          setDossierModalOpen(false);
        }
        setSelectedStudentFolios((prev) => prev.filter((f) => f !== studentFolioOrPhone));
        loadData();
      } else {
        alert(data.error || "Error al eliminar el expediente.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al eliminar expediente.");
    }
  };

  // Bulk Delete Selected Students
  const handleBulkDelete = async () => {
    if (selectedStudentFolios.length === 0) return;
    if (
      !confirm(
        `⚠️ ¿Estás seguro de que deseas ELIMINAR el expediente de los ${selectedStudentFolios.length} alumnos seleccionados? Esta acción es irreversible.`
      )
    ) {
      return;
    }

    setBulkActionLoading(true);
    try {
      // Find all audition IDs belonging to selected students
      const allTargetAuditionIds = auditions
        .filter((a) => {
          const cleanPhone = a.phone ? a.phone.replace(/\D/g, "").slice(-10) : "";
          const folio = a.studentFolio || `DV-${cleanPhone.slice(-4)}`;
          return selectedStudentFolios.includes(folio);
        })
        .map((a) => a.id);

      const res = await fetch("/api/auditions/bulk-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE",
          ids: allTargetAuditionIds,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ ${data.message || "Alumnos eliminados con éxito."}`);
        setSelectedStudentFolios([]);
        loadData();
      } else {
        alert(data.error || "Error al eliminar alumnos.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al eliminar.");
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Assign Role Modal Controls
  const openAssignRoleModal = (aud: AuditionRegistration) => {
    setRoleTargetAudition(aud);
    setSelectedRoleName(aud.assignedRole || "");
    setCustomRoleName(aud.assignedRole || "");
    setDirectorNotes(aud.notes || "");
    setNotifyRoleWhatsApp(true);
    setRoleModalOpen(true);
  };

  const handleConfirmRoleAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleTargetAudition) return;

    const finalRole = customRoleName.trim() || selectedRoleName;
    if (!finalRole) {
      alert("Por favor indica el nombre del personaje o rol a asignar.");
      return;
    }

    setRoleSaving(true);
    try {
      const res = await fetch("/api/auditions/assign-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: roleTargetAudition.id,
          assignedRole: finalRole,
          castingCategory: roleCategory,
          notes: directorNotes,
          notifyWhatsApp: notifyRoleWhatsApp,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ Personaje "${finalRole}" asignado exitosamente.`);
        setRoleModalOpen(false);
        loadData();
      } else {
        alert(data.error || "Error al asignar el personaje.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    } finally {
      setRoleSaving(false);
    }
  };

  // Create New Student Manually
  const handleCreateNewStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.fullName.trim() || !newStudentForm.phone.trim()) {
      alert("El nombre completo y el teléfono son obligatorios.");
      return;
    }

    setNewStudentSaving(true);
    try {
      const prod = productions.find((p) => p.id === newStudentForm.productionId) || productions[0];
      const res = await fetch("/api/auditions/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: newStudentForm.fullName.trim(),
          phone: newStudentForm.phone.trim(),
          email: newStudentForm.email.trim() || undefined,
          birthDate: newStudentForm.birthDate || undefined,
          age: newStudentForm.age ? parseInt(newStudentForm.age, 10) : undefined,
          productionId: prod?.id,
          productionName: prod?.title,
          experienceNotes: newStudentForm.experienceNotes,
          preferredSchedule: "Turno Asignado por Administración",
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        // Now update extra dossier fields (blood type, emergency contact, vocal range)
        if (data.audition?.id) {
          await fetch("/api/auditions/dossier", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: data.audition.id,
              bloodType: newStudentForm.bloodType,
              emergencyContactName: newStudentForm.emergencyContactName,
              emergencyContactPhone: newStudentForm.emergencyContactPhone,
              emergencyContactRelation: newStudentForm.emergencyContactRelation,
              medicalNotes: newStudentForm.medicalNotes,
              vocalRange: newStudentForm.vocalRange,
              desiredRole: newStudentForm.desiredRole,
            }),
          });
        }

        showToast(`✓ Alumno "${newStudentForm.fullName}" registrado con Folio: ${data.audition?.folio || "OK"}.`);
        setNewStudentModalOpen(false);
        setNewStudentForm({
          fullName: "",
          phone: "",
          email: "",
          birthDate: "",
          age: "",
          productionId: productions[0]?.id || "",
          vocalRange: "Mezzo-Soprano (Belter)",
          bloodType: "O+",
          emergencyContactName: "",
          emergencyContactPhone: "",
          emergencyContactRelation: "Madre / Tutor Legal",
          medicalNotes: "",
          experienceNotes: "",
          desiredRole: "",
          sendNotifications: true,
        });
        loadData();
      } else {
        alert(data.error || "Error al registrar al alumno.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión al registrar alumno.");
    } finally {
      setNewStudentSaving(false);
    }
  };

  // Export CSV of Students
  const exportStudentsCSV = () => {
    const listToExport =
      selectedStudentFolios.length > 0
        ? filteredStudents.filter((s) => selectedStudentFolios.includes(s.studentFolio))
        : filteredStudents;

    if (listToExport.length === 0) {
      alert("No hay alumnos para exportar.");
      return;
    }

    const headers = [
      "Folio Alumno",
      "Nombre Completo",
      "Telefono",
      "Email",
      "Edad",
      "Grupo Sanguineo",
      "Total Convocatorias",
      "Roles Asignados",
      "Puntaje Promedio",
      "Contacto Emergencia",
      "Tel Emergencia",
      "Padecimientos Medicos",
    ];

    const rows = listToExport.map((s) => [
      `"${s.studentFolio}"`,
      `"${s.fullName}"`,
      `"${s.phone}"`,
      `"${s.email || ""}"`,
      `"${s.age || ""}"`,
      `"${s.bloodType || "O+"}"`,
      `"${s.totalAuditions}"`,
      `"${s.activeRoles.join(" | ")}"`,
      `"${s.averageScore || "Sin calificar"}"`,
      `"${s.emergencyContactName || ""}"`,
      `"${s.emergencyContactPhone || ""}"`,
      `"${(s.medicalNotes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `padron_alumnos_dv_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Padrón de ${listToExport.length} alumnos descargado en CSV.`);
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-8 max-w-[1600px] mx-auto min-h-screen text-slate-100 font-sans">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-purple-600 text-white font-bold text-xs py-3 px-5 rounded-2xl shadow-2xl border border-purple-400 flex items-center gap-3 animate-fade-in">
          <span>🔔</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-purple-200 hover:text-white text-sm ml-2">
            ✕
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#161B22] p-6 rounded-3xl border border-[#30363D] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-950/80 border-2 border-indigo-500/50 flex items-center justify-center text-3xl shadow-inner">
            🎓
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Padrón de Alumnado & Aspirantes
              </h1>
              <span className="bg-indigo-950 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-black uppercase">
                {aggregatedStudents.length} Registrados
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Directorio oficial, fichas médicas de escenario, expedientes históricos multi-obra y gestión teatral de DV Performing Arts.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportStudentsCSV}
            className="px-4 py-2.5 bg-[#21262D] hover:bg-[#30363D] text-slate-200 border border-[#30363D] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow"
            title="Exportar padrón completo a formato Excel / CSV"
          >
            <span>📥</span>
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={() => setNewStudentModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02]"
          >
            <span>➕</span>
            <span>Registrar Nuevo Alumno</span>
          </button>
        </div>
      </div>

      {/* 5-KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#161B22] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-1 shadow-sm">
          <span className="text-[10px] font-mono uppercase text-slate-400">Total Alumnos</span>
          <span className="text-2xl font-black text-white font-mono">
            {aggregatedStudents.length}
          </span>
          <span className="text-[10px] text-indigo-400 font-mono">Padrón histórico</span>
        </div>

        <div className="bg-[#161B22] border border-emerald-500/30 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-gradient-to-b from-emerald-950/20 to-[#161B22]">
          <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">En Elenco Activo</span>
          <span className="text-2xl font-black text-emerald-300 font-mono">
            {aggregatedStudents.filter((s) => s.activeRoles.length > 0).length}
          </span>
          <span className="text-[10px] text-emerald-400/80 font-mono">Actores / Cantantes</span>
        </div>

        <div className="bg-[#161B22] border border-purple-500/30 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-gradient-to-b from-purple-950/20 to-[#161B22]">
          <span className="text-[10px] font-mono uppercase text-purple-400 font-bold">Aspirantes en Casting</span>
          <span className="text-2xl font-black text-purple-300 font-mono">
            {aggregatedStudents.filter((s) => s.latestAudition.status === "PENDING_REVIEW" || !s.latestAudition.status).length}
          </span>
          <span className="text-[10px] text-purple-400/80 font-mono">Por deliberar</span>
        </div>

        <div className="bg-[#161B22] border border-rose-500/30 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-gradient-to-b from-rose-950/20 to-[#161B22]">
          <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">Fichas Médicas</span>
          <span className="text-2xl font-black text-rose-300 font-mono">
            {aggregatedStudents.filter((s) => Boolean(s.bloodType)).length}
          </span>
          <span className="text-[10px] text-rose-400/80 font-mono">Seguridad de escena</span>
        </div>

        <div className="bg-[#161B22] border border-amber-500/30 rounded-2xl p-4 flex flex-col gap-1 shadow-sm bg-gradient-to-b from-amber-950/20 to-[#161B22]">
          <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">Audiciones Registradas</span>
          <span className="text-2xl font-black text-amber-300 font-mono">
            {auditions.length}
          </span>
          <span className="text-[10px] text-amber-400/80 font-mono">Participaciones totales</span>
        </div>
      </div>

      {/* Advanced Filters & Search Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-3xl p-5 flex flex-col gap-4 shadow-sm">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Universal Search Input */}
          <div className="flex-1 relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Buscar por nombre, Folio Alumno (DV-XXXX), teléfono, correo, folio casting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] focus:border-indigo-500 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Clear Button if any filter active */}
          {(searchQuery || selectedProductionFilter !== "ALL" || selectedStatusFilter !== "ALL" || selectedVocalFilter !== "ALL" || selectedBloodFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedProductionFilter("ALL");
                setSelectedStatusFilter("ALL");
                setSelectedVocalFilter("ALL");
                setSelectedBloodFilter("ALL");
              }}
              className="px-3 py-2 text-xs font-mono text-purple-400 hover:text-purple-300 cursor-pointer underline whitespace-nowrap self-end lg:self-center"
            >
              Restablecer Filtros
            </button>
          )}
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-[#21262D] text-xs">
          
          {/* Production Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">🎭 Obra / Producción:</label>
            <select
              value={selectedProductionFilter}
              onChange={(e) => setSelectedProductionFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todas las Obras</option>
              {productions.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.title} {prod.isAuditionActive ? "⭐" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Status / Role Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">🏷️ Estatus / Rol:</label>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todos los Estatus</option>
              <option value="APPROVED">🏆 En Elenco Confirmado</option>
              <option value="ATTENDED">✅ Asistieron / Calificados</option>
              <option value="PENDING_REVIEW">⏳ Aspirantes Pendientes</option>
              <option value="SECOND_CHANCE">🔁 2ª Oportunidad</option>
              <option value="REJECTED">⚪ No Seleccionados</option>
              <option value="BLACKLIST">🚫 Lista Negra / Vetados</option>
            </select>
          </div>

          {/* Vocal Range Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">🎤 Tesitura Vocal:</label>
            <select
              value={selectedVocalFilter}
              onChange={(e) => setSelectedVocalFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">Todas las Tesituras</option>
              <option value="Soprano">Soprano</option>
              <option value="Mezzo-Soprano">Mezzo-Soprano</option>
              <option value="Contralto">Contralto</option>
              <option value="Tenor">Tenor</option>
              <option value="Barítono">Barítono</option>
              <option value="Bajo">Bajo</option>
            </select>
          </div>

          {/* Blood Type Filter */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">🩸 Grupo Sanguíneo:</label>
            <select
              value={selectedBloodFilter}
              onChange={(e) => setSelectedBloodFilter(e.target.value)}
              className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2 text-xs text-slate-200 focus:outline-none font-mono"
            >
              <option value="ALL">Todos los Grupos</option>
              <option value="O+">O Positivo (O+)</option>
              <option value="O-">O Negativo (O-)</option>
              <option value="A+">A Positivo (A+)</option>
              <option value="A-">A Negativo (A-)</option>
              <option value="B+">B Positivo (B+)</option>
              <option value="B-">B Negativo (B-)</option>
              <option value="AB+">AB Positivo (AB+)</option>
              <option value="AB-">AB Negativo (AB-)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-mono text-slate-400 font-bold uppercase">↕️ Ordenar Por:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
            >
              <option value="RECENT">Más Reciente</option>
              <option value="NAME_ASC">Nombre (A - Z)</option>
              <option value="NAME_DESC">Nombre (Z - A)</option>
              <option value="FOLIO_ASC">Folio Alumno (Asc)</option>
              <option value="SCORE_DESC">Mayor Calificación</option>
            </select>
          </div>

        </div>
      </div>

      {/* Bulk Actions Floating Bar */}
      {selectedStudentFolios.length > 0 && (
        <div className="p-3.5 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-2 border-indigo-500 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-2xl animate-fade-in sticky top-20 z-20">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚡</span>
            <div className="flex flex-col">
              <span className="text-xs font-black text-white">
                {selectedStudentFolios.length} alumno(s) seleccionado(s)
              </span>
              <span className="text-[10px] text-indigo-300 font-mono">
                Aplica acciones en lote sobre el padrón seleccionado
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportStudentsCSV}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <span>📥</span>
              <span>Exportar Selección ({selectedStudentFolios.length})</span>
            </button>

            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="px-3.5 py-2 bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <span>🗑️</span>
              <span>Eliminar Expedientes ({selectedStudentFolios.length})</span>
            </button>

            <button
              onClick={() => setSelectedStudentFolios([])}
              className="px-2.5 py-2 text-slate-400 hover:text-white text-xs font-mono"
            >
              Deseleccionar
            </button>
          </div>
        </div>
      )}

      {/* Main Student Table */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0D1117] text-slate-400 font-mono text-[11px] uppercase border-b border-[#30363D]">
                <th className="py-3.5 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={filteredStudents.length > 0 && selectedStudentFolios.length === filteredStudents.length}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 text-indigo-600 rounded bg-[#161B22] border-[#30363D] cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-3">Folio Permanente</th>
                <th className="py-3.5 px-3">Alumno / Aspirante</th>
                <th className="py-3.5 px-3">Contacto Directo</th>
                <th className="py-3.5 px-3">Trayectoria & Obras</th>
                <th className="py-3.5 px-3 text-center">Ficha Médica</th>
                <th className="py-3.5 px-3 text-center">Calificación</th>
                <th className="py-3.5 px-3 text-right">Gestión</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#30363D]/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-slate-500 font-mono text-xs">
                    <span className="inline-block w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Cargando padrón de alumnos de DV Performing Arts...
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-slate-500 font-mono text-xs">
                    No se encontraron alumnos con los criterios de búsqueda o filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isSelected = selectedStudentFolios.includes(st.studentFolio);
                  return (
                    <tr
                      key={st.studentFolio}
                      className={`hover:bg-[#21262D]/60 transition-colors ${
                        isSelected ? "bg-indigo-950/20" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelectStudent(st.studentFolio)}
                          className="w-4 h-4 text-indigo-600 rounded bg-[#161B22] border-[#30363D] cursor-pointer"
                        />
                      </td>

                      {/* Folios */}
                      <td className="py-3.5 px-3 font-mono text-xs">
                        <div className="flex flex-col gap-1">
                          <span
                            className="font-black text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-md border border-purple-500/40 text-[10px] w-fit shadow-sm"
                            title="Folio Permanente de Alumno"
                          >
                            🎓 {st.studentFolio}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">
                            🎫 {st.latestAudition.folio}
                          </span>
                        </div>
                      </td>

                      {/* Candidate Avatar & Name */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div
                            onClick={() => openTheatricalDossier(st.latestAudition, "casting")}
                            className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 border border-indigo-500/50 shrink-0 cursor-pointer hover:border-purple-400 transition-colors flex items-center justify-center shadow"
                            title="Clic para ver Cédula Técnica & Ficha Médica"
                          >
                            {st.headshotUrl ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={st.headshotUrl}
                                alt={st.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-base">👤</span>
                            )}
                          </div>

                          <div className="flex flex-col min-w-0">
                            <span
                              onClick={() => openTheatricalDossier(st.latestAudition, "casting")}
                              className="font-bold text-white text-xs hover:text-indigo-300 cursor-pointer transition-colors truncate flex items-center gap-1.5"
                            >
                              <span>{st.fullName}</span>
                              {st.bloodType && (
                                <span className="text-[8px] font-mono font-bold text-rose-300 bg-rose-950/80 border border-rose-500/30 px-1 rounded">
                                  🩸 {st.bloodType}
                                </span>
                              )}
                            </span>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                              {st.age && <span>{st.age} años</span>}
                              <span>•</span>
                              <span className="text-purple-300">{st.latestAudition.vocalRange || "Vocal"}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Direct */}
                      <td className="py-3.5 px-3 font-mono text-xs">
                        <div className="flex items-center gap-2 text-slate-200">
                          <a
                            href={`tel:${st.phone.replace(/\D/g, "")}`}
                            className="hover:text-emerald-400 font-bold"
                            title="Llamar por teléfono"
                          >
                            📞 {st.phone}
                          </a>
                          <a
                            href={`https://wa.me/521${st.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${st.fullName}, te contactamos de la Dirección de DV Performing Arts.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 bg-emerald-950/80 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded border border-emerald-500/40 text-[10px] transition-colors"
                            title="Abrir chat en WhatsApp"
                          >
                            💬
                          </a>
                        </div>
                        <div className="text-slate-400 text-[10px] truncate max-w-[140px] mt-0.5">
                          {st.email || "Sin correo"}
                        </div>
                      </td>

                      {/* Multi-Production Trayectoria */}
                      <td className="py-3.5 px-3">
                        <div className="flex flex-col gap-1 max-w-[200px]">
                          <div className="flex flex-wrap items-center gap-1">
                            {st.history.map((h) => (
                              <span
                                key={h.id}
                                className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${
                                  h.assignedRole
                                    ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                                    : "bg-indigo-950/80 text-indigo-300 border-indigo-500/40"
                                }`}
                                title={`${h.productionName || "DV"} - ${h.assignedRole ? `Rol: ${h.assignedRole}` : h.status || "Audición"}`}
                              >
                                🎭 {h.productionCode || "SNEA"}: {h.assignedRole || (h.status === "APPROVED" ? "Elenco" : "Postulante")}
                              </span>
                            ))}
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {st.totalAuditions} {st.totalAuditions === 1 ? "convocatoria" : "convocatorias"}
                          </span>
                        </div>
                      </td>

                      {/* Medical Card Pill */}
                      <td className="py-3.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => openTheatricalDossier(st.latestAudition, "medical")}
                          className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900 cursor-pointer transition-colors"
                          title="Ver contacto de emergencia y ficha médica"
                        >
                          🚑 {st.bloodType || "O+"}
                        </button>
                      </td>

                      {/* Overall Score */}
                      <td className="py-3.5 px-3 text-center font-mono">
                        {st.averageScore ? (
                          <button
                            type="button"
                            onClick={() => openTheatricalDossier(st.latestAudition, "evaluation")}
                            className="px-2 py-0.5 rounded-lg text-xs font-black bg-purple-950 text-purple-300 border border-purple-500/40 hover:bg-purple-900 cursor-pointer"
                            title="Ver desglose de jueces"
                          >
                            ⭐ {st.averageScore}/10
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[10px] font-mono">Sin calificar</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {/* Dossier Sheet */}
                          <button
                            type="button"
                            onClick={() => openTheatricalDossier(st.latestAudition, "casting")}
                            className="p-1.5 bg-[#21262D] hover:bg-[#30363D] text-purple-300 hover:text-white border border-[#30363D] rounded-lg text-xs cursor-pointer transition-colors"
                            title="Abrir Cédula Técnica & Ficha Médica"
                          >
                            📜
                          </button>

                          {/* Edit Student */}
                          <button
                            type="button"
                            onClick={() => openTheatricalDossier(st.latestAudition, "casting", true)}
                            className="p-1.5 bg-[#21262D] hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 border border-[#30363D] rounded-lg text-xs cursor-pointer transition-colors"
                            title="Editar datos del alumno / cédula"
                          >
                            ✏️
                          </button>

                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/521${st.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${st.fullName}, te contactamos de la Dirección de DV Performing Arts.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-[#21262D] hover:bg-emerald-950/60 text-emerald-400 hover:text-emerald-200 border border-[#30363D] rounded-lg text-xs cursor-pointer transition-colors"
                            title="Enviar WhatsApp"
                          >
                            💬
                          </a>

                          {/* Assign Role */}
                          <button
                            type="button"
                            onClick={() => openAssignRoleModal(st.latestAudition)}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors shadow-sm"
                            title="Asignar papel en la obra"
                          >
                            🎭
                          </button>

                          {/* Delete Full Dossier */}
                          <button
                            type="button"
                            onClick={() => handleDeleteStudentExpediente(st.studentFolio, st.fullName)}
                            className="p-1.5 bg-[#21262D] hover:bg-rose-950/60 text-rose-400 hover:text-rose-200 border border-[#30363D] rounded-lg text-xs cursor-pointer transition-colors"
                            title="Eliminar todo el expediente del alumno"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL: FULL THEATRICAL DOSSIER ================= */}
      {dossierModalOpen && dossierTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 cursor-pointer"
          onClick={() => setDossierModalOpen(false)}
        >
          <div
            className="bg-[#161B22] border-2 border-purple-500/80 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden cursor-default max-h-[92vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-[#30363D] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-800 border-2 border-purple-500 shrink-0 flex items-center justify-center shadow-lg relative group">
                  {dossierTarget.headshotUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={dossierTarget.headshotUrl}
                      alt={dossierTarget.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl">🎭</span>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-mono bg-purple-600 text-white px-2.5 py-0.5 rounded-md font-black uppercase tracking-wider shadow-sm">
                      🎓 {dossierTarget.studentFolio || "DV-0482"}
                    </span>
                    <span className="text-[10px] font-mono bg-indigo-900 text-indigo-200 border border-indigo-500/40 px-2 py-0.5 rounded-md font-bold uppercase">
                      🎭 {dossierTarget.productionCode || "SNEA"}
                    </span>
                    <span className="text-[10px] font-mono bg-[#0D1117] text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-md font-bold uppercase">
                      🎫 Folio: {dossierTarget.folio}
                    </span>
                    {dossierTarget.bloodType && (
                      <span className="text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-md font-bold">
                        🩸 {dossierTarget.bloodType}
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{dossierTarget.fullName}</span>
                    {dossierTarget.assignedRole && (
                      <span className="text-xs bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg font-bold">
                        Rol: {dossierTarget.assignedRole}
                      </span>
                    )}
                  </h2>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 font-mono">
                    <a
                      href={`tel:${dossierTarget.phone.replace(/\D/g, "")}`}
                      className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold underline"
                    >
                      <span>📞</span> {dossierTarget.phone}
                    </a>
                    <span>&bull;</span>
                    <span className="text-slate-400">✉️ {dossierTarget.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <a
                  href={`https://wa.me/521${dossierTarget.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hola ${dossierTarget.fullName}, te contactamos de la Dirección de DV Performing Arts.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow"
                >
                  <span>💬</span>
                  <span className="hidden sm:inline">WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={() => setDossierEditing(!dossierEditing)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    dossierEditing
                      ? "bg-amber-600 hover:bg-amber-500 text-white border-amber-400"
                      : "bg-[#21262D] hover:bg-[#30363D] text-slate-200 border-[#30363D]"
                  }`}
                >
                  <span>{dossierEditing ? "👁️ Modo Lectura" : "✏️ Editar Cédula"}</span>
                </button>

                <button
                  onClick={() => setDossierModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-[#21262D] hover:bg-rose-950/60 hover:text-rose-300 border border-[#30363D] transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Dossier Tabs Navigation */}
            <div className="bg-[#0D1117] px-6 py-2.5 border-b border-[#30363D] flex flex-wrap gap-2">
              {[
                { id: "casting", label: "🎭 Cédula Técnica & Obra", icon: "🎭" },
                { id: "medical", label: "🚑 Ficha Médica & Contacto Emergencia", icon: "🚑" },
                { id: "evaluation", label: "⚖️ Evaluación & Mesa Jurados", icon: "⚖️" },
                {
                  id: "history",
                  label: "📜 Trayectoria Multi-Obra",
                  icon: "📜",
                  badge: auditions.filter((a) => (dossierTarget.studentFolio && a.studentFolio === dossierTarget.studentFolio) || (dossierTarget.phone && a.phone.replace(/\D/g, "").slice(-10) === dossierTarget.phone.replace(/\D/g, "").slice(-10))).length,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDossierActiveTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    dossierActiveTab === tab.id
                      ? "bg-purple-600 text-white shadow-md shadow-purple-950/50"
                      : "text-slate-400 hover:text-white hover:bg-[#161B22]"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className="text-[10px] font-mono bg-black/40 px-1.5 py-0.2 rounded-full font-black">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Dossier Content */}
            <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6 text-xs">
              
              {/* TAB 1: CÉDULA TÉCNICA */}
              {dossierActiveTab === "casting" && (
                <form onSubmit={handleSaveTheatricalDossier} className="flex flex-col gap-5">
                  
                  {/* Candidate Identity Edit Card */}
                  <div className="bg-[#0D1117] border border-indigo-500/40 rounded-2xl p-4 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between border-b border-[#21262D] pb-2">
                      <span className="font-bold text-white uppercase tracking-wider font-mono text-xs flex items-center gap-1.5">
                        <span>👤</span> Ficha de Identidad & Datos del Aspirante
                      </span>
                      <span className="text-[10px] font-mono text-indigo-400 font-bold">
                        {dossierEditing ? "✏️ Editando Ficha General" : `Folio Alumno: ${dossierFormData.studentFolio || dossierTarget.studentFolio || "DV-0482"}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-300">Nombre Completo:</label>
                        {dossierEditing ? (
                          <input
                            type="text"
                            value={dossierFormData.fullName}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, fullName: e.target.value })}
                            className="bg-[#161B22] border border-purple-500/60 focus:border-indigo-500 rounded-xl p-2 text-xs text-white font-bold"
                            required
                          />
                        ) : (
                          <div className="p-2 bg-[#161B22] border border-[#21262D] rounded-xl text-white font-bold text-xs truncate">
                            {dossierFormData.fullName || dossierTarget.fullName}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-300">Teléfono / WhatsApp:</label>
                        {dossierEditing ? (
                          <input
                            type="tel"
                            value={dossierFormData.phone}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, phone: e.target.value })}
                            className="bg-[#161B22] border border-emerald-500/60 focus:border-emerald-400 rounded-xl p-2 text-xs text-emerald-400 font-mono font-bold"
                            required
                          />
                        ) : (
                          <div className="p-2 bg-[#161B22] border border-[#21262D] rounded-xl text-emerald-400 font-mono font-bold text-xs truncate">
                            {dossierFormData.phone || dossierTarget.phone}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-300">Correo Electrónico:</label>
                        {dossierEditing ? (
                          <input
                            type="email"
                            value={dossierFormData.email}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, email: e.target.value })}
                            className="bg-[#161B22] border border-[#30363D] focus:border-indigo-500 rounded-xl p-2 text-xs text-white"
                            required
                          />
                        ) : (
                          <div className="p-2 bg-[#161B22] border border-[#21262D] rounded-xl text-slate-300 text-xs truncate">
                            {dossierFormData.email || dossierTarget.email}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <span>🎓</span> Folio Permanente Alumno:
                        </label>
                        {dossierEditing ? (
                          <input
                            type="text"
                            value={dossierFormData.studentFolio}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, studentFolio: e.target.value })}
                            placeholder="DV-XXXX"
                            className="bg-[#161B22] border border-purple-500/50 rounded-xl p-2 text-xs text-purple-300 font-mono font-bold uppercase"
                          />
                        ) : (
                          <div className="p-2 bg-[#161B22] border border-[#21262D] rounded-xl text-purple-300 font-mono font-bold text-xs">
                            {dossierFormData.studentFolio || dossierTarget.studentFolio || "DV-0482"}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                          <span>🎫</span> Folio Casting / Audición:
                        </label>
                        {dossierEditing ? (
                          <input
                            type="text"
                            value={dossierFormData.folio}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, folio: e.target.value })}
                            placeholder="AUD-XXXX"
                            className="bg-[#161B22] border border-[#30363D] rounded-xl p-2 text-xs text-white font-mono font-bold uppercase"
                          />
                        ) : (
                          <div className="p-2 bg-[#161B22] border border-[#21262D] rounded-xl text-white font-mono font-bold text-xs">
                            {dossierFormData.folio || dossierTarget.folio}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-semibold text-slate-300">Fecha Nacimiento / Edad:</label>
                        {dossierEditing ? (
                          <div className="flex gap-2">
                            <input
                              type="date"
                              value={dossierFormData.birthDate}
                              onChange={(e) => setDossierFormData({ ...dossierFormData, birthDate: e.target.value })}
                              className="flex-1 bg-[#161B22] border border-[#30363D] rounded-xl p-2 text-xs text-white"
                            />
                            <input
                              type="number"
                              value={dossierFormData.age}
                              onChange={(e) => setDossierFormData({ ...dossierFormData, age: e.target.value })}
                              placeholder="Edad"
                              className="w-16 bg-[#161B22] border border-[#30363D] rounded-xl p-2 text-xs text-white text-center font-mono"
                            />
                          </div>
                        ) : (
                          <div className="p-2 bg-[#161B22] border border-[#21262D] rounded-xl text-slate-300 text-xs font-mono">
                            {dossierFormData.birthDate || (dossierTarget.birthDate ? String(dossierTarget.birthDate).slice(0, 10) : "No registrada")}
                            {dossierFormData.age ? ` (${dossierFormData.age} años)` : dossierTarget.age ? ` (${dossierTarget.age} años)` : ""}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left Column: Theatrical Profile */}
                    <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-3.5">
                      <div className="flex items-center justify-between border-b border-[#21262D] pb-2">
                        <span className="font-bold text-white uppercase tracking-wider font-mono text-xs flex items-center gap-1.5">
                          <span>🎭</span> Perfil Escénico & Convocatoria
                        </span>
                        <span className="text-[10px] font-mono text-purple-400 font-semibold">
                          {dossierTarget.productionName || "DV Performing Arts"}
                        </span>
                      </div>

                      {/* Vocal Range */}
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-slate-300 flex items-center gap-1">
                          <span>🎤</span> Tesitura Vocal:
                        </label>
                        {dossierEditing ? (
                          <select
                            value={dossierFormData.vocalRange}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, vocalRange: e.target.value })}
                            className="bg-[#161B22] border border-purple-500/60 rounded-xl p-2.5 text-xs text-white font-bold"
                          >
                            <option value="Soprano Ligera">Soprano Ligera</option>
                            <option value="Soprano Lírica">Soprano Lírica</option>
                            <option value="Soprano Coloratura">Soprano Coloratura</option>
                            <option value="Mezzo-Soprano (Belter)">Mezzo-Soprano (Belter)</option>
                            <option value="Mezzo-Soprano Lírica">Mezzo-Soprano Lírica</option>
                            <option value="Contralto / Alto">Contralto / Alto</option>
                            <option value="Tenor Ligero">Tenor Ligero</option>
                            <option value="Tenor Lírico (Belter)">Tenor Lírico (Belter)</option>
                            <option value="Barítono Lírico">Barítono Lírico</option>
                            <option value="Barítono Dramático">Barítono Dramático</option>
                            <option value="Bajo">Bajo</option>
                          </select>
                        ) : (
                          <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-xl text-white font-bold text-xs flex items-center justify-between">
                            <span>{dossierFormData.vocalRange || "No especificada"}</span>
                            <span className="text-[10px] font-mono text-purple-400">Rango Vocal</span>
                          </div>
                        )}
                      </div>

                      {/* Desired Role */}
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-slate-300 flex items-center gap-1">
                          <span>🎯</span> Personaje / Papel Deseado:
                        </label>
                        {dossierEditing ? (
                          <input
                            type="text"
                            value={dossierFormData.desiredRole}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, desiredRole: e.target.value })}
                            placeholder="Ej. Benny, Mariana, Elenco Principal..."
                            className="bg-[#161B22] border border-[#30363D] rounded-xl p-2.5 text-xs text-white"
                          />
                        ) : (
                          <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-xl text-white text-xs">
                            {dossierFormData.desiredRole || "Sin preferencia declarada"}
                          </div>
                        )}
                      </div>

                      {/* Casting Category */}
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-slate-300 flex items-center gap-1">
                          <span>🏷️</span> Categoría de Casting:
                        </label>
                        {dossierEditing ? (
                          <select
                            value={dossierFormData.castingCategory}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, castingCategory: e.target.value })}
                            className="bg-[#161B22] border border-[#30363D] rounded-xl p-2.5 text-xs text-white"
                          >
                            <option value="PROTAGONICO">⭐ Protagónico</option>
                            <option value="CO_PROTAGONICO">🌟 Co-Protagónico</option>
                            <option value="CUADRO_PRINCIPAL">🎭 Cuadro Principal</option>
                            <option value="ENSAMBLE_VOCAL">👥 Ensamble Vocal / Coral</option>
                            <option value="COVER_SWING">🔄 Cover / Swing</option>
                          </select>
                        ) : (
                          <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-xl text-xs font-bold text-purple-300">
                            {dossierFormData.castingCategory === "PROTAGONICO" ? "⭐ Protagónico" :
                             dossierFormData.castingCategory === "CO_PROTAGONICO" ? "🌟 Co-Protagónico" :
                             dossierFormData.castingCategory === "ENSAMBLE_VOCAL" ? "👥 Ensamble Vocal / Coral" :
                             dossierFormData.castingCategory === "COVER_SWING" ? "🔄 Cover / Swing" : "🎭 Cuadro Principal"}
                          </div>
                        )}
                      </div>

                      {/* Assigned Role */}
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-slate-300 flex items-center gap-1">
                          <span>🏆</span> Rol / Personaje Asignado por Dirección:
                        </label>
                        {dossierEditing ? (
                          <input
                            type="text"
                            value={dossierFormData.assignedRole}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, assignedRole: e.target.value })}
                            placeholder="Ej. Benny (Protagónico)"
                            className="bg-[#161B22] border border-emerald-500/60 rounded-xl p-2.5 text-xs text-white font-bold"
                          />
                        ) : (
                          <div className="p-2.5 bg-emerald-950/30 border border-emerald-500/40 rounded-xl text-emerald-300 font-bold text-xs flex items-center justify-between">
                            <span>{dossierFormData.assignedRole || "Pendiente de deliberación"}</span>
                            {dossierFormData.assignedRole && <span className="text-[10px]">Elenco Confirmado</span>}
                          </div>
                        )}
                      </div>

                      {/* Video Link */}
                      <div className="flex flex-col gap-1">
                        <label className="font-semibold text-slate-300 flex items-center gap-1">
                          <span>🎬</span> Video de Audición (Google Drive / YouTube):
                        </label>
                        {dossierEditing ? (
                          <input
                            type="url"
                            value={dossierFormData.googleDriveUrl}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, googleDriveUrl: e.target.value })}
                            placeholder="https://drive.google.com/..."
                            className="bg-[#161B22] border border-[#30363D] rounded-xl p-2.5 text-xs text-white font-mono"
                          />
                        ) : dossierFormData.googleDriveUrl ? (
                          <a
                            href={dossierFormData.googleDriveUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2.5 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 rounded-xl text-purple-300 text-xs font-mono font-bold flex items-center justify-between transition-colors"
                          >
                            <span className="truncate">{dossierFormData.googleDriveUrl}</span>
                            <span className="shrink-0 ml-2">Abrir Video ↗</span>
                          </a>
                        ) : (
                          <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-xl text-slate-500 text-xs italic">
                            Sin enlace a video registrado
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Visuals & Experience */}
                    <div className="flex flex-col gap-4">
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-3">
                        <span className="font-bold text-white uppercase tracking-wider font-mono text-xs flex items-center gap-1.5">
                          <span>📸</span> Material Gráfico del Aspirante
                        </span>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400">Foto de Rostro / Headshot:</span>
                            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#161B22] border border-[#30363D] flex items-center justify-center">
                              {dossierTarget.headshotUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={dossierTarget.headshotUrl}
                                  alt="Rostro"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-3xl text-slate-600">👤</span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] font-mono text-slate-400">Foto de Cuerpo Completo:</span>
                            <div className="aspect-[3/4] rounded-xl overflow-hidden bg-[#161B22] border border-[#30363D] flex items-center justify-center">
                              {dossierFormData.fullBodyPhotoUrl || dossierTarget.fullBodyPhotoUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={dossierFormData.fullBodyPhotoUrl || dossierTarget.fullBodyPhotoUrl}
                                  alt="Cuerpo Completo"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="text-center p-3 text-slate-600 font-mono text-[10px]">
                                  <span>🧍</span>
                                  <span className="block mt-1">Sin foto de cuerpo</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {dossierEditing && (
                          <div className="flex flex-col gap-1 mt-1">
                            <label className="text-[10px] font-mono text-slate-400">URL Foto de Cuerpo Completo:</label>
                            <input
                              type="text"
                              value={dossierFormData.fullBodyPhotoUrl}
                              onChange={(e) => setDossierFormData({ ...dossierFormData, fullBodyPhotoUrl: e.target.value })}
                              placeholder="https://..."
                              className="bg-[#161B22] border border-[#30363D] rounded-xl p-2 text-xs text-white font-mono"
                            />
                          </div>
                        )}
                      </div>

                      {/* Declared Experience */}
                      <div className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-2 flex-1">
                        <span className="font-bold text-white uppercase tracking-wider font-mono text-xs flex items-center gap-1.5">
                          <span>📋</span> Trayectoria Declarada por el Alumno
                        </span>
                        <div className="p-3 bg-[#161B22] rounded-xl border border-[#21262D] text-slate-300 text-xs leading-relaxed max-h-32 overflow-y-auto">
                          {dossierTarget.experienceNotes || "No se adjuntaron notas de experiencia previa en el registro web."}
                        </div>

                        <div className="flex flex-col gap-1 mt-1">
                          <label className="font-semibold text-slate-300">Notas de Dirección / Convocatoria:</label>
                          {dossierEditing ? (
                            <textarea
                              rows={2}
                              value={dossierFormData.notes}
                              onChange={(e) => setDossierFormData({ ...dossierFormData, notes: e.target.value })}
                              placeholder="Notas internas de la dirección..."
                              className="bg-[#161B22] border border-[#30363D] rounded-xl p-2 text-xs text-white resize-none"
                            />
                          ) : (
                            <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-xl text-slate-300 text-xs italic">
                              {dossierFormData.notes || "Sin notas internas registradas."}
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  </div>

                  {dossierEditing && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setDossierEditing(false)}
                        className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={dossierSaving}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        {dossierSaving ? "Guardando..." : "💾 Guardar Cédula Técnica"}
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* TAB 2: FICHA MÉDICA */}
              {dossierActiveTab === "medical" && (
                <form onSubmit={handleSaveTheatricalDossier} className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    {/* Left Card: Medical Profile */}
                    <div className="bg-[#0D1117] border border-rose-500/40 rounded-2xl p-5 flex flex-col gap-4 shadow-sm bg-gradient-to-b from-rose-950/20 to-[#0D1117]">
                      <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
                        <span className="font-black text-rose-300 uppercase tracking-wider font-mono text-xs flex items-center gap-2">
                          <span>🚑</span> Ficha Médica de Escenario & Ensayos
                        </span>
                        <span className="text-[10px] font-mono bg-rose-950 text-rose-300 border border-rose-500/50 px-2 py-0.5 rounded font-bold">
                          Seguridad Teatral
                        </span>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="font-bold text-white flex items-center gap-1.5">
                          <span>🩸</span> Grupo Sanguíneo:
                        </label>
                        {dossierEditing ? (
                          <select
                            value={dossierFormData.bloodType}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, bloodType: e.target.value })}
                            className="bg-[#161B22] border-2 border-rose-500/60 rounded-xl p-3 text-sm text-white font-bold font-mono"
                          >
                            <option value="O+">🩸 O Positivo (O+)</option>
                            <option value="O-">🩸 O Negativo (O-)</option>
                            <option value="A+">🩸 A Positivo (A+)</option>
                            <option value="A-">🩸 A Negativo (A-)</option>
                            <option value="B+">🩸 B Positivo (B+)</option>
                            <option value="B-">🩸 B Negativo (B-)</option>
                            <option value="AB+">🩸 AB Positivo (AB+)</option>
                            <option value="AB-">🩸 AB Negativo (AB-)</option>
                            <option value="Desconocido">❓ Desconocido</option>
                          </select>
                        ) : (
                          <div className="p-3 bg-[#161B22] border border-rose-500/40 rounded-xl flex items-center justify-between">
                            <span className="text-base font-black text-rose-400 font-mono">
                              🩸 {dossierFormData.bloodType || "O+"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">Grupo Sanguíneo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 flex-1">
                        <label className="font-bold text-white flex items-center gap-1.5">
                          <span>📋</span> Alergias, Lesiones Coreográficas & Padecimientos:
                        </label>
                        {dossierEditing ? (
                          <textarea
                            rows={4}
                            value={dossierFormData.medicalNotes}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, medicalNotes: e.target.value })}
                            placeholder="Ej. Alergia a penicilina, asma leve en esfuerzo coreográfico intenso..."
                            className="bg-[#161B22] border border-[#30363D] rounded-xl p-3 text-xs text-white focus:outline-none resize-none leading-relaxed"
                          />
                        ) : (
                          <div className="p-3 bg-[#161B22] border border-[#30363D] rounded-xl text-slate-200 text-xs leading-relaxed min-h-[100px]">
                            {dossierFormData.medicalNotes || "Sin padecimientos crónicos declarados. Acondicionamiento óptimo para temporada."}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Card: Immediate Emergency Contact */}
                    <div className="bg-[#0D1117] border border-amber-500/40 rounded-2xl p-5 flex flex-col gap-4 shadow-sm bg-gradient-to-b from-amber-950/20 to-[#0D1117]">
                      <div className="flex items-center justify-between border-b border-[#21262D] pb-3">
                        <span className="font-black text-amber-300 uppercase tracking-wider font-mono text-xs flex items-center gap-2">
                          <span>📞</span> Contacto de Emergencia Inmediato
                        </span>
                        <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/50 px-2 py-0.5 rounded font-bold">
                          1-Clic Directo
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-white">Nombre Completo del Contacto:</label>
                        {dossierEditing ? (
                          <input
                            type="text"
                            value={dossierFormData.emergencyContactName}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, emergencyContactName: e.target.value })}
                            placeholder="Ej. María Elena Pérez"
                            className="bg-[#161B22] border border-[#30363D] rounded-xl p-2.5 text-xs text-white font-bold"
                          />
                        ) : (
                          <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-xl text-white font-bold text-xs">
                            {dossierFormData.emergencyContactName || "Contacto Familiar Registrado"}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-white">Parentesco / Relación:</label>
                        {dossierEditing ? (
                          <select
                            value={dossierFormData.emergencyContactRelation}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, emergencyContactRelation: e.target.value })}
                            className="bg-[#161B22] border border-[#30363D] rounded-xl p-2.5 text-xs text-white"
                          >
                            <option value="Madre">Madre</option>
                            <option value="Padre">Padre</option>
                            <option value="Tutor Legal">Tutor Legal</option>
                            <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                            <option value="Hermano / Hermana">Hermano / Hermana</option>
                            <option value="Familiar">Otro Familiar</option>
                            <option value="Amigo / Compañero">Amigo / Compañero</option>
                          </select>
                        ) : (
                          <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-xl text-slate-300 text-xs">
                            {dossierFormData.emergencyContactRelation || "Madre / Tutor Legal"}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-1">
                        <label className="font-bold text-white">Teléfono de Emergencia:</label>
                        {dossierEditing ? (
                          <input
                            type="tel"
                            value={dossierFormData.emergencyContactPhone}
                            onChange={(e) => setDossierFormData({ ...dossierFormData, emergencyContactPhone: e.target.value })}
                            placeholder="Ej. 4771234567"
                            className="bg-[#161B22] border-2 border-amber-500/60 rounded-xl p-2.5 text-xs text-white font-mono font-bold"
                          />
                        ) : (
                          <div className="p-2.5 bg-[#161B22] border border-[#30363D] rounded-xl text-amber-300 font-mono font-bold text-sm">
                            📱 {dossierFormData.emergencyContactPhone || "4776558156"}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col gap-2 mt-2">
                        <a
                          href={`tel:${(dossierFormData.emergencyContactPhone || "").replace(/\D/g, "")}`}
                          className="w-full py-3 bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black uppercase tracking-wider rounded-xl text-center shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]"
                        >
                          <span className="text-base">🚨</span>
                          <span>Llamar a Contacto de Emergencia ({dossierFormData.emergencyContactPhone})</span>
                        </a>

                        <a
                          href={`https://wa.me/521${(dossierFormData.emergencyContactPhone || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hola, nos comunicamos de la Dirección de DV Performing Arts con respecto a ${dossierTarget.fullName}.`)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-xl text-center flex items-center justify-center gap-2 transition-colors text-xs"
                        >
                          <span>💬</span>
                          <span>Enviar WhatsApp al Contacto de Emergencia</span>
                        </a>
                      </div>
                    </div>

                  </div>

                  {dossierEditing && (
                    <div className="flex items-center justify-end gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setDossierEditing(false)}
                        className="px-4 py-2 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-xl font-bold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={dossierSaving}
                        className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                      >
                        {dossierSaving ? "Guardando..." : "💾 Guardar Ficha Médica"}
                      </button>
                    </div>
                  )}
                </form>
              )}

              {/* TAB 3: EVALUACIÓN */}
              {dossierActiveTab === "evaluation" && (
                <div className="flex flex-col gap-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Promedio Canto</span>
                      <span className="text-base font-black text-pink-400 font-mono">
                        {dossierTarget.cantoAverage !== undefined ? `${dossierTarget.cantoAverage} / 10` : "-"}
                      </span>
                    </div>
                    <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Promedio Danza</span>
                      <span className="text-base font-black text-indigo-400 font-mono">
                        {dossierTarget.danceAverage !== undefined ? `${dossierTarget.danceAverage} / 10` : "-"}
                      </span>
                    </div>
                    <div className="p-3 bg-[#0D1117] border border-[#30363D] rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Promedio Actuación</span>
                      <span className="text-base font-black text-orange-400 font-mono">
                        {dossierTarget.actingAverage !== undefined ? `${dossierTarget.actingAverage} / 10` : "-"}
                      </span>
                    </div>
                    <div className="p-3 bg-purple-950/60 border border-purple-500/40 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-[10px] text-purple-300 uppercase font-mono font-bold">Puntaje Global</span>
                      <span className="text-lg font-black text-white font-mono">
                        ⭐ {dossierTarget.overallScore !== undefined ? `${dossierTarget.overallScore} / 10` : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono flex items-center gap-2">
                      <span>⚖️</span> Desglose por Juez y Criterios:
                    </h3>

                    {!dossierTarget.scores || dossierTarget.scores.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 font-mono text-xs bg-[#0D1117] rounded-2xl border border-[#30363D]">
                        Este aspirante aún no cuenta con evaluaciones capturadas por los jueces.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {dossierTarget.scores.map((sc, scIdx) => (
                          <div key={scIdx} className="bg-[#0D1117] border border-[#30363D] rounded-2xl p-4 flex flex-col gap-3">
                            <div className="flex items-center justify-between border-b border-[#21262D] pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white">{sc.judgeName}</span>
                                <span className="text-[11px] text-slate-400">({sc.judgeTitle || "Juez"})</span>
                                <span className="text-[10px] font-mono bg-purple-950/80 text-purple-300 border border-purple-500/30 px-2 py-0.2 rounded font-bold">
                                  {sc.discipline}
                                </span>
                              </div>
                              <span className="text-sm font-black text-yellow-400 font-mono bg-yellow-950/60 border border-yellow-500/40 px-2.5 py-0.5 rounded-lg">
                                ⭐ {sc.averageScore} / 10
                              </span>
                            </div>

                            {sc.judgeNotes && (
                              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl text-slate-300 text-xs">
                                <span className="text-[10px] font-mono text-purple-400 font-bold block mb-1">
                                  📝 Notas del Juez:
                                </span>
                                <p className="italic">{sc.judgeNotes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: TRAYECTORIA HISTÓRICA */}
              {dossierActiveTab === "history" && (
                <div className="flex flex-col gap-4">
                  <div className="p-4 bg-[#0D1117] border border-indigo-500/30 rounded-2xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-xs">
                        Historial Multi-Obra &bull; Folio Único: <span className="font-mono text-indigo-400">{dossierTarget.studentFolio || "DV-0482"}</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Todas las audiciones y producciones de DV Performing Arts en las que ha participado este estudiante.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {auditions
                      .filter((a) => (dossierTarget.studentFolio && a.studentFolio === dossierTarget.studentFolio) || (dossierTarget.phone && a.phone.replace(/\D/g, "").slice(-10) === dossierTarget.phone.replace(/\D/g, "").slice(-10)))
                      .map((h) => (
                        <div
                          key={h.id}
                          className={`p-4 bg-[#0D1117] border rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            h.id === dossierTarget.id ? "border-purple-500 bg-purple-950/20" : "border-[#30363D]"
                          }`}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded">
                                {h.folio}
                              </span>
                              <span className="font-mono text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded">
                                {h.productionCode || "SNEA"}
                              </span>
                              <span className="font-bold text-white text-sm">
                                {h.productionName || "Si No Es Ahora"}
                              </span>
                              {h.id === dossierTarget.id && (
                                <span className="text-[9px] font-mono bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                                  Convocatoria Actual
                                </span>
                              )}
                            </div>

                            <div className="text-slate-400 text-xs font-mono">
                              <span>📅 {new Date(h.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}</span>
                              {h.assignedRole && (
                                <span className="text-emerald-400 font-bold ml-2">
                                  • Rol Asignado: 🎭 {h.assignedRole}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {h.overallScore ? (
                              <span className="text-xs font-black font-mono text-amber-300 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-xl">
                                ⭐ {h.overallScore}/10
                              </span>
                            ) : (
                              <span className="text-slate-500 text-[10px] font-mono">Sin calificar</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Bottom Footer */}
            <div className="p-4 bg-[#0D1117] border-t border-[#30363D] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <span>Director General & Jurado</span>
                <span>&bull;</span>
                <span className="text-purple-300 font-bold">DV Performing Arts</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeleteSingleAudition(dossierTarget.id, dossierTarget.fullName)}
                  className="px-3 py-2 bg-rose-950/60 hover:bg-rose-900 text-rose-300 hover:text-white border border-rose-500/40 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Eliminar solo este registro de audición"
                >
                  <span>🗑️</span>
                  <span className="hidden sm:inline">Eliminar Registro</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDeleteStudentExpediente(dossierTarget.studentFolio || dossierTarget.phone, dossierTarget.fullName)}
                  className="px-3 py-2 bg-red-950/80 hover:bg-red-900 text-red-300 hover:text-white border border-red-500/50 rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Eliminar todo el expediente y todas las audiciones de este alumno"
                >
                  <span>⚠️</span>
                  <span className="hidden sm:inline">Eliminar Expediente</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAssignRoleModal(dossierTarget)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  🎭 Asignar Rol
                </button>

                <button
                  type="button"
                  onClick={() => setDossierModalOpen(false)}
                  className="px-5 py-2 bg-[#21262D] hover:bg-[#30363D] text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Cerrar Expediente
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: ASSIGN ROLE ================= */}
      {roleModalOpen && roleTargetAudition && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setRoleModalOpen(false)}
        >
          <div
            className="bg-[#161B22] border-2 border-purple-500/70 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-gradient-to-r from-purple-950/60 to-rose-950/60 border-b border-[#30363D] flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono bg-purple-600 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                  Casting & Aprobación Oficial
                </span>
                <h2 className="text-xl font-black text-white mt-1.5">
                  Asignar Personaje / Papel
                </h2>
                <p className="text-xs text-purple-300 font-mono">
                  {roleTargetAudition.fullName} &bull; {roleTargetAudition.folio}
                </p>
              </div>
              <button
                onClick={() => setRoleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmRoleAssignment} className="p-6 flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <span>🎭</span>
                  <span>Nombre del Personaje / Papel:</span>
                </label>
                <input
                  type="text"
                  value={customRoleName}
                  onChange={(e) => setCustomRoleName(e.target.value)}
                  placeholder="Ej. Benny, Mariana, Roger, Ensamble Principal..."
                  className="bg-[#0D1117] border border-purple-500/60 focus:border-purple-400 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none font-bold font-sans"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-white flex items-center gap-1.5">
                  <span>🏷️</span>
                  <span>Categoría de Personaje:</span>
                </label>
                <select
                  value={roleCategory}
                  onChange={(e) => setRoleCategory(e.target.value as any)}
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="PROTAGONICO">⭐ Protagónico</option>
                  <option value="CO_PROTAGONICO">🌟 Co-Protagónico</option>
                  <option value="CUADRO_PRINCIPAL">🎭 Cuadro Principal</option>
                  <option value="ENSAMBLE_VOCAL">👥 Ensamble Vocal / Coral</option>
                  <option value="COVER_SWING">🔄 Cover / Swing</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-slate-300">Notas de Dirección:</label>
                <textarea
                  rows={2}
                  value={directorNotes}
                  onChange={(e) => setDirectorNotes(e.target.value)}
                  placeholder="Instrucciones para el primer ensayo..."
                  className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2.5 text-xs text-white resize-none"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="notifyRoleWhatsApp"
                  checked={notifyRoleWhatsApp}
                  onChange={(e) => setNotifyRoleWhatsApp(e.target.checked)}
                  className="w-4 h-4 text-emerald-500 rounded bg-[#0D1117] border-[#30363D] cursor-pointer"
                />
                <label htmlFor="notifyRoleWhatsApp" className="text-xs text-slate-200 cursor-pointer">
                  Enviar felicitación y bienvenida al elenco por <strong>WhatsApp</strong> automáticamente
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleModalOpen(false)}
                  className="px-4 py-2.5 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-xl font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={roleSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                  {roleSaving ? "Confirmando..." : "Confirmar e Integrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: REGISTER NEW STUDENT ================= */}
      {newStudentModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setNewStudentModalOpen(false)}
        >
          <div
            className="bg-[#161B22] border-2 border-indigo-500/80 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden cursor-default max-h-[92vh] flex flex-col animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-b border-[#30363D] flex justify-between items-start">
              <div>
                <span className="text-[10px] font-mono bg-indigo-600 text-white px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
                  Nuevo Registro de Alumno
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  Alta Manual en el Padrón de DV
                </h2>
                <p className="text-xs text-indigo-300 font-mono">
                  Genera folio permanente, vincula a obra activa y da de alta ficha médica
                </p>
              </div>
              <button
                onClick={() => setNewStudentModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewStudent} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1 sm:col-span-2">
                  <label className="font-bold text-white flex items-center gap-1">
                    <span>👤</span> Nombre Completo:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Sofía Mariana Ramírez"
                    value={newStudentForm.fullName}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, fullName: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] focus:border-indigo-500 rounded-xl p-3 text-xs text-white font-bold"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-white flex items-center gap-1">
                    <span>📱</span> Teléfono / WhatsApp (10 dígitos):
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 4771234567"
                    value={newStudentForm.phone}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, phone: e.target.value })}
                    className="bg-[#0D1117] border border-emerald-500/60 focus:border-emerald-400 rounded-xl p-2.5 text-xs text-emerald-400 font-mono font-bold"
                  />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-300">Correo Electrónico:</label>
                  <input
                    type="email"
                    placeholder="alumno@ejemplo.com"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, email: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white"
                  />
                </div>

                {/* Production */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-white">Obra / Producción Inicial:</label>
                  <select
                    value={newStudentForm.productionId}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, productionId: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2.5 text-xs text-white"
                  >
                    {productions.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} {p.isAuditionActive ? "⭐ (Activa)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Vocal Range */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-white">Tesitura Vocal:</label>
                  <select
                    value={newStudentForm.vocalRange}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, vocalRange: e.target.value })}
                    className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2.5 text-xs text-white font-bold"
                  >
                    <option value="Soprano Ligera">Soprano Ligera</option>
                    <option value="Soprano Lírica">Soprano Lírica</option>
                    <option value="Soprano Coloratura">Soprano Coloratura</option>
                    <option value="Mezzo-Soprano (Belter)">Mezzo-Soprano (Belter)</option>
                    <option value="Mezzo-Soprano Lírica">Mezzo-Soprano Lírica</option>
                    <option value="Contralto / Alto">Contralto / Alto</option>
                    <option value="Tenor Ligero">Tenor Ligero</option>
                    <option value="Tenor Lírico (Belter)">Tenor Lírico (Belter)</option>
                    <option value="Barítono Lírico">Barítono Lírico</option>
                    <option value="Barítono Dramático">Barítono Dramático</option>
                    <option value="Bajo">Bajo</option>
                  </select>
                </div>

                {/* Blood Type */}
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-rose-300">Grupo Sanguíneo:</label>
                  <select
                    value={newStudentForm.bloodType}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, bloodType: e.target.value })}
                    className="bg-[#0D1117] border border-rose-500/50 rounded-xl p-2.5 text-xs text-white font-mono font-bold"
                  >
                    <option value="O+">🩸 O Positivo (O+)</option>
                    <option value="O-">🩸 O Negativo (O-)</option>
                    <option value="A+">🩸 A Positivo (A+)</option>
                    <option value="A-">🩸 A Negativo (A-)</option>
                    <option value="B+">🩸 B Positivo (B+)</option>
                    <option value="B-">🩸 B Negativo (B-)</option>
                    <option value="AB+">🩸 AB Positivo (AB+)</option>
                    <option value="AB-">🩸 AB Negativo (AB-)</option>
                  </select>
                </div>

                {/* BirthDate & Age */}
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-300">Fecha Nacimiento & Edad:</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={newStudentForm.birthDate}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, birthDate: e.target.value })}
                      className="flex-1 bg-[#0D1117] border border-[#30363D] rounded-xl p-2.5 text-xs text-white"
                    />
                    <input
                      type="number"
                      placeholder="Edad"
                      value={newStudentForm.age}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, age: e.target.value })}
                      className="w-16 bg-[#0D1117] border border-[#30363D] rounded-xl p-2.5 text-xs text-white text-center font-mono"
                    />
                  </div>
                </div>

                {/* Emergency Contact */}
                <div className="flex flex-col gap-1 sm:col-span-2 pt-2 border-t border-[#21262D]">
                  <span className="font-bold text-amber-400 font-mono text-[11px] uppercase">
                    🚑 Contacto de Emergencia:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                    <input
                      type="text"
                      placeholder="Nombre del familiar / tutor"
                      value={newStudentForm.emergencyContactName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, emergencyContactName: e.target.value })}
                      className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2 text-xs text-white"
                    />
                    <input
                      type="tel"
                      placeholder="Teléfono emergencia"
                      value={newStudentForm.emergencyContactPhone}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, emergencyContactPhone: e.target.value })}
                      className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2 text-xs text-white font-mono"
                    />
                    <select
                      value={newStudentForm.emergencyContactRelation}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, emergencyContactRelation: e.target.value })}
                      className="bg-[#0D1117] border border-[#30363D] rounded-xl p-2 text-xs text-white"
                    >
                      <option value="Madre">Madre</option>
                      <option value="Padre">Padre</option>
                      <option value="Tutor Legal">Tutor Legal</option>
                      <option value="Cónyuge / Pareja">Cónyuge / Pareja</option>
                      <option value="Familiar">Otro Familiar</option>
                    </select>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#30363D]">
                <button
                  type="button"
                  onClick={() => setNewStudentModalOpen(false)}
                  className="px-4 py-2.5 bg-[#21262D] hover:bg-[#30363D] text-slate-300 rounded-xl font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={newStudentSaving}
                  className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {newStudentSaving ? "Registrando..." : "➕ Registrar en Padrón"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
