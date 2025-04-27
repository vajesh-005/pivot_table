import React, { useState } from "react";
import Papa from "papaparse";
import "./App.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import DraggableField from "./DraggableField";
import DropZone from "./DropZone";
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
        const countStore = {};

        csvData.forEach((row) => {
            const rowKey = rowFields.map((f) => row[f]).join(" / ");
            const colKey = colFields.map((f) => row[f]).join(" / ");

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
        <DndProvider backend={HTML5Backend}>
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

                        <div className="output-tables">
                            <div className="pivot-controls">
                                <div className="available-fields">
                                    <h4>Available Fields</h4>
                                    <div>
                                        {previewHeaders
                                            .filter(header => !rowFields.includes(header) && !colFields.includes(header) && !valFields.includes(header))
                                            .map((header) => (
                                                <DraggableField key={header} name={header} />
                                            ))}

                                    </div>

                                </div>

                                <div className="drop-zones">
                                    <DropZone
                                        label="Row Fields :"
                                        fields={rowFields}
                                        onDrop={(name) => {
                                            if (!rowFields.includes(name)) setRowFields(prev => [...prev, name]);
                                        }}
                                        onRemove={(name) => setRowFields(prev => prev.filter(f => f !== name))}
                                    />

                                    <DropZone
                                        label="Column Fields :"
                                        fields={colFields}
                                        onDrop={(name) => {
                                            if (!colFields.includes(name)) setColFields(prev => [...prev, name]);
                                        }}
                                        onRemove={(name) => setColFields(prev => prev.filter(f => f !== name))}
                                    />

                                    <DropZone
                                        label="Value Fields :"
                                        fields={valFields}
                                        onDrop={(name) => {
                                            if (!valFields.includes(name)) {
                                                setValFields(prev => [...prev, name]);
                                                setAggregators(prev => ({ ...prev, [name]: "sum" })); // Default aggregator
                                            }
                                        }}
                                    >
                                        {valFields.map((field) => (
                                            <div key={field} style={{ marginBottom: "8px" }}>
                                                {field}
                                                <select
                                                    value={aggregators[field]}
                                                    onChange={(e) =>
                                                        setAggregators(prev => ({ ...prev, [field]: e.target.value }))
                                                    }
                                                    style={{ marginLeft: "8px" }}
                                                >
                                                    <option value="sum">Sum</option>
                                                    <option value="count">Count</option>
                                                    <option value="avg">Average</option>
                                                    <option value="min">Minimum</option>
                                                    <option value="max">Maximum</option>
                                                </select>
                                            </div>
                                        ))}
                                    </DropZone>


                                </div>
                            </div>


                            {pivot && (
                                <div className="pivot-output">
                                    <h2>Pivot Table Output</h2>
                                    <div className="scrollable-table">
                                        <table className="pivot-table">
                                            <thead>
                                                <tr>
                                                    <th>{rowFields.join(" + ")}</th>
                                                    {pivot.colKeys.map((col) => (
                                                        <th key={col} className="headers">{col}</th>
                                                    ))}
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pivot.rowKeys.map((rowKey) => {
                                                    const row = pivot.data[rowKey] || {};
                                                    const total = pivot.colKeys.reduce(
                                                        (sum, colKey) =>
                                                            sum +
                                                            (row[colKey]
                                                                ? Object.values(row[colKey]).reduce(
                                                                    (s, val) => s + (parseFloat(val) || 0),
                                                                    0
                                                                )
                                                                : 0),
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
                                                            return sum + valFields.reduce((valSum, field) => valSum + (parseFloat(cell[field]) || 0), 0);
                                                        }, 0);
                                                        return <td key={colKey}>{colTotal}</td>;
                                                    })}
                                                    <td className="grand-total">
                                                        {pivot.rowKeys.reduce((rowSum, rowKey) =>
                                                            rowSum +
                                                            pivot.colKeys.reduce((colSum, colKey) => {
                                                                const cell = pivot.data[rowKey]?.[colKey] || {};
                                                                return (
                                                                    colSum +
                                                                    valFields.reduce((valSum, field) => valSum + (parseFloat(cell[field]) || 0), 0)
                                                                );
                                                            }, 0)
                                                            , 0)}
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
        </DndProvider>
    );
}

export default App;
