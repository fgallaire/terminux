import { useState } from 'react';
import { BootSequence } from '@/components/BootSequence';
import { XTermTerminal } from '@/components/XTermTerminal';

const Index = () => {
  const [bootComplete, setBootComplete] = useState(false);

  return (
    <div className="crt-screen">
      <div className="crt-vignette" />
      <div className="crt-content w-full h-full">
        {!bootComplete ? (
          <BootSequence onComplete={() => setBootComplete(true)} />
        ) : (
          <XTermTerminal />
        )}
      </div>
    </div>
  );
};

export default Index;
