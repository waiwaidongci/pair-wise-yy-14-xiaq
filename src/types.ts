/** 修缮进度 */
export type RepairProgress = "未开始" | "修缮中" | "已完成";

/** 构件登记记录 */
export interface ComponentRecord {
  id: string;
  /** 建筑名称 */
  building: string;
  /** 构件编号（同一建筑内唯一） */
  componentNo: string;
  /** 木材种类 */
  woodType: string;
  /** 榫卯类型 */
  jointType: string;
  /** 截面尺寸，如 180x240mm */
  sectionSize: string;
  /** 病害位置 */
  diseaseLocation: string;
  /** 变形情况 */
  deformation: string;
  /** 修缮建议；为空表示尚未确定 */
  repairSuggestion: string;
  /** 修缮建议是否标记为待补 */
  suggestionPending: boolean;
  /** 修缮进度 */
  repairProgress: RepairProgress;
  createdAt: number;
  updatedAt: number;
}

/** 表单草稿（未保存的录入内容） */
export interface RecordDraft {
  building: string;
  componentNo: string;
  woodType: string;
  jointType: string;
  sectionSize: string;
  diseaseLocation: string;
  deformation: string;
  repairSuggestion: string;
  suggestionPending: boolean;
  repairProgress: RepairProgress;
}

export const JOINT_TYPES = [
  "燕尾榫",
  "透榫",
  "半榫",
  "箍头榫",
  "馒头榫",
  "管脚榫",
  "搭扣榫",
  "其他",
] as const;

export const REPAIR_PROGRESS_OPTIONS: RepairProgress[] = [
  "未开始",
  "修缮中",
  "已完成",
];

export const EMPTY_DRAFT: RecordDraft = {
  building: "",
  componentNo: "",
  woodType: "",
  jointType: "",
  sectionSize: "",
  diseaseLocation: "",
  deformation: "",
  repairSuggestion: "",
  suggestionPending: false,
  repairProgress: "未开始",
};

export function draftFromRecord(record: ComponentRecord): RecordDraft {
  return {
    building: record.building,
    componentNo: record.componentNo,
    woodType: record.woodType,
    jointType: record.jointType,
    sectionSize: record.sectionSize,
    diseaseLocation: record.diseaseLocation,
    deformation: record.deformation,
    repairSuggestion: record.repairSuggestion,
    suggestionPending: record.suggestionPending,
    repairProgress: record.repairProgress,
  };
}

/** 同一建筑 + 同一构件编号视为同一构件（编号比较忽略大小写与首尾空格） */
export function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function findDuplicate(
  records: ComponentRecord[],
  building: string,
  componentNo: string,
  excludeId?: string
): ComponentRecord | undefined {
  const b = normalizeKey(building);
  const c = normalizeKey(componentNo);
  if (!b || !c) return undefined;
  return records.find(
    (r) =>
      r.id !== excludeId &&
      normalizeKey(r.building) === b &&
      normalizeKey(r.componentNo) === c
  );
}

/** 修缮建议状态：已确定 / 待补 */
export function suggestionStatus(
  record: Pick<ComponentRecord, "repairSuggestion" | "suggestionPending">
): "已确定" | "待补" {
  return record.suggestionPending || !record.repairSuggestion.trim()
    ? "待补"
    : "已确定";
}
