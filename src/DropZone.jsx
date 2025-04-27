import { useDrop } from "react-dnd";

const DropZone = ({ label, onDrop, fields, onRemove, isValueZone = false, aggregators = {}, onAggregatorChange = () => {} }) => {
  const [{ isOver }, drop] = useDrop({
    accept: "FIELD",
    drop: (item) => onDrop(item.name),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop}>
      <strong>{label}</strong>
      {fields.map((field, index) => (
        <div key={index} className="drop-field">
          {field}
          {isValueZone && (
            <select
              value={aggregators[field] || "sum"}
              onChange={(e) => onAggregatorChange(field, e.target.value)}
              style={{ marginLeft: "8px" }}
            >
              <option value="sum">Sum</option>
              <option value="count">Count</option>
              <option value="avg">Average</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
            </select>
          )}
          <button onClick={() => onRemove(field)}>❌</button>
        </div>
      ))}
    </div>
  );
};

export default DropZone;
