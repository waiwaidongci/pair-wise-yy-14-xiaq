import type { ComponentRecord } from "../types";

interface Props {
  records: ComponentRecord[];
  editingId: string | null;
  onEdit: (record: ComponentRecord) => void;
  onRemove: (record: ComponentRecord) => void;
}

export function RecordList({ records, editingId, onEdit, onRemove }: Props) {
  return (
    <section className="panel list-panel">
      <div className="heading">
        <div>
          <p>登记记录</p>
          <h2>构件清单</h2>
        </div>
      </div>

      {records.length === 0 ? (
        <p className="empty">当前筛选条件下没有构件记录，可在上方调整筛选或新增构件。</p>
      ) : (
        <div className="table-wrap">
          <table className="record-table">
            <thead>
              <tr>
                <th>建筑 / 编号</th>
                <th>木材</th>
                <th>榫卯类型</th>
                <th>截面尺寸</th>
                <th>病害位置</th>
                <th>变形情况</th>
                <th>修缮建议</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className={r.id === editingId ? "is-editing" : ""}>
                  <td>
                    <div className="cell-building">{r.building}</div>
                    <div className="cell-code">{r.code}</div>
                  </td>
                  <td>{r.woodSpecies || "—"}</td>
                  <td>{r.jointType}</td>
                  <td>{r.section || "—"}</td>
                  <td>{r.damage || "—"}</td>
                  <td>{r.deformation || "—"}</td>
                  <td>
                    {r.status === "pending" ? (
                      <span className="badge badge-pending">待补</span>
                    ) : (
                      <span title={r.repairAdvice}>{r.repairAdvice}</span>
                    )}
                  </td>
                  <td className="cell-time">{r.updatedAt}</td>
                  <td>
                    <div className="row-actions">
                      <button type="button" onClick={() => onEdit(r)}>
                        修改
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => onRemove(r)}
                      >
                        移除
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
