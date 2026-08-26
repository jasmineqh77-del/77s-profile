export type AppProps = {
  /** open() 时传进来的参数，比如要展示哪个项目 */
  payload?: Record<string, unknown>;
  /** 当前窗口实例 id，应用内部想关掉自己时用 */
  windowId: string;
};
