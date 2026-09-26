import type { ComponentRecord } from "./types";
import { suggestionStatus } from "./types";

const HEADERS = [
  "建筑名称",
  "构件编号",
  "木材种类",
  "榫卯类型",
  "截面尺寸",
  "病害位置",
  "变形情况",
  "修缮建议",
  "建议状态",
  "修缮进度",
  "最近更新",
];

function escapeCell(value: string): string {
  if (/[",\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function formatTime(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

/** 把当前清单结果导出为 CSV（带 BOM，Excel 打开中文不乱码） */
export function exportRecordsCsv(records: ComponentRecord[]): void {
  const rows = records.map((r) =>
    [
      r.building,
      r.componentNo,
      r.woodType,
      r.jointType,
      r.sectionSize,
      r.diseaseLocation,
      r.deformation,
      r.repairSuggestion,
      suggestionStatus(r),
      r.repairProgress,
      formatTime(r.updatedAt),
    ]
      .map(escapeCell)
      .join(",")
  );
  const csv = "﻿" + [HEADERS.join(","), ...rows].join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const pad = (n: number) => String(n).padStart(2, "0");
  const now = new Date();
  a.href = url;
  a.download = `榫卯构件登记_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
    now.getDate()
  )}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
