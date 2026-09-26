export type RepairStatus = "pending" | "confirmed";

/** 已登记的构件记录 */
export interface ComponentRecord {
  id: string;
  /** 建筑名称 */
  building: string;
  /** 构件编号（同一建筑内唯一） */
  code: string;
  /** 木材种类 */
  woodSpecies: string;
  /** 榫卯类型 */
  jointType: string;
  /** 截面尺寸 */
  section: string;
  /** 病害位置 */
  damage: string;
  /** 变形情况 */
  deformation: string;
  /** 修缮建议；status 为 pending 时恒为空字符串 */
  repairAdvice: string;
  /** 修缮建议状态：待补 / 已确定 */
  status: RepairStatus;
  createdAt: string;
  updatedAt: string;
}

/** 表单草稿：新增时不带 id 与时间戳 */
export type ComponentDraft = Omit<ComponentRecord, "id" | "createdAt" | "updatedAt">;

export interface Filters {
  building: string;
  jointType: string;
}
