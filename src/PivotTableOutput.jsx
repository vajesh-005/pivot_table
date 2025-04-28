import React from "react";

const PivotTableOutput = ({ pivot, rowFields, valFields, aggregators }) => {
  // Calculate grand totals for rows, columns, and the grand total cell
  const grandTotalRow = pivot.rowKeys.map((rowKey) => {
    return pivot.colKeys.reduce((sum, colKey) => {
      return sum + (pivot.data[rowKey]?.[colKey]?.[valFields[0]] || 0);
    }, 0);
  });

  const grandTotalCol = pivot.colKeys.map((colKey) => {
    return pivot.rowKeys.reduce((sum, rowKey) => {
      return sum + (pivot.data[rowKey]?.[colKey]?.[valFields[0]] || 0);
    }, 0);
  });

  const grandTotal = grandTotalRow.reduce((sum, value) => sum + value, 0);

  return (
    <div className="pivot-output">
      <h4>Pivot Table</h4>
      <table className="pivot-table">
        <thead>
          <tr>
            <th>{rowFields.join(" / ")}</th>
            {pivot.colKeys.map((colKey) => (
              <th key={colKey}>{colKey}</th>
            ))}
            <th className="grand-total-title">Grand Total</th>
          </tr>
        </thead>
        <tbody>
          {pivot.rowKeys.map((rowKey, rowIndex) => (
            <tr key={rowKey}>
              <td>{rowKey}</td>
              {pivot.colKeys.map((colKey, colIndex) => (
                <td key={colKey}>
                  {pivot.data[rowKey]?.[colKey]?.[valFields[0]] || 0}
                </td>
              ))}
              <td className="grand-total-value">{grandTotalRow[rowIndex]}</td>
            </tr>
          ))}
          <tr>
            <td className="grand-total-title"><strong>Grand Total</strong></td>
            {grandTotalCol.map((total, colIndex) => (
              <td key={colIndex} className="grand-total-value">{total}</td>
            ))}
            <td className="grand-total-value">{grandTotal}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PivotTableOutput;
    