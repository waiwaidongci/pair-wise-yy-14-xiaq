import { STORAGE_KEY, seedRecords } from "./constants";
import type { ComponentRecord } from "./types";

/**
 * 记录只保存在当前电脑的浏览器 localStorage 中，不经过网络；
 * 下次打开页面会自动读回，现场录入可以接着上次继续。
 */
export function loadRecords(): ComponentRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // 第一次访问：种入样例数据，之后完全以本机数据为准
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRecords));
      return seedRecords;
    }
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ComponentRecord[]) : [];
  } catch {
    return [...seedRecords];
  }
}

export function saveRecords(records: ComponentRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // 存储空间不足或隐私模式下静默失败，不影响当前页面操作
  }
}
