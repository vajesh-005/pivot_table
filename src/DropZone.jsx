import { useDrop } from "react-dnd";

const DropZone = ({ label, onDrop, fields, onRemove, isValueZone = false, aggregators = {}, onAggregatorChange }) => {
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
            {fields.map((field) => (
                <div key={field} className="drop-field">
                    <span>{field}</span>
                    {label === "Value Fields :" && (
                        <select
                            value={aggregators[field] || "sum"} // Use 'field' instead of 'name'
                            onChange={(e) => {
                                // Call the onAggregatorChange passed from the parent component
                                onAggregatorChange(field, e.target.value);
                            }}
                        >
                            <option value="sum">Sum</option>
                            <option value="count">Count</option>
                            <option value="avg">Average</option>
                            <option value="min">Min</option>
                            <option value="max">Max</option>
                        </select>
                    )}
                    <button onClick={() => onRemove(field)}>❌</button>
                </div>
            ))}
        </div>
    );
};

export default DropZone;
