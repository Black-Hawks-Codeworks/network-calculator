// =====================================
// normalizeInputs.js
// =====================================
// 1) Διαβάζουμε inputs (strings -> numbers)
// 2) Validation (κανόνες)
// 3) Επιστρέφουμε είτε error είτε καθαρά δεδομένα
// =====================================

function toNumberOrZero(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n;
}

function hasNegative(valuesObj) {
  return Object.values(valuesObj).some((v) => Number.isFinite(v) && v < 0);
}

// Μέγιστα διαθέσιμα resources σε ΟΛΟ το provider δίκτυο
// (τα πήραμε από τα PROVIDER_CAPACITY που χρησιμοποιείς)
const MAX_PROVIDER_CPU = 20;
const MAX_PROVIDER_RAM = 32;

// Helper: φτιάχνει πιο κατανοητό μήνυμα
function serviceName(role) {
  if (role === 'frontend') return 'Frontend';
  if (role === 'backend') return 'Backend';
  if (role === 'database') return 'Database';
  return 'Service';
}

export function normalizeInputs(values) {
  // 1) Διαβάζουμε αριθμούς
  const feCpu = toNumberOrZero(values.frontendCpu);
  const feMem = toNumberOrZero(values.frontendMemory);

  const beCpu = toNumberOrZero(values.backendCpu);
  const beMem = toNumberOrZero(values.backendMemory);

  const dbCpu = toNumberOrZero(values.dbCpu);
  const dbMem = toNumberOrZero(values.dbMemory);

  const bwFeBe = toNumberOrZero(values.bwFeBe);
  const bwBeDb = toNumberOrZero(values.bwBeDb);

  // 2) Δεν επιτρέπονται αρνητικά
  const allNumbers = { feCpu, feMem, beCpu, beMem, dbCpu, dbMem, bwFeBe, bwBeDb };
  if (hasNegative(allNumbers)) {
    return { error: 'Δεν επιτρέπονται αρνητικές τιμές (CPU/RAM/BW πρέπει να είναι >= 0).' };
  }

  // 3) Φτιάχνουμε services
  const fe = { id: 'frontend-vm-1', role: 'frontend', cpu: feCpu, mem: feMem };
  const be = { id: 'backend-vm-1', role: 'backend', cpu: beCpu, mem: beMem };
  const db = { id: 'database-vm-1', role: 'database', cpu: dbCpu, mem: dbMem };

  // 4) Αν είναι όλα 0
  const totalCpu = fe.cpu + be.cpu + db.cpu;
  const totalMem = fe.mem + be.mem + db.mem;

  if (totalCpu === 0 && totalMem === 0) {
    return { error: 'Βάλε CPU και RAM σε τουλάχιστον ένα service πριν πατήσεις CALCULATE.' };
  }

  // 5) CPU & RAM μαζί
  const fePartial = (fe.cpu > 0) !== (fe.mem > 0);
  const bePartial = (be.cpu > 0) !== (be.mem > 0);
  const dbPartial = (db.cpu > 0) !== (db.mem > 0);

  if (fePartial || bePartial || dbPartial) {
    return {
      error: 'Για κάθε service πρέπει να δίνεις ΚΑΙ CPU ΚΑΙ RAM (ή να τα αφήνεις και τα δύο κενά).',
    };
  }

  // 6) ✅ ΝΕΟΣ ΚΑΝΟΝΑΣ: κάθε service πρέπει να χωράει ΜΟΝΟ του σε κάποιο provider
  // (αν CPU > 20 ή RAM > 32, δεν υπάρχει λύση από πριν)
  const services = [fe, be, db].filter((s) => s.cpu > 0 && s.mem > 0);

  for (const s of services) {
    if (s.cpu > MAX_PROVIDER_CPU) {
      return {
        error: `${serviceName(s.role)} CPU (${s.cpu}) είναι μεγαλύτερο από το μέγιστο διαθέσιμο CPU (${MAX_PROVIDER_CPU}).`,
      };
    }
    if (s.mem > MAX_PROVIDER_RAM) {
      return {
        error: `${serviceName(s.role)} RAM (${s.mem}) είναι μεγαλύτερο από το μέγιστο διαθέσιμο RAM (${MAX_PROVIDER_RAM}).`,
      };
    }
  }

  // 7) ΟΚ
  return {
    data: {
      fe,
      be,
      db,
      bwFeBe,
      bwBeDb,
    },
  };
}
