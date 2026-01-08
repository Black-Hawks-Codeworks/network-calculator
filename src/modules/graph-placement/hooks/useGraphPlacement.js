import { useState } from 'react';


import { normalizeInputs } from '../utils/normalizeInputs';


import { buildPlacementGraph } from '../services/buildPlacementGraph';

/*
 * DEFAULT PROVIDER BW 
 * krataw kai tis  2 kateythinseis (K-L kai L-K)
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
 * useGraphPlacement (HOOK)
 * Αυτό το hook krataei:
 *  inputs 
 *  diathesimo bandwidth provider edges (providerBw)
 *  placement apotelesma
 *  error message 
 *
 * kai handlers:
 *  handleChange
 *  handleProviderBwChange
 *  handleCalculate
 */
export default function useGraphPlacement() {
  // 1) State: Provider BW
  const [providerBw, setProviderBw] = useState(DEFAULT_PROVIDER_BW);
  // 2) State: Inputs 
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

  // 3) State: Placement result
  
  const [placement, setPlacement] = useState({
    nodes: [],
    edges: { feToBe: 0, beToDb: 0 },
    providerEdgesRemaining: null,
  });

  // 4) State: Error message
  const [error, setError] = useState(null);

  // 5) Handler: form inputs
  const handleChange = (e) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  // 6) Handler: provider BW input sto grafima 

  const handleProviderBwChange = (from, to, val) => {
    // apotrepei ta arntika 
    const num = Math.max(0, Number(val) || 0);

    // Bidirected-allazw kai tis 2 kateythinseis 
    setProviderBw((prev) => ({
      ...prev,
      [`${from}-${to}`]: num,
      [`${to}-${from}`]: num,
    }));
  };

  // 7) Handler: CALCULATE
  const handleCalculate = () => {
    // katharizo prohgoumeno error
    setError(null);

    // 7a) Normalize k validation inputs
    // epistrefei eite { error } eite { data }
    const normalized = normalizeInputs(values);

    if (normalized.error) {
      setError(normalized.error);
      return;
    }

    const { fe, be, db, bwFeBe, bwBeDb } = normalized.data;

    // 7b) ftiaxnw lista services (mono osa yparxoun)
    // ena service "yparxei" otan CPU & RAM > 0
    const services = [];
    if (fe.cpu > 0 && fe.mem > 0) services.push(fe);
    if (be.cpu > 0 && be.mem > 0) services.push(be);
    if (db.cpu > 0 && db.mem > 0) services.push(db);

    // 7c) kalo ton algorithm service gia placement
    const result = buildPlacementGraph({
      services,
      bwFeBe,
      bwBeDb,
      providerBw,
    });

    // 7d) an den vrethike placement dinei error
    if (!result.ok) {
      setError(result.error);
      return;
    }

    // 7e) an vrethike -> enimerwnw to placement state
    setPlacement(result.placement);
  };


  // 8) epistrefw oti xreiazetai h selida mou  
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
