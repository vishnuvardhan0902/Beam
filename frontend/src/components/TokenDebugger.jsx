import React, { useEffect } from 'react';
import { runTokenDiagnostics } from '../utils/token-debug';

/**
 * TokenDebugger Component
 * 
 * A component that runs token diagnostics when mounted and displays results.
 * Add this component temporarily to any page where you're experiencing token issues.
 */
const TokenDebugger = () => {
  useEffect(() => {
    console.log('TokenDebugger component mounted - Running diagnostics');
    runTokenDiagnostics();
  }, []);

  return (
    <div className="token-debugger" style={{ padding: '15px', background: '#f5f5f5', borderRadius: '4px', margin: '10px 0' }}>
      <h3>Token Debugging Mode</h3>
      <p>Token diagnostics are running in the console.</p>
      <p>Check browser console (F12) for detailed token information and potential issues.</p>
    </div>
  );
};

export default TokenDebugger; 