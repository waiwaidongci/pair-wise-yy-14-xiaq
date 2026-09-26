import type { ComponentRecord } from "../types";
import { suggestionStatus } from "../types";
import { formatTime } from "../csv";

interface Props {
  records: ComponentRecord[];
  totalCount: number;
  editingId: string | null;
  onEdit: (record: ComponentRecord) => void;
  onDelete: (record: ComponentRecord) => void;
}

const PROGRESS_CLASS: Record<string, string> = {
  未开始: "badge slate",
  修缮中: "badge amber",
  已完成: "badge green",
};

export function RecordTable({
  records,
  totalCount,
  editingId,
  onEdit,
  onDelete,
}: Props) {
  if (records.length === 0) {
    return (
      <div className="empty">
        {totalCount === 0
          ? "还没有构件记录，从左侧表单开始登记。"
          : "没有符合当前筛选条件的记录，可调整筛选或清空条件。"}
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>构件</th>
            <th>榫卯类型</th>
            <th>截面尺寸</th>
            <th>病害位置 / 变形</th>
            <th>修缮建议</th>
            <th>修缮进度</th>
            <th>最近更新</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => {
            const status = suggestionStatus(r);
            return (
              <tr key={r.id} className={r.id === editingId ? "editing" : ""}>
                <td>
                  <strong>{r.componentNo}</strong>
                  <small>
                    {r.building}
                    {r.woodType ? ` · ${r.woodType}` : ""}
                  </small>
                </td>
                <td>{r.jointType || "—"}</td>
                <td>{r.sectionSize || "—"}</td>
                <td>
                  {r.diseaseLocation || "—"}
                  {r.deformation && <small>{r.deformation}</small>}
                </td>
                <td>
                  <span className={`badge ${status === "待补" ? "amber" : "teal"}`}>
                    {status}
                  </span>
                  {r.repairSuggestion && <small>{r.repairSuggestion}</small>}
                </td>
                <td>
                  <span className={PROGRESS_CLASS[r.repairProgress] ?? "badge slate"}>
                    {r.repairProgress}
                  </span>
                </td>
                <td>
                  <small>{formatTime(r.updatedAt)}</small>
                </td>
                <td className="row-actions">
                  <button type="button" onClick={() => onEdit(r)}>
                    编辑
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => onDelete(r)}
                  >
                    移除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
