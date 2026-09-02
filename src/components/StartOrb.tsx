import styles from "./StartOrb.module.css";

/**
 * Vista/7 的圆形开始球，纯 CSS + SVG 画的，不走图标位图。
 * 它比任务栏还高、上下都探出去，这是 Aero 时期最容易认出来的一个细节。
 */
export default function StartOrb({ size = 46 }: { size?: number }) {
  return (
    <span className={styles.orb} style={{ width: size, height: size }} aria-hidden="true">
      <span className={styles.gloss} />
      <svg viewBox="0 0 32 32" className={styles.flag} focusable="false">
        {/* skewY 做出旗面被风吹起的倾斜，四格是同一种淡蓝，不是四色版 */}
        <g transform="translate(5.5,7) skewY(-9)" fill="#eaf6ff">
          <rect x="0" y="0" width="9.5" height="8" rx="1.4" />
          <rect x="11.5" y="0" width="9.5" height="8" rx="1.4" />
          <rect x="0" y="10" width="9.5" height="8" rx="1.4" />
          <rect x="11.5" y="10" width="9.5" height="8" rx="1.4" />
        </g>
      </svg>
    </span>
  );
}
