import type { ComponentRecord } from "./types";

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
  "登记时间",
  "更新时间",
];

function escapeCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** 按清单当前顺序生成 CSV，导出内容与筛选结果完全一致 */
export function buildCsv(records: ComponentRecord[]): string {
  const lines = records.map((r) =>
    [
      r.building,
      r.code,
      r.woodSpecies,
      r.jointType,
      r.section,
      r.damage,
      r.deformation,
      r.repairAdvice,
      r.status === "pending" ? "待补" : "已确定",
      r.createdAt,
      r.updatedAt,
    ]
      .map((v) => escapeCell(v ?? ""))
      .join(",")
  );
  // 带 BOM，保证 Excel 直接打开中文不乱码
  return "﻿" + [HEADERS.join(","), ...lines].join("\r\n");
}

export function downloadCsv(records: ComponentRecord[]): void {
  const csv = buildCsv(records);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `榫卯构件清单-${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
