import { useState } from 'react';
import { placeVMs } from '@/shared/utils/vm-placement';

export default function useResourceCalc() {
  const [requiredResources, setRequiredResources] = useState({
    //kratame strings gia na grafoume 0.5 px input xwris na spaei
    frontendCpu: '',
    frontendMemory: '',
    backendCpu: '',
    backendMemory: '',
    dbCpu: '',
    dbMemory: '',
  });

  // placement state: krataei ENA koino result nodes (mixed vms)
  // giati: sto real VM placement ola ta vms (FE/BE/DB) einai sto idio physical cluster
  const [placement, setPlacement] = useState({ nodes: [] });

  const resetInputs = () => {
    setRequiredResources({
      frontendCpu: '',
      frontendMemory: '',
      backendCpu: '',
      backendMemory: '',
      dbCpu: '',
      dbMemory: '',
    });
  };

  //otan i timi sto input allazei, diladi onChange...
  //vale sto analogo id to value apo to input
  //metetrpse to se arithmo giati to value ton input einai PANTA string
  const handleChange = (event) => {
    const { id, value } = event.target;
    //kratame oti grafei o xristis string
    setRequiredResources((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  //grapse mesa sta inputs merika numera kai pata to calculate
  //des ti vgazei stin consola
  const handleCalculate = () => {
    const nodeCapacity = { cpu: 20, memory: 32 };
    //metatrepw ta strings se arithmous
    const frontendCpu = requiredResources.frontendCpu === '' ? 0 : Number(requiredResources.frontendCpu);
    const frontendMemory = requiredResources.frontendMemory === '' ? 0 : Number(requiredResources.frontendMemory);
    const backendCpu = requiredResources.backendCpu === '' ? 0 : Number(requiredResources.backendCpu);
    const backendMemory = requiredResources.backendMemory === '' ? 0 : Number(requiredResources.backendMemory);
    const dbCpu = requiredResources.dbCpu === '' ? 0 : Number(requiredResources.dbCpu);
    const dbMemory = requiredResources.dbMemory === '' ? 0 : Number(requiredResources.dbMemory);
    // edo mesa tha boun ta calculations apo tis diafaneies to Papadimitriou  const nodeCapacity = { cpu: 10, memory: 20 };
    console.log('clicked');
    console.log('requiredResources:', requiredResources);

    if ([frontendCpu, frontendMemory, backendCpu, backendMemory, dbCpu, dbMemory].some((v) => Number.isNaN(v))) {
      window.alert('Please enter valid numbers only.');
      resetInputs();
      setPlacement({ nodes: [] });
      return;
    }

    if ([frontendCpu, frontendMemory, backendCpu, backendMemory, dbCpu, dbMemory].some((v) => v < 0)) {
      window.alert('Please enter non-negative values only.');
      resetInputs();
      setPlacement({ nodes: [] });
      return;
    }

    if (frontendCpu > nodeCapacity.cpu || backendCpu > nodeCapacity.cpu || dbCpu > nodeCapacity.cpu) {
      window.alert(`CPU value is too large (max ${nodeCapacity.cpu}).`);
      resetInputs();
      setPlacement({ nodes: [] });
      return;
    }

    if (frontendMemory > nodeCapacity.memory || backendMemory > nodeCapacity.memory || dbMemory > nodeCapacity.memory) {
      window.alert(`Memory value is too large (max ${nodeCapacity.memory}).`);
      resetInputs();
      setPlacement({ nodes: [] });
      return;
    }

    //TODO: an iparhei hroinos na min einai hardcoded auto...
    const frontendVms = [
      {
        id: 'frontend-vm-1',
        role: 'frontend', // gia output badge FE
        cpu: frontendCpu,
        memory: frontendMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);
    const backendVms = [
      {
        id: 'backend-vm-1',
        role: 'backend', // gia output badge BE
        cpu: backendCpu,
        memory: backendMemory,
      },
    ].filter((vm) => vm.cpu > 0 && vm.memory > 0);
    const databaseVms = [
      {
        id: 'database-vm-1',
        role: 'database', // gia output badge DB
        cpu: dbCpu,
        memory: dbMemory,
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

/*
          .      .
     ...  :..':
      : ````.'    :''::'
    ..:..  :      .'' :
.     :     .'      :
     :     :    :          :
      :    :    :            :
      :     :    :          :
        :     :    :..''''``::.
         : ...:..'      .''
         .'    .'  .::::'
        :..'''``:::::::
        '            ::::
                        ::.
                         ::
                          :::.
            ..:`.:'`. ::'`.
         ..'        `:.: ::
        .:          .::::
        .:     ..''      :::
         : .''            .::
          :             .'`::
                              ::
                              ::
                                :
                                :
                                :
                                :
                                .

*/
