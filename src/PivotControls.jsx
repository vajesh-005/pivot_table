import React from "react";
import DropZone from "./DropZone";
import DraggableField from "./DraggableField";


const PivotControls = ({
  previewHeaders, rowFields, colFields, valFields,
  setRowFields, setColFields, setValFields, aggregators,
  setAggregators, onAggregatorChange
}) => {
  return (
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
              setValFields((prev) => [...prev, name]);
              setAggregators((prev) => ({ ...prev, [name]: "sum" }));
            }
          }}
          onRemove={(name) => {
            setValFields((prev) => prev.filter((f) => f !== name));
            setAggregators((prev) => {
              const copy = { ...prev };
              delete copy[name];
              return copy;
            });
          }}
          isValueZone={true}
          aggregators={aggregators}
          setAggregators={setAggregators}
          onAggregatorChange={onAggregatorChange}
        />
      </div>
    </div>
  );
};

export default PivotControls;
