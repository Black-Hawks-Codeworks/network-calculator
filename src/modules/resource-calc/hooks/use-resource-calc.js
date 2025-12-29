import { useState } from 'react';
import { placeVMs } from '@/shared/utils/vm-placement';

export default function useResourceCalc() {
  const [requiredResources, setRequiredResources] = useState({
    //arhikes times gia kathe input
    frontendCpu: 0,
    frontendMemory: 0,
    backendCpu: 0,
    backendMemory: 0,
    dbCpu: 0,
    dbMemory: 0,
  });

  // placement state: krataei ENA koino result nodes (mixed vms)
  // giati: sto real VM placement ola ta vms (FE/BE/DB) einai sto idio physical cluster
  const [placement, setPlacement] = useState({
    nodes: [],
  });

  //otan i timi sto input allazei, diladi onChange...
  //vale sto analogo id to value apo to input
  //metetrpse to se arithmo giati to value ton input einai PANTA string
  const handleChange = (event) => {
    const { id, value } = event.target;
    setRequiredResources((prevState) => ({
      ...prevState,
      [id]: Number(value),
    }));
  };

  //grapse mesa sta inputs merika numera kai pata to calculate
  //des ti vgazei stin consola
  const handleCalculate = () => {
    // edo mesa tha boun ta calculations apo tis diafaneies to Papadimitriou  const nodeCapacity = { cpu: 10, memory: 20 };
    console.log('clicked');
    console.log('requiredResources:', requiredResources);

    //TODO: an iparhei hroinos na min einai hardcoded auto...
    const nodeCapacity = { cpu: 20, memory: 32 };
    const frontendVms = [
      {
        id: 'frontend-vm-1',
        tier: 'frontend', // gia output badge FE
        cpu: requiredResources.frontendCpu,
        memory: requiredResources.frontendMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);
    const backendVms = [
      {
        id: 'backend-vm-1',
        tier: 'backend', // gia output badge BE
        cpu: requiredResources.backendCpu,
        memory: requiredResources.backendMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);
    const databaseVms = [
      {
        id: 'database-vm-1',
        tier: 'database', // gia output badge DB
        cpu: requiredResources.dbCpu,
        memory: requiredResources.dbMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);
    // vazw ola ta vms se ENA array
    // giati: theloume na kanoume placement se koino pool nodes (mixed tiers)
    const allVms = [...frontendVms, ...backendVms, ...databaseVms];

    // ena placement run mono, gia na mporoun na "paketaristoun" mazi
    const nodes = placeVMs(allVms, nodeCapacity);

    console.log('nodes result:', nodes);
    // apothikeuw to apotelesma
    setPlacement({ nodes });
  };
  return {
    handleChange,
    handleCalculate,
    placement,
    requiredResources,
  };
}
