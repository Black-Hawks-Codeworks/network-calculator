import { useState } from 'react';

// 1) Παίρνουμε τη συνάρτηση που καθαρίζει/ελέγχει τα inputs
import { normalizeInputs } from '../utils/normalizeInputs';

// 2) Παίρνουμε τη συνάρτηση που υπολογίζει placement
import { buildPlacementGraph } from '../services/buildPlacementGraph';

/**
 * =====================================
 * DEFAULT PROVIDER BW (κόκκινα edges)
 * =====================================
 * Είναι bidirected: κρατάμε και τις 2 κατευθύνσεις (K-L και L-K)
 */
const DEFAULT_PROVIDER_BW = {
  'K-L': 6,
  'L-K': 6,
  'L-M': 7,
  'M-L': 7,
  'K-N': 5,
  'N-K': 5,
  'N-O': 6,
  'O-N': 6,
  'O-L': 8,
  'L-O': 8,
  'O-M': 8,
  'M-O': 8,
  'O-P': 6,
  'P-O': 6,
  'M-P': 5,
  'P-M': 5,
};

/**
 * =====================================
 * useGraphPlacement (HOOK)
 * =====================================
 * Αυτό το hook κρατάει:
 * - inputs (values)
 * - διαθέσιμο bandwidth provider edges (providerBw)
 * - placement αποτέλεσμα (placement)
 * - error message (error)
 *
 * Και παρέχει handlers:
 * - handleChange
 * - handleProviderBwChange
 * - handleCalculate
 */
export default function useGraphPlacement() {
  // =========================
  // 1) State: Provider BW
  // =========================
  const [providerBw, setProviderBw] = useState(DEFAULT_PROVIDER_BW);

  // =========================
  // 2) State: Inputs (strings)
  // =========================
  const [values, setValues] = useState({
    frontendCpu: '',
    frontendMemory: '',
    backendCpu: '',
    backendMemory: '',
    dbCpu: '',
    dbMemory: '',
    bwFeBe: '',
    bwBeDb: '',
  });

  // =========================
  // 3) State: Placement result
  // =========================
  const [placement, setPlacement] = useState({
    nodes: [],
    edges: { feToBe: 0, beToDb: 0 },
    providerEdgesRemaining: null,
  });

  // =========================
  // 4) State: Error message
  // =========================
  const [error, setError] = useState(null);

  // =========================
  // 5) Handler: form inputs
  // =========================
  const handleChange = (e) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // =========================
  // 6) Handler: provider BW input (στο γράφημα)
  // =========================
  const handleProviderBwChange = (from, to, val) => {
    // Προστασία: δεν θέλουμε αρνητικά
    const num = Math.max(0, Number(val) || 0);

    // Bidirected: αλλάζουμε και τις 2 κατευθύνσεις
    setProviderBw((prev) => ({
      ...prev,
      [`${from}-${to}`]: num,
      [`${to}-${from}`]: num,
    }));
  };

  // =========================
  // 7) Handler: CALCULATE
  // =========================
  const handleCalculate = () => {
    // Καθαρίζουμε προηγούμενο error
    setError(null);

    // 7a) Normalize + validation inputs
    // Επιστρέφει είτε { error } είτε { data }
    const normalized = normalizeInputs(values);

    if (normalized.error) {
      setError(normalized.error);
      return;
    }

    const { fe, be, db, bwFeBe, bwBeDb } = normalized.data;

    // 7b) Φτιάχνουμε λίστα services (μόνο όσα "υπάρχουν")
    // Ένα service "υπάρχει" όταν CPU & RAM > 0
    const services = [];
    if (fe.cpu > 0 && fe.mem > 0) services.push(fe);
    if (be.cpu > 0 && be.mem > 0) services.push(be);
    if (db.cpu > 0 && db.mem > 0) services.push(db);

    // 7c) Καλούμε τον algorithm service για placement
    const result = buildPlacementGraph({
      services,
      bwFeBe,
      bwBeDb,
      providerBw,
    });

    // 7d) Αν δεν βρέθηκε placement -> error
    if (!result.ok) {
      setError(result.error);
      return;
    }

    // 7e) Αν βρέθηκε -> ενημερώνουμε το placement state
    setPlacement(result.placement);
  };

  // =========================
  // 8) Επιστρέφουμε ό,τι χρειάζεται η σελίδα
  // =========================
  return {
    values,
    handleChange,

    providerBw,
    handleProviderBwChange,

    placement,
    handleCalculate,

    error,
  };
}
