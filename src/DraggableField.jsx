import { useDrag } from "react-dnd";

const DraggableField = ({ name }) => {
  const [{ isDragging } = {}, drag] = useDrag({
    type: "FIELD",
    item: { name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,

        cursor: "move",
      }}
    >
      {name}
    </div>
  );
};

export default DraggableField;
