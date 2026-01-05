import styles from './placement-output.module.css';

/* Φτιάχνει ωραίο κείμενο για ένα VM */
function formatVm(vm) {
  return `${vm.id} (${vm.cpu} CPU, ${vm.memory} RAM)`;
}

/* Μετατρέπει role σε μικρό badge */
function roleLabel(role) {
  switch (role) {
    case 'frontend':
      return 'FE';
    case 'backend':
      return 'BE';
    case 'database':
      return 'DB';
    default:
      return 'VM';
  }
}

/* Component που δείχνει τα nodes */
function RoleNodes({ nodes }) {
  if (nodes.length === 0) {
    return <div className={styles.empty}>No nodes yet.</div>;
  }

  return (
    <div className={styles.nodesGrid}>
      {nodes.map((node) => (
        <div key={node.nodeId} className={styles.nodeCard}>
          {/* Header του node */}
          <div className={styles.nodeHeader}>
            <div className={styles.nodeCircle} />
            <div className={styles.nodeInfo}>
              <div className={styles.nodeTitle}>Node {node.nodeId}</div>
              <div className={styles.nodeSub}>Avg similarity: {(node.similarity || 0).toFixed(2)}</div>
            </div>
          </div>

          {/* Λίστα VMs */}
          <div className={styles.vmList}>
            {node.vms.map((vm) => (
              <div key={vm.id} className={styles.vmItem}>
                <span className={styles.badge}>{roleLabel(vm.role)}</span>

                <span>{formatVm(vm)}</span>

                <span className={styles.vmSim}>
                  s = {vm.placementSimilarity.toFixed(2)} {/*Το s σημαίνει: similarity score */}
                </span>
              </div>
            ))}
          </div>

          {/* Υπόλοιποι πόροι */}
          <div className={styles.remaining}>
            Remaining: {node.availableCpu} CPU, {node.availableMemory} RAM
          </div>
        </div>
      ))}
    </div>
  );
}

/* Τελικό component που χρησιμοποιεί η εφαρμογή */
export default function PlacementOutput({ placement }) {
  const nodes = placement?.nodes || [];

  return (
    <div className={styles.wrapper}>
      <RoleNodes nodes={nodes} />
    </div>
  );
}
