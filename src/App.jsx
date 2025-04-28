// import React, { useState } from "react";
// import Papa from "papaparse";
// import "./App.css";
// import { DndProvider } from "react-dnd";
// import { HTML5Backend } from "react-dnd-html5-backend";
// import DraggableField from "./DraggableField";
// import DropZone from "./DropZone";

// function App() {
//     const [csvData, setCsvData] = useState([]);
//     const [previewHeaders, setPreviewHeaders] = useState([]);
//     const [rowFields, setRowFields] = useState([]);
//     const [colFields, setColFields] = useState([]);
//     const [valFields, setValFields] = useState([]);
//     const [aggregators, setAggregators] = useState({});

//     const handleFileUpload = (e) => {
//         const file = e.target.files[0];
//         if (!file) return;

//         Papa.parse(file, {
//             header: true,
//             skipEmptyLines: true,
//             complete: (results) => {
//                 const data = results.data;
//                 setCsvData(data);
//                 if (data.length > 0) {
//                     setPreviewHeaders(Object.keys(data[0]));
//                 }
//             },
//         });
//     };

//     const getPivotData = () => {
//         if (!csvData.length || !rowFields.length || !colFields.length || !valFields.length) {
//             return { data: {}, rowKeys: [], colKeys: [], valFields: [] };
//         }

//         const result = {};
//         const rowKeysSet = new Set();
//         const colKeysSet = new Set();
//         const countStore = {};

//         csvData.forEach((row) => {
//             const rowKey = rowFields.map((f) => row[f]).join(" / ");
//             const colKey = colFields.map((f) => row[f]).join(" / ");

//             rowKeysSet.add(rowKey);
//             colKeysSet.add(colKey);

//             if (!result[rowKey]) result[rowKey] = {};
//             if (!result[rowKey][colKey]) result[rowKey][colKey] = {};
//             if (!countStore[rowKey]) countStore[rowKey] = {};
//             if (!countStore[rowKey][colKey]) countStore[rowKey][colKey] = {};

//             valFields.forEach((field) => {
//                 const aggType = aggregators[field] || "sum";
//                 const raw = row[field];
//                 const value = parseFloat(raw) || 0;

//                 if (aggType === "count") {
//                     result[rowKey][colKey][field] = (result[rowKey][colKey][field] || 0) + 1;
//                 } else {
//                     if (!result[rowKey][colKey][field]) {
//                         result[rowKey][colKey][field] = aggType === "min" ? value : 0;
//                     }
//                     if (aggType === "sum") result[rowKey][colKey][field] += value;
//                     else if (aggType === "avg") {
//                         result[rowKey][colKey][field] += value;
//                         countStore[rowKey][colKey][field] = (countStore[rowKey][colKey][field] || 0) + 1;
//                     } else if (aggType === "min") {
//                         result[rowKey][colKey][field] = Math.min(result[rowKey][colKey][field], value);
//                     } else if (aggType === "max") {
//                         result[rowKey][colKey][field] = Math.max(result[rowKey][colKey][field], value);
//                     }
//                 }
//             });
//         });


//         valFields.forEach((field) => {
//             const aggType = aggregators[field] || "sum";
//             if (aggType === "avg") {
//                 Object.keys(result).forEach((rowKey) => {
//                     Object.keys(result[rowKey]).forEach((colKey) => {
//                         const sum = result[rowKey][colKey][field];
//                         const count = countStore[rowKey]?.[colKey]?.[field] || 1;
//                         result[rowKey][colKey][field] = sum / count;
//                     });
//                 });
//             }
//         });

//         return {
//             data: result,
//             rowKeys: Array.from(rowKeysSet),
//             colKeys: Array.from(colKeysSet),
//             valFields: valFields,
//         };
//     };

//     const pivot = rowFields.length && colFields.length && valFields.length ? getPivotData() : null;
//     const onAggregatorChange = (name, value) => {
//         setAggregators((prev) => ({ ...prev, [name]: value }));
//     };

//     return (
//         <DndProvider backend={HTML5Backend}>
//             <div className="app-container">
//                 <div>
//                     <h2>📂 CSV Pivot Table</h2>
//                     <input type="file" accept=".csv" onChange={handleFileUpload} className="file-input" />
//                 </div>

//                 {csvData.length > 0 && (
//                     <>
//                         <div className="preview-table-container">
//                             <h3>🗃️ Full Data Preview</h3>
//                             <div className="scrollable-table">
//                                 <table className="preview-table">
//                                     <thead>
//                                         <tr>
//                                             {previewHeaders.map((h) => (
//                                                 <th key={h} className="headers">{h}</th>
//                                             ))}
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {csvData.map((row, i) => (
//                                             <tr key={i}>
//                                                 {previewHeaders.map((h, j) => (
//                                                     <td key={h} className={j === 0 ? "first-column" : ""}>
//                                                         {row[h]}
//                                                     </td>
//                                                 ))}
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                             </div>
//                         </div>

//                         <div className="output-tables">
//                             <div className="pivot-controls">
//                                 <div className="available-fields">
//                                     <h4>Available Fields</h4>
//                                     <div>
//                                         {previewHeaders
//                                             .filter(header => !rowFields.includes(header) && !colFields.includes(header) && !valFields.includes(header))
//                                             .map((header) => (
//                                                 <DraggableField key={header} name={header} />
//                                             ))}
//                                     </div>
//                                 </div>

//                                 <div className="drop-zones">
//                                     <DropZone
//                                         label="Row Fields :"
//                                         fields={rowFields}
//                                         onDrop={(name) => {
//                                             if (!rowFields.includes(name)) setRowFields(prev => [...prev, name]);
//                                         }}
//                                         onRemove={(name) => setRowFields(prev => prev.filter(f => f !== name))}
//                                     />

//                                     <DropZone
//                                         label="Column Fields :"
//                                         fields={colFields}
//                                         onDrop={(name) => {
//                                             if (!colFields.includes(name)) setColFields(prev => [...prev, name]);
//                                         }}
//                                         onRemove={(name) => setColFields(prev => prev.filter(f => f !== name))}
//                                     />

//                                     <DropZone
//                                         label="Value Fields :"
//                                         fields={valFields}
//                                         onDrop={(name) => {
//                                             if (!valFields.includes(name)) {
//                                                 setValFields((prev) => [...prev, name]);
//                                                 setAggregators((prev) => ({ ...prev, [name]: "sum" }));
//                                             }
//                                         }}
//                                         onRemove={(name) => {
//                                             setValFields((prev) => prev.filter((f) => f !== name));
//                                             setAggregators((prev) => {
//                                                 const copy = { ...prev };
//                                                 delete copy[name];
//                                                 return copy;
//                                             });
//                                         }}
//                                         isValueZone={true}
//                                         aggregators={aggregators}
//                                         setAggregators={setAggregators}
//                                         onAggregatorChange={onAggregatorChange}
//                                     />
//                                 </div>
//                             </div>

//                             {pivot && (
//                                 <div className="pivot-output">
//                                     <h2>Pivot Table Output</h2>
//                                     <div className="scrollable-table">
//                                         <table className="pivot-table">
//                                             <thead>
//                                                 <tr>
//                                                     <th>{rowFields.join(" + ")}</th>
//                                                     {pivot.colKeys.map((col) => (
//                                                         <th key={col} className="headers">{col}</th>
//                                                     ))}
//                                                     <th>Total</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {pivot.rowKeys.map((rowKey) => {
//                                                     const row = pivot.data[rowKey] || {};
//                                                     const total = valFields.reduce((acc, field) => {
//                                                         const aggType = aggregators[field] || "sum";
//                                                         let fieldTotal = pivot.colKeys.reduce((fieldSum, colKey) => {
//                                                             const val = row[colKey]?.[field];
//                                                             if (val !== undefined) {
//                                                                 if (aggType === "sum" || aggType === "avg") {
//                                                                     return fieldSum + parseFloat(val);
//                                                                 } else if (aggType === "count") {
//                                                                     return fieldSum + parseInt(val);
//                                                                 } else if (aggType === "min") {
//                                                                     return Math.min(fieldSum, parseFloat(val));
//                                                                 } else if (aggType === "max") {
//                                                                     return Math.max(fieldSum, parseFloat(val));
//                                                                 }
//                                                             }
//                                                             return fieldSum;
//                                                         }, aggType === "min" ? Infinity : aggType === "max" ? -Infinity : 0);

//                                                         return acc + (isFinite(fieldTotal) ? fieldTotal : 0);
//                                                     }, 0);

//                                                     return (
//                                                         <tr key={rowKey}>
//                                                             <td className="highlight">{rowKey}</td>
//                                                             {pivot.colKeys.map((colKey) => {
//                                                                 const fieldValues = row[colKey] || {};
//                                                                 return (
//                                                                     <td key={colKey}>
//                                                                         {valFields.map((field, fieldIndex) => {
//                                                                             const value = fieldValues[field] || 0;
//                                                                             return <div key={fieldIndex}>{`${field}: ${value}`}</div>;
//                                                                         })}
//                                                                     </td>
//                                                                 );
//                                                             })}
//                                                             <td className="grand-total">{total}</td>
//                                                         </tr>
//                                                     );
//                                                 })}
//                                             </tbody>
//                                             <tfoot>
//                                                 <tr>
//                                                     <th>Grand Total</th>
//                                                     {pivot.colKeys.map((colKey) => {
//                                                         const grandTotal = valFields.reduce((acc, field) => {
//                                                             const aggType = aggregators[field] || "sum";
//                                                             let fieldTotal = pivot.rowKeys.reduce((fieldSum, rowKey) => {
//                                                                 const val = pivot.data[rowKey]?.[colKey]?.[field];
//                                                                 if (val !== undefined) {
//                                                                     if (aggType === "sum" || aggType === "avg") {
//                                                                         return fieldSum + parseFloat(val);
//                                                                     } else if (aggType === "count") {
//                                                                         return fieldSum + parseInt(val);
//                                                                     } else if (aggType === "min") {
//                                                                         return Math.min(fieldSum, parseFloat(val));
//                                                                     } else if (aggType === "max") {
//                                                                         return Math.max(fieldSum, parseFloat(val));
//                                                                     }
//                                                                 }
//                                                                 return fieldSum;
//                                                             }, aggType === "min" ? Infinity : aggType === "max" ? -Infinity : 0);

//                                                             return acc + (isFinite(fieldTotal) ? fieldTotal : 0);
//                                                         }, 0);

//                                                         return <td key={colKey} className="grand-total">{grandTotal}</td>;
//                                                     })}
//                                                     <td></td>
//                                                 </tr>
//                                             </tfoot>
//                                         </table>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </>
//                 )}
//             </div>
//         </DndProvider>
//     );
// }

// export default App;




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
          } else if (aggType === "min") {
            result[rowKey][colKey][field] = Math.min(result[rowKey][colKey][field], value);
          } else if (aggType === "max") {
            result[rowKey][colKey][field] = Math.max(result[rowKey][colKey][field], value);
          }
        }
      });
    });

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
            {pivot && <PivotTableOutput pivot={pivot} rowFields={rowFields} valFields={valFields} aggregators={aggregators} />}
          </>
        )}
      </div>
    </DndProvider>
  );
}

export default App;
