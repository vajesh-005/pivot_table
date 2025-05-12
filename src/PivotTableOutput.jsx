import React from "react";

const PivotTableOutput = ({
  pivotData,
  rowAttrs = [],
  colAttrs = [],
}) => {
  if (!pivotData || !pivotData.colKeys || !pivotData.rowKeys) return null;

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
          console.log(rowAttrs[i]);
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
      
      row.push(
        <th>Row total</th>
      )

      headerRows.push(<tr key={`header-row-${level}`}>{row}</tr>);
    }

   

    return headerRows;
  };

  // Compute column totals
  const columnTotals = pivotData.colKeys.map((colKey) => {
    let total = 0;
    pivotData.rowKeys.forEach((rowKey) => {
      const agg = pivotData.getAggregator(rowKey, colKey);
      const val = parseFloat(agg?.value());
      if (!isNaN(val)) total += val;
    });
    return total;
  });

  // Compute grand total
  const grandTotal = columnTotals.reduce((sum, val) => sum + val, 0);

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

            // Row labels
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

            // Data cells and row total
            let rowTotal = 0;
            const dataCells = pivotData.colKeys.map((colKey, j) => {
              const agg = pivotData.getAggregator(rowKey, colKey);
              const val = parseFloat(agg?.value());
              if (!isNaN(val)) rowTotal += val;
              return (
                <td key={`data-${i}-${j}`} className="pivot-cell center">
                  {agg?.value() != null ? agg.value() : ""}
                </td>
              );
            });

            row.push(...dataCells);
            row.push(
              <td key={`row-total-${i}`} className="pivot-cell center bold">
                {rowTotal}
              </td>
            );

            return <tr key={`row-${i}`}>{row}</tr>;
          })}

          {/* Column totals row */}
          <tr key="column-totals">
            {rowAttrs.map((_, i) => (
              <td key={`total-label-${i}`} className="pivot-left-header bold">
                {i === 0 ? "Column Total" : ""}
              </td>
            ))}
            {columnTotals.map((val, j) => (
              <td key={`col-total-${j}`} className="pivot-cell center bold">
                {val}
              </td>
            ))}
            <td className="pivot-cell center bold">{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PivotTableOutput;
