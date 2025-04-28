import React from "react";

const PreviewTable = ({ csvData, previewHeaders }) => {
  return (
    <div className="preview-table-container">
      <h3>🗃️ Full Data Preview</h3>
      <div className="scrollable-table">
        <table className="preview-table">
          <thead>
            <tr>
              {previewHeaders.map((h) => (
                <th key={h} className="headers">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {csvData.map((row, i) => (
              <tr key={i}>
                {previewHeaders.map((h, j) => (
                  <td key={h} className={j === 0 ? "first-column" : ""}>
                    {row[h]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PreviewTable;
