import { useState } from 'react';
import CalculatorInput from './components/calculator-input';
import styles from './resource-calc-page.module.css';
import PlacementOutput from './components/placement-output';
import { placeVMs } from '../../shared/utils/vm-placement';

export default function ResourceCalcPage() {
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

  return (
    <div className={styles.page}>
      {/* ΠΕΡΙΓΡΑΦΗΣ */}
      <section className={styles.descriptionBox}>
        <h2 className={styles.title}>Network Calculator</h2>
        <p className={styles.text}>
          The Network Calculator helps you optimize VM placement across physical nodes using a greedy algorithm guided
          by cosine similarity. Enter the CPU and memory requirements for VMs in each tier (frontend, backend,
          database), and the tool automatically assigns them to nodes to reduce resource waste and improve overall
          utilization. Cosine similarity is used to match each VM’s resource profile with the node’s currently available
          CPU and memory, avoiding cases where one resource (for example, CPU) remains unused because the other resource
          (memory) becomes the bottleneck. The results are shown visually: each green circle represents a node, and the
          list inside each node shows the VMs assigned to it along with their similarity score.
        </p>
      </section>

      <div className={styles.contentRow}>
        {/* ΦΟΡΜΑ */}
        <section className={styles.formCard}>
          <h2 className={styles.formTitle}> Available Resources : CPU = 20, MEMORY = 32</h2>

          <div className={styles.formInner}>
            {/* FRONTEND */}
            <div className={styles.groupContainer}>
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Frontend</h3>
                <CalculatorInput
                  id='frontendCpu'
                  label='Frontend CPU'
                  value={requiredResources.frontendCpu}
                  onChange={handleChange}
                />
                <CalculatorInput
                  id='frontendMemory'
                  label='Frontend Memory'
                  value={requiredResources.frontendMemory}
                  onChange={handleChange}
                />
              </div>

              {/* BACKEND */}
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Backend</h3>

                <CalculatorInput
                  id='backendCpu'
                  label='Backend CPU'
                  value={requiredResources.backendCpu}
                  onChange={handleChange}
                />
                <CalculatorInput
                  id='backendMemory'
                  label='Backend Memory'
                  value={requiredResources.backendMemory}
                  onChange={handleChange}
                />
              </div>

              {/* DATABASE */}
              <div className={styles.group}>
                <h3 className={styles.groupTitle}>Database</h3>

                <CalculatorInput
                  id='dbCpu'
                  label='Database CPU'
                  value={requiredResources.dbCpu}
                  onChange={handleChange}
                />
                <CalculatorInput
                  id='dbMemory'
                  label='Database Memory'
                  value={requiredResources.dbMemory}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button className={styles.calculateButton} onClick={handleCalculate}>
              CALCULATE
            </button>
          </div>
        </section>

        <section className={styles.outputBox}>
          <PlacementOutput placement={placement} />
        </section>
      </div>
    </div>
  );
}
