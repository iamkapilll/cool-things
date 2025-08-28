import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function Conductor() {
  const [scanned, setScanned] = useState(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const qrScanner = new Html5Qrcode("qr-reader");
    qrScanner.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: 250 },
      (decodedText) => {
        setScanned(JSON.parse(decodedText));
        qrScanner.stop(); // stop after 1 scan
      },
      (error) => {}
    );
    return () => qrScanner.stop();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-xl font-bold mb-4">Conductor QR Scanner</h1>
      <div id="qr-reader" style={{ width: "300px" }}></div>
      {scanned && (
        <div className="mt-4 p-4 bg-white rounded shadow">
          <h2 className="font-bold">✅ Ticket Valid</h2>
          <p>ID: {scanned.id}</p>
          <p>From: {scanned.from}</p>
          <p>To: {scanned.to}</p>
          <p>Fare: Rs. {scanned.fare}</p>
        </div>
      )}
    </div>
  );
}

export default Conductor;
