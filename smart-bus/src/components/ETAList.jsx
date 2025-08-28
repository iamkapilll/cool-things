export default function ETAList({ busETAs = {} }) {
  return (
    <div className="space-y-1">
      {Object.keys(busETAs).map(busId => (
        <div key={busId} className="flex justify-between items-center">
          <span>🚌 Bus {busId}</span>
          <span>{busETAs[busId]} min</span>
        </div>
      ))}
    </div>
  );
}
