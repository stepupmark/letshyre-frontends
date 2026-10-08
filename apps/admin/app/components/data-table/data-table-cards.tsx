import { flexRender, type Row } from "@tanstack/react-table";
import { columnLabel } from "./column-label";

export function DataTableCards<TData>({ rows }: { rows: Row<TData>[] }) {
  return (
    <ul className="divide-y">
      {rows.map((row) => {
        const cells = row.getVisibleCells();
        const select = cells.find((cell) => cell.column.id === "select");
        const labelled = cells.filter((cell) => columnLabel(cell.column));
        const [primary, ...fields] = labelled;
        const actions = cells.filter(
          (cell) => cell !== select && !columnLabel(cell.column),
        );
        const render = (cell: (typeof cells)[number]) =>
          flexRender(cell.column.columnDef.cell, cell.getContext());

        return (
          <li
            key={row.id}
            data-state={row.getIsSelected() ? "selected" : undefined}
            className="space-y-3 p-4 data-[state=selected]:bg-muted"
          >
            <div className="flex items-start gap-3">
              {select && <div className="pt-0.5">{render(select)}</div>}
              <div className="min-w-0 flex-1 text-sm">
                {primary && render(primary)}
              </div>
            </div>
            {fields.length > 0 && (
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                {fields.map((cell) => (
                  <div key={cell.id} className="min-w-0">
                    <dt className="text-xs text-muted-foreground">
                      {columnLabel(cell.column)}
                    </dt>
                    <dd className="mt-0.5 break-words">{render(cell)}</dd>
                  </div>
                ))}
              </dl>
            )}
            {actions.length > 0 && (
              <div className="flex justify-end gap-2">
                {actions.map((cell) => (
                  <div key={cell.id}>{render(cell)}</div>
                ))}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
