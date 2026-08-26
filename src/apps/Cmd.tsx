"use client";

import { useEffect, useRef, useState } from "react";

import { about, projects, site } from "@content/site";

import { useWindowStore } from "@/os/windowStore";

import type { AppProps } from "./types";
import styles from "./Cmd.module.css";

const BANNER = [
  `${site.osName} [版本 5.1.2600]`,
  "(C) 版权所有 2026 " + site.userName,
  "",
  "输入 help 查看可用命令。",
];

export default function Cmd({ windowId }: AppProps) {
  const [lines, setLines] = useState<string[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const close = useWindowStore((s) => s.close);
  const open = useWindowStore((s) => s.open);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  const run = (raw: string) => {
    const command = raw.trim();
    const [name, ...args] = command.split(/\s+/);
    const output: string[] = [`C:\\> ${command}`];

    switch (name.toLowerCase()) {
      case "":
        break;
      case "help":
        output.push(
          "可用命令：",
          "  help        显示这份帮助",
          "  whoami      我是谁",
          "  dir         列出所有项目",
          "  open <应用>  打开一个窗口，比如 open blog",
          "  echo <文本>  原样输出",
          "  date        当前时间",
          "  cls         清屏",
          "  exit        关闭这个窗口",
        );
        break;
      case "whoami":
        output.push(`${site.userName} —— ${site.userTagline}`, "", ...about.intro);
        break;
      case "dir":
        output.push(` ${site.osName} 的项目目录`, "");
        projects.forEach((p) => output.push(`  ${p.name.padEnd(16)} ${p.kind}  ${p.summary}`));
        output.push("", `        ${projects.length} 个文件`);
        break;
      case "open": {
        const target = args[0];
        if (!target) {
          output.push("用法：open <应用名>，比如 open blog");
          break;
        }
        open(target);
        output.push(`正在打开 ${target}…`);
        break;
      }
      case "echo":
        output.push(args.join(" "));
        break;
      case "date":
        output.push(new Date().toLocaleString("zh-CN"));
        break;
      case "cls":
        setLines([]);
        return;
      case "exit":
        close(windowId);
        return;
      default:
        output.push(`'${name}' 不是内部或外部命令，也不是可运行的程序。`);
    }

    setLines((prev) => [...prev, ...output, ""]);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      run(input);
      if (input.trim()) {
        setHistory((prev) => [input, ...prev]);
      }
      setInput("");
      setHistoryIndex(-1);
      return;
    }
    // 上下方向键翻历史命令
    if (event.key === "ArrowUp") {
      event.preventDefault();
      const next = Math.min(historyIndex + 1, history.length - 1);
      if (next >= 0) {
        setHistoryIndex(next);
        setInput(history[next]);
      }
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setInput(next >= 0 ? history[next] : "");
    }
  };

  return (
    <div className={styles.terminal} onClick={() => inputRef.current?.focus()}>
      <div className={styles.scroll} ref={scrollRef}>
        {lines.map((line, index) => (
          <div key={index} className={styles.line}>
            {line || "\u00a0"}
          </div>
        ))}
        <div className={styles.promptRow}>
          <span>C:\&gt;&nbsp;</span>
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="命令输入"
          />
        </div>
      </div>
    </div>
  );
}
