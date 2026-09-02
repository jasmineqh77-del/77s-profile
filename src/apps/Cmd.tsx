"use client";

import { useEffect, useRef, useState } from "react";

import { about, projects, site } from "@content/site";

import { useSystemStore } from "@/os/systemStore";
import { useWindowStore } from "@/os/windowStore";

import type { AppProps } from "./types";
import styles from "./Cmd.module.css";

const BANNER = [
  `${site.osName} [Version 5.1.2600]`,
  "(C) Copyright 2026 " + site.userName,
  "",
  "Type help for a list of commands.",
];

function neofetchLines(): string[] {
  const specs = Object.fromEntries(about.specs.map((row) => [row.label, row.value]));
  return [
    `${site.userName}@${site.osName}`,
    "-".repeat(site.userName.length + site.osName.length + 1),
    `OS: ${specs.System ?? site.osName}`,
    `Host: ${site.userName}`,
    "Kernel: 5.1.2600",
    "Shell: cmd.exe",
    `CPU: ${specs.Status ?? site.userTagline}`,
    `Locale: ${specs.Location ?? ""}`,
    `Now: ${specs.Currently ?? ""}`,
    "WM: Aero",
  ];
}

function treeLines(): string[] {
  const lines = [
    `Folder PATH listing for volume ${site.osName}`,
    "Volume serial number is 0777-2026",
    `C:\\${site.osName}`,
    "├── My Documents",
  ];
  projects.forEach((project, index) => {
    const last = index === projects.length - 1;
    lines.push(`│   ${last ? "└──" : "├──"} ${project.name}`);
  });
  lines.push("├── Moments");
  lines.push("│   ├── Guestbook");
  lines.push("│   └── Visitor Counter");
  lines.push("└── Recycle Bin");
  return lines;
}

export default function Cmd({ windowId }: AppProps) {
  const [lines, setLines] = useState<string[]>(BANNER);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const close = useWindowStore((s) => s.close);
  const open = useWindowStore((s) => s.open);
  const triggerBsod = useSystemStore((s) => s.triggerBsod);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const formatTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => {
    return () => {
      if (formatTimer.current) clearTimeout(formatTimer.current);
    };
  }, []);

  const run = (raw: string) => {
    const command = raw.trim();
    const [name, ...args] = command.split(/\s+/);
    const output: string[] = [`C:\\> ${command}`];

    switch (name.toLowerCase()) {
      case "":
        break;
      case "help":
        output.push(
          "Available commands:",
          "  help        Show this help",
          "  whoami      Who I am",
          "  dir         List every project",
          "  tree        Folder tree",
          "  neofetch    System summary",
          "  open <app>  Open a window, e.g. open blog",
          "  echo <text> Print the text back",
          "  date        Current date and time",
          "  sudo        Elevated prompt",
          "  format c:   Format the disk (not recommended)",
          "  cls         Clear the screen",
          "  exit        Close this window",
        );
        break;
      case "whoami":
        output.push(`${site.userName} — ${site.userTagline}`, "", ...about.intro);
        break;
      case "dir":
        output.push(` Directory of C:\\${site.osName}\\Projects`, "");
        projects.forEach((p) => {
          output.push(`  ${p.name.padEnd(30)} ${p.kind}`);
          output.push(`  ${" ".repeat(4)}${p.summary}`);
        });
        output.push("", `        ${projects.length} File(s)`);
        break;
      case "tree":
        output.push(...treeLines());
        break;
      case "neofetch":
        output.push(...neofetchLines());
        break;
      case "sudo":
        output.push(
          `${site.userName} is not in the sudoers file. This incident will be reported.`,
        );
        break;
      case "format": {
        const target = (args[0] ?? "").replace(/\\/g, "").toLowerCase();
        if (target !== "c:" && target !== "c") {
          output.push("Usage: FORMAT C:");
          break;
        }
        output.push(
          "WARNING, ALL DATA ON NON-REMOVABLE DISK",
          "DRIVE C: WILL BE LOST!",
          "Proceeding with format...",
          "Verifying 77-OS Professional.",
        );
        if (formatTimer.current) clearTimeout(formatTimer.current);
        formatTimer.current = setTimeout(() => triggerBsod(), 800);
        break;
      }
      case "open": {
        const target = args[0];
        if (!target) {
          output.push("Usage: open <app>, e.g. open blog");
          break;
        }
        open(target);
        output.push(`Opening ${target}…`);
        break;
      }
      case "echo":
        output.push(args.join(" "));
        break;
      case "date":
        output.push(new Date().toLocaleString("en-US"));
        break;
      case "cls":
        setLines([]);
        return;
      case "exit":
        close(windowId);
        return;
      default:
        output.push(
          `'${name}' is not recognized as an internal or external command, operable program or batch file.`,
        );
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
            aria-label="Command input"
          />
        </div>
      </div>
    </div>
  );
}
