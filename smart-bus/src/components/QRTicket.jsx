import QRCode from "react-qr-code";

export default function QRTicket({ ticket }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-lg text-center">
      <h2 className="text-lg font-bold mb-2">Your Ticket</h2>
      <p>From: {ticket.from}</p>
      <p>To: {ticket.to}</p>
      <p>Fare: Rs {ticket.fare}</p>
      <p>ETA: {ticket.eta.join(" / ")} min (Buses)</p>
      <div className="mt-4 flex justify-center">
        <QRCode value={`Ticket:${ticket.id}`} size={128} />
      </div>
    </div>
  );
}
