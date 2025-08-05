import React from 'react';
import WorldcoinPaymentButton from './WorldcoinPaymentButton';

const WorldcoinPaymentExample: React.FC = () => {
  const handlePaymentSuccess = (txHash: string) => {
    console.log('Payment successful! Transaction hash:', txHash);
    // Aquí puedes manejar el éxito del pago, como actualizar el estado de la app
    alert(`Payment successful! Check console for transaction hash: ${txHash}`);
  };

  const handlePaymentError = (error: Error) => {
    console.error('Payment failed:', error);
    alert(`Payment failed: ${error.message}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Worldcoin Payment Demo</h1>
        
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-semibold mb-4">Instrucciones:</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Asegúrate de tener World App instalado en tu móvil</li>
              <li>Configura un Project ID de WalletConnect (ver consola)</li>
              <li>Ten algunos WLD tokens en tu wallet de Optimism</li>
              <li>Haz clic en "Connect World App" para conectar tu wallet</li>
              <li>Una vez conectado, haz clic en "Pay 0.01 WLD" para enviar el pago</li>
            </ol>
          </div>

          <WorldcoinPaymentButton
            recipientAddress="0x742d35Cc6644C0532925a3b8D8B78C67A9C8c3Bb"
            amount="0.01"
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Configuración requerida:</h3>
            <p className="text-yellow-700 text-sm">
              Para usar este componente, necesitas:
              <br />
              1. Obtener un Project ID de WalletConnect desde{' '}
              <a href="https://cloud.walletconnect.com" className="underline" target="_blank" rel="noopener noreferrer">
                WalletConnect Cloud
              </a>
              <br />
              2. Reemplazar 'your_project_id_here' en el componente WorldcoinPaymentButton
              <br />
              3. Asegurarte de tener WLD tokens en Optimism mainnet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldcoinPaymentExample; 