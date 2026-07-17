import styles from "./HamsterLoader.module.css";

interface HamsterLoaderProps {
  label?: string;
}

export function HamsterLoader({ label = "正在加载..." }: HamsterLoaderProps) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 py-6 text-center text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <div className={styles.loader} aria-hidden="true">
        <div className={styles.wheel}>
          <div className={styles.spoke} />
        </div>
        <div className={styles.hamster}>
          <div className={styles.head}>
            <div className={styles.ear} />
            <div className={styles.eye} />
            <div className={styles.nose} />
          </div>
          <div className={styles.body}>
            <div className={`${styles.limb} ${styles.frontRight}`} />
            <div className={`${styles.limb} ${styles.frontLeft}`} />
            <div className={`${styles.limb} ${styles.backRight}`} />
            <div className={`${styles.limb} ${styles.backLeft}`} />
            <div className={styles.tail} />
          </div>
        </div>
      </div>
      <span className="font-mono animate-pulse">{label}</span>
    </div>
  );
}