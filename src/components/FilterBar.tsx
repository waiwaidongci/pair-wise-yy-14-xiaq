import { ALL } from "../constants";
import type { Filters } from "../types";

interface Props {
  filters: Filters;
  buildings: string[];
  jointTypes: string[];
  resultCount: number;
  totalCount: number;
  onChange: (next: Filters) => void;
  onExport: () => void;
}

export function FilterBar({
  filters,
  buildings,
  jointTypes,
  resultCount,
  totalCount,
  onChange,
  onExport,
}: Props) {
  return (
    <section className="panel filter-panel">
      <div className="heading">
        <div>
          <p>构件清单</p>
          <h2>现场工作台</h2>
        </div>
        <div className="filter-summary">
          显示 <strong>{resultCount}</strong> / {totalCount} 条
        </div>
      </div>
      <div className="filter-row">
        <label>
          <span>按建筑筛选</span>
          <select
            value={filters.building}
            onChange={(e) => onChange({ ...filters, building: e.target.value })}
          >
            <option value={ALL}>全部建筑</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>按榫卯类型筛选</span>
          <select
            value={filters.jointType}
            onChange={(e) => onChange({ ...filters, jointType: e.target.value })}
          >
            <option value={ALL}>全部类型</option>
            {jointTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <div className="filter-actions">
          {(filters.building !== ALL || filters.jointType !== ALL) && (
            <button
              type="button"
              onClick={() => onChange({ building: ALL, jointType: ALL })}
            >
              清除筛选
            </button>
          )}
          <button
            type="button"
            className="primary"
            onClick={onExport}
            disabled={resultCount === 0}
            title={resultCount === 0 ? "当前没有可导出的记录" : "按当前筛选结果导出 CSV"}
          >
            导出当前清单（{resultCount}）
          </button>
        </div>
      </div>
    </section>
  );
}
