import { useState } from 'react';
import { placeVMs } from '@/shared/utils/vm-placement';

export default function useResourceCalcGraph() {
  const [values, setValues] = useState({
    // strings για να δέχεται 0.5 κλπ
    frontendCpu: '',
    frontendMemory: '',
    backendCpu: '',
    backendMemory: '',
    dbCpu: '',
    dbMemory: '',
    // bandwidth για edges
    bwFeBe: '',
    bwBeDb: '',
  });

  // placement result (nodes)
  const [placement, setPlacement] = useState({ nodes: [] });

  const resetInputs = () => {
    setValues({
      frontendCpu: '',
      frontendMemory: '',
      backendCpu: '',
      backendMemory: '',
      dbCpu: '',
      dbMemory: '',
      bwFeBe: '',
      bwBeDb: '',
    });
  };

  const handleChange = (event) => {
    const { id, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleCalculate = () => {
    const nodeCapacity = { cpu: 20, memory: 32 };

    // strings se numbers alliws 0
    const frontendCpu = values.frontendCpu === '' ? 0 : Number(values.frontendCpu);
    const frontendMemory = values.frontendMemory === '' ? 0 : Number(values.frontendMemory);
    const backendCpu = values.backendCpu === '' ? 0 : Number(values.backendCpu);
    const backendMemory = values.backendMemory === '' ? 0 : Number(values.backendMemory);
    const dbCpu = values.dbCpu === '' ? 0 : Number(values.dbCpu);
    const dbMemory = values.dbMemory === '' ? 0 : Number(values.dbMemory);

    const bwFeBe = values.bwFeBe === '' ? 0 : Number(values.bwFeBe);
    const bwBeDb = values.bwBeDb === '' ? 0 : Number(values.bwBeDb);

    console.log('clicked (graph)');
    console.log('values:', values);

    const allNums = [
      frontendCpu,
      frontendMemory,
      backendCpu,
      backendMemory,
      dbCpu,
      dbMemory,
      bwFeBe,
      bwBeDb,
    ];

    // arnitikoi arithmoi
    if (allNums.some((v) => v < 0)) {
      window.alert('Please enter non-negative values only.');
      resetInputs();
      setPlacement({ nodes: [] });
      return;
    }

    // VM prepei na einai mesa stin capacity
    if ([frontendCpu, backendCpu, dbCpu].some((v) => v > nodeCapacity.cpu)) {
      window.alert(`CPU value is too large (max ${nodeCapacity.cpu}).`);
      resetInputs();
      setPlacement({ nodes: [] });
      return;
    }

    if ([frontendMemory, backendMemory, dbMemory].some((v) => v > nodeCapacity.memory)) {
      window.alert(`RAM value is too large (max ${nodeCapacity.memory}).`);
      resetInputs();
      setPlacement({ nodes: [] });
      return;
    }

    // dimiourgia twn VMs gia placement
    const frontendVms = [
      {
        id: 'frontend-vm-1',
        role: 'frontend',
        cpu: frontendCpu,
        memory: frontendMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);

    const backendVms = [
      {
        id: 'backend-vm-1',
        role: 'backend',
        cpu: backendCpu,
        memory: backendMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);

    const databaseVms = [
      {
        id: 'database-vm-1',
        role: 'database',
        cpu: dbCpu,
        memory: dbMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);

    const allVms = [...frontendVms, ...backendVms, ...databaseVms];

    // katharizei output an den yparxoun VMs
    if (allVms.length === 0) {
      setPlacement({ nodes: [] });
      return;
    }

    // placement twn VMs sta nodes
    const nodes = placeVMs(allVms, nodeCapacity);

    // an thes na "kouvalas" kai ta edges mazi me ta nodes
    // den epireazei to placement
    const placementWithEdges = {
      nodes,
      edges: {
        feToBe: bwFeBe,
        beToDb: bwBeDb,
      },
    };

    console.log('nodes result:', nodes);
    console.log('edges:', placementWithEdges.edges);

    setPlacement(placementWithEdges);
  };

  return {
    values,
    handleChange,
    handleCalculate,
    placement,
  };
}
