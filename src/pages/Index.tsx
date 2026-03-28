import { useState } from 'react';
import { BootSequence } from '@/components/BootSequence';
import { V86Terminal } from '@/components/V86Terminal';
import { SimulatedTerminal } from '@/components/SimulatedTerminal';

const Index = () => {
  const [bootComplete, setBootComplete] = useState(false);
  const [useSimulated, setUseSimulated] = useState(false);

  return (
    <div className="crt-screen">
      <div className="crt-vignette" />
      <div className="crt-content w-full h-full">
        {!bootComplete ? (
          <BootSequence onComplete={() => setBootComplete(true)} />
        ) : useSimulated ? (
          <SimulatedTerminal />
        ) : (
          <V86Terminal onFallback={() => setUseSimulated(true)} />
        )}
      </div>
    </div>
  );
};

export default Index;
