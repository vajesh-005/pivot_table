import React, { useState } from "react";
import Papa from "papaparse";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import PreviewTable from "./PreviewTable";
import PivotControls from "./PivotControls";
import PivotTableOutput from "./PivotTableOutput";
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
      return { rowKeys: [], colKeys: [], getAggregator: () => ({ value: () => null }) };
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
          } else if (aggType === "min") {
            result[rowKey][colKey][field] = Math.min(result[rowKey][colKey][field], value);
          } else if (aggType === "max") {
            result[rowKey][colKey][field] = Math.max(result[rowKey][colKey][field], value);
          }
        }
      });
    });


    const getAggregator = (rowKeyArr, colKeyArr) => {
      const rowKey = rowKeyArr.join(" / ");
      const colKey = colKeyArr.join(" / ");
      return {
        value: () => {
          if (rowKey && colKey) {
            const cell = result[rowKey]?.[colKey];
            if (cell) {
              return Object.values(cell).join(", ");
            }
          } else if (rowKey && !colKey) {
            // Row total
            const rowObj = result[rowKey];
            if (rowObj) {
              let total = 0;
              for (let col in rowObj) {
                for (let field in rowObj[col]) {
                  total += rowObj[col][field];
                }
              }
              return total;
            }
          } else if (!rowKey && colKey) {
            // Column total
            let total = 0;
            for (let r in result) {
              const cell = result[r][colKey];
              if (cell) {
                for (let field in cell) {
                  total += cell[field];
                }
              }
            }
            return total;
          } else {
            // Grand total
            let total = 0;
            for (let r in result) {
              for (let c in result[r]) {
                for (let field in result[r][c]) {
                  total += result[r][c][field];
                }
              }
            }
            return total;
          }
          return null;
        },
      };
    };

    return {
      rowKeys: Array.from(rowKeysSet).map(k => k.split(" / ")), // Split back into array
      colKeys: Array.from(colKeysSet).map(k => k.split(" / ")),
      getAggregator,
    };
  };


  const onAggregatorChange = (name, value) => {
    setAggregators((prev) => ({ ...prev, [name]: value }));
  };

  const pivot = rowFields.length && colFields.length && valFields.length ? getPivotData() : null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <h2>📂 CSV Pivot Table</h2>
        <input type="file" accept=".csv" onChange={handleFileUpload} className="file-input" />

        {csvData.length > 0 && (
          <>
            <PreviewTable csvData={csvData} previewHeaders={previewHeaders} />
            <PivotControls
              previewHeaders={previewHeaders}
              rowFields={rowFields}
              colFields={colFields}
              valFields={valFields}
              setRowFields={setRowFields}
              setColFields={setColFields}
              setValFields={setValFields}
              aggregators={aggregators}
              setAggregators={setAggregators}
              onAggregatorChange={onAggregatorChange}
            />
            {pivot && <PivotTableOutput pivotData={pivot} rowAttrs={rowFields} colAttrs={colFields} />}
          </>
        )}
      </div>
    </DndProvider>
  );
}

export default App;
