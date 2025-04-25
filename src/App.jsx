import React, { useState } from "react";
import Papa from "papaparse";
import "./App.css";



function App() {
    const [csvData, setCsvData] = useState([]);
    const [previewHeaders, setPreviewHeaders] = useState([]);
    const [rowFields, setRowFields] = useState([]);
    const [colFields, setColFields] = useState([]);
    const [valFields, setValFields] = useState([]);
    const [aggregators, setAggregators] = useState({});


    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const data = results.data;
                setCsvData(data);
                if (data.length > 0) {
                    setPreviewHeaders(Object.keys(data[0]));
                }
            },
        });
    };

    const getPivotData = () => {
        if (!csvData.length || !rowFields.length || !colFields.length || !valFields.length) {
            return { data: {}, rowKeys: [], colKeys: [], valFields: [] };
        }

        const result = {};
        const rowKeysSet = new Set();
        const colKeysSet = new Set();

        const countStore = {}; // Needed for average calculations

        csvData.forEach((row) => {
            const rowKey = rowFields.map((f) => row[f]).join(" | ");
            const colKey = colFields.map((f) => row[f]).join(" | ");

            rowKeysSet.add(rowKey);
            colKeysSet.add(colKey);

            if (!result[rowKey]) result[rowKey] = {};
            if (!result[rowKey][colKey]) result[rowKey][colKey] = {};
            if (!countStore[rowKey]) countStore[rowKey] = {};
            if (!countStore[rowKey][colKey]) countStore[rowKey][colKey] = {};

            valFields.forEach((field) => {
                const aggType = aggregators[field] || "sum";
                const raw = row[field];
                const value = parseFloat(raw) || 0;

                if (aggType === "count") {
                    result[rowKey][colKey][field] = (result[rowKey][colKey][field] || 0) + 1;
                } else {
                    if (!result[rowKey][colKey][field]) {
                        result[rowKey][colKey][field] = aggType === "min" ? value : 0;
                    }

                    if (aggType === "sum") result[rowKey][colKey][field] += value;
                    else if (aggType === "avg") {
                        result[rowKey][colKey][field] += value;
                        countStore[rowKey][colKey][field] = (countStore[rowKey][colKey][field] || 0) + 1;
                    }
                    else if (aggType === "min") {
                        result[rowKey][colKey][field] = Math.min(result[rowKey][colKey][field], value);
                    }
                    else if (aggType === "max") {
                        result[rowKey][colKey][field] = Math.max(result[rowKey][colKey][field], value);
                    }
                }
            });
        });

        // Post-process averages
        valFields.forEach((field) => {
            const aggType = aggregators[field] || "sum";
            if (aggType === "avg") {
                Object.keys(result).forEach((rowKey) => {
                    Object.keys(result[rowKey]).forEach((colKey) => {
                        const sum = result[rowKey][colKey][field];
                        const count = countStore[rowKey]?.[colKey]?.[field] || 1;
                        result[rowKey][colKey][field] = sum / count;
                    });
                });
            }
        });

        return {
            data: result,
            rowKeys: Array.from(rowKeysSet),
            colKeys: Array.from(colKeysSet),
            valFields: valFields,
        };
    };


    const pivot = rowFields.length && colFields.length && valFields.length ? getPivotData() : null;


    return (
        <div className="app-container">
            <div>
                <h2>📂 CSV Pivot Table</h2>
                <input type="file" accept=".csv" onChange={handleFileUpload} className="file-input" />
            </div>


            {csvData.length > 0 && (
                <>
                    <div className="preview-table-container">
                        <h3>🗃️ Full Data Preview</h3>
                        <div className="scrollable-table">
                            <table className="preview-table">
                                <thead>
                                    <tr>{previewHeaders.map((h) => <th key={h} className="headers">{h}</th>)}</tr>
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
                    <div className="output-tables">
                        <div className="pivot-controls">
                            <div>
                                <label>Row Fields:</label>
                                <div className="controls-div">
                                {previewHeaders.map((header) => (
                                    <div key={"row-" + header}>
                                        <input
                                            type="checkbox"
                                            checked={rowFields.includes(header)}
                                            onChange={(e) =>
                                                setRowFields((prev) =>
                                                    e.target.checked ? [...prev, header] : prev.filter((h) => h !== header)
                                                )
                                            }
                                        />
                                        {header}
                                    </div>
                                ))}
                                </div>
                            </div>

                            <div>
                                <label>Column Fields:</label>
                                <div className="controls-div">
                                {previewHeaders.map((header) => (
                                    <div key={"col-" + header}>
                                        <input
                                            type="checkbox"
                                            checked={colFields.includes(header)}
                                            onChange={(e) =>
                                                setColFields((prev) =>
                                                    e.target.checked ? [...prev, header] : prev.filter((h) => h !== header)
                                                )
                                            }
                                        />
                                        {header}
                                    </div>
                                ))}
                                </div>
                            </div>

                            <div>
                                <label>Value Fields:</label>
                                <div className="controls-div">
                                {previewHeaders.map((header) => (
                                    <div key={"val-" + header} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                        <input
                                            type="checkbox"
                                            checked={valFields.includes(header)}
                                            onChange={(e) => {
                                                setValFields((prev) =>
                                                    e.target.checked ? [...prev, header] : prev.filter((h) => h !== header)
                                                );

                                                if (!e.target.checked) {
                                                    setAggregators((prev) => {
                                                        const copy = { ...prev };
                                                        delete copy[header];
                                                        return copy;
                                                    });
                                                }
                                            }}
                                        />
                                        {header}
                                        {valFields.includes(header) && (
                                            <select
                                                value={aggregators[header] || "sum"}
                                                onChange={(e) =>
                                                    setAggregators((prev) => ({ ...prev, [header]: e.target.value }))
                                                }
                                            >
                                                <option value="sum">Sum</option>
                                                <option value="count">Count</option>
                                                <option value="avg">Average</option>
                                                <option value="min">Min</option>
                                                <option value="max">Max</option>
                                            </select>
                                        )}
                                    </div>
                                ))}
                                </div>
                            </div>

                        </div>


                        {pivot && (
                            <div className="pivot-output">
                                <h2>📉Pivot Table Output</h2>
                                <div className="scrollable-table">
                                    <table className="pivot-table">
                                        <thead>
                                            <tr>
                                                <th>{rowFields.join(" + ")}</th>
                                                {pivot.colKeys.map((col) => <th key={col} className="headers">{col}</th>)}
                                                <th>Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pivot.rowKeys.map((rowKey) => {
                                                const row = pivot.data[rowKey] || {};
                                                const total = pivot.colKeys.reduce(
                                                    (sum, colKey) => sum + (row[colKey] ? Object.values(row[colKey]).reduce((s, val) => s + (parseFloat(val) || 0), 0) : 0),
                                                    0
                                                );

                                                return (
                                                    <tr key={rowKey}>
                                                        <td className="highlight">{rowKey}</td>
                                                        {pivot.colKeys.map((colKey) => {
                                                            const fieldValues = row[colKey] || {};
                                                            return (
                                                                <td key={colKey}>
                                                                    {valFields.map((field, fieldIndex) => {
                                                                        const value = fieldValues[field] || 0;
                                                                        return <div key={fieldIndex}>{`${field}: ${value}`}</div>;
                                                                    })}
                                                                </td>
                                                            );
                                                        })}
                                                        <td className="grand-total">{total}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                        <tfoot>
                                            <tr>
                                                <td className="grand-total">Grand Total</td>
                                                {pivot.colKeys.map((colKey) => {
                                                    const colTotal = pivot.rowKeys.reduce((sum, rowKey) => {
                                                        const cell = pivot.data[rowKey]?.[colKey] || {};
                                                        return (
                                                            sum +
                                                            valFields.reduce((valSum, field) => valSum + (parseFloat(cell[field]) || 0), 0)
                                                        );
                                                    }, 0);
                                                    return <td key={colKey}>{colTotal}</td>;
                                                })}
                                                <td className="grand-total">
                                                    {
                                                        pivot.rowKeys.reduce((rowSum, rowKey) =>
                                                            rowSum +
                                                            pivot.colKeys.reduce((colSum, colKey) => {
                                                                const cell = pivot.data[rowKey]?.[colKey] || {};
                                                                return (
                                                                    colSum +
                                                                    valFields.reduce((valSum, field) => valSum + (parseFloat(cell[field]) || 0), 0)
                                                                );
                                                            }, 0),
                                                            0)}
                                                </td>
                                            </tr>
                                        </tfoot>

                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default App;







