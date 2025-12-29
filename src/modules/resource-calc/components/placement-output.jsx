import styles from './placement-output.module.css';

function formatVm(vm) {
  return `${vm.id} (${vm.cpu} CPU, ${vm.memory} Mem)`;
}

function tierLabel(tier) {
  // metatrepei to tier string se mikro badge label
  // giati: theloume na fenetai an ena VM einai FE/BE/DB mesa sto idio node
  if (tier === 'frontend') return 'FE';
  if (tier === 'backend') return 'BE';
  if (tier === 'database') return 'DB';
  return 'VM';
}

function TierSection(props) {
  const { title, nodes } = props;

  return (
    <div className={styles.tierSection}>
      <h3 className={styles.tierTitle}>{title}</h3>

      {nodes.length === 0 ? (
        <div className={styles.empty}>No nodes yet.</div>
      ) : (
        <div className={styles.nodesGrid}>
          {nodes.map((node) => (
            <div key={node.nodeId} className={styles.nodeCard}>
              <div className={styles.nodeHeader}>
                <div className={styles.nodeCircle} />
                <div className={styles.nodeMeta}>
                  <div className={styles.nodeTitle}>Node {node.nodeId}</div>
                  <div className={styles.nodeSub}>Avg similarity: {node.similarity.toFixed(2)}</div>
                </div>
              </div>

              <div className={styles.vmList}>
                {node.vms.map((vm) => (
                  <div key={vm.id} className={styles.vmItem}>
                    {/* badge FE/BE/DB */}
                    <span className={styles.badge}>{tierLabel(vm.tier)}</span>

                    {/* text info */}
                    <span>{formatVm(vm)}</span>
                    <span className={styles.vmSim}>s = {vm.placementSimilarity.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.remaining}>
                Remaining: {node.availableCpu} CPU, {node.availableMemory} Mem
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlacementOutput(props) {
  const { placement } = props;

  // to placement pleon exei shape: { nodes: [...] }
  // an den exei akoma, vazw empty array gia na min crasharei
  const nodes = placement.nodes || [];

  return (
    <div className={styles.wrapper}>
      <TierSection title='Nodes' nodes={nodes} />
    </div>
  );
}
