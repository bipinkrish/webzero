import React, { Suspense } from "react";
import dynamic from "next/dynamic";

interface DynamicFileProps {
  id: string;
}

const DynamicFileRenderer: React.FC<DynamicFileProps> = ({ id }) => {
  const DynamicComponent = dynamic(
    () => import(`../components/generated/${id}.tsx`),
    {
      loading: () => <div>Loading...</div>,
      ssr: false,
    }
  );

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DynamicComponent />
    </Suspense>
  );
};

export default DynamicFileRenderer;
