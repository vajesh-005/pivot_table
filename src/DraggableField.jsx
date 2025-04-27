import { useDrag } from "react-dnd";

const DraggableField = ({ name }) => {
    const [{ isDragging }, drag] = useDrag({
        type: "FIELD",
        item: { name },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div
            ref={drag}
        >
            {name}
        </div>
    );
};

export default DraggableField;
