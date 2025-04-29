import React from "react";

const PivotTableOutput = ({
  pivotData,
  rowAttrs = [],
  colAttrs = [],
  valAttrs = [],
  aggregatorName = "count",
}) => {
  if (!pivotData || !pivotData.colKeys || !pivotData.rowKeys) return null;

  // Build column headers for each level in colAttrs
  const getColHeaderRows = () => {
    const headerRows = [];

    for (let level = 0; level < colAttrs.length; level++) {
      const row = [];

      if (level === 0) {
        for (let i = 0; i < rowAttrs.length; i++) {
          row.push(
            <th
              key={`row-label-${i}`}
              rowSpan={colAttrs.length + 1}
              className="pivot-header"
            >
              {rowAttrs[i]}
            </th>
          );
        }
      }

      let i = 0;
      while (i < pivotData.colKeys.length) {
        const colKey = pivotData.colKeys[i];
        const value = colKey[level];
        let span = 1;
        for (let j = i + 1; j < pivotData.colKeys.length; j++) {
          if (pivotData.colKeys[j][level] === value) {
            span++;
          } else {
            break;
          }
        }
        row.push(
          <th
            key={`col-header-${level}-${i}`}
            colSpan={span}
            className="pivot-header center"
          >
            {value}
          </th>
        );
        i += span;
      }

      headerRows.push(<tr key={`header-row-${level}`}>{row}</tr>);
    }

    // Value row (e.g., "Units Sold (sum)")
    headerRows.push(
      <tr key="value-row">
        {pivotData.colKeys.map((_, j) => (
          <th key={`val-${j}`} className="pivot-subheader center">
            {valAttrs.length > 0 ? valAttrs.join(", ") : "Value"}<br />
            ({aggregatorName})
          </th>
        ))}
      </tr>
    );

    return headerRows;
  };

  return (
    <div className="pivot-table-container">
      <table
        className="pivot-table"
        border="1"
        cellPadding="4"
        cellSpacing="0"
      >
        <thead>{getColHeaderRows()}</thead>
        <tbody>
          {pivotData.rowKeys.map((rowKey, i) => {
            const row = [];

            // Render row headers with rowspan merging
            rowKey.forEach((val, level) => {
              const prevVal = i > 0 ? pivotData.rowKeys[i - 1][level] : null;
              if (prevVal !== val) {
                let span = 1;
                for (let j = i + 1; j < pivotData.rowKeys.length; j++) {
                  if (pivotData.rowKeys[j][level] === val) span++;
                  else break;
                }
                row.push(
                  <td
                    key={`row-val-${level}-${val}`}
                    rowSpan={span}
                    className="pivot-left-header"
                  >
                    {val}
                  </td>
                );
              }
            });

            // Data cells
            const dataCells = pivotData.colKeys.map((colKey, j) => {
              const agg = pivotData.getAggregator(rowKey, colKey);
              return (
                <td key={`data-${i}-${j}`} className="pivot-cell center">
                  {agg && agg.value() != null ? agg.value() : ""}
                </td>
              );
            });

            return (
              <tr key={`row-${i}`}>
                {row}
                {dataCells}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PivotTableOutput;
