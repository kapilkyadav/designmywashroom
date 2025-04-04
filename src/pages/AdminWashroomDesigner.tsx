
import React from 'react';
import WashroomLayoutDesigner from '@/components/admin/washroom-designer/WashroomLayoutDesigner';
import { Helmet } from 'react-helmet';

const AdminWashroomDesigner = () => {
  return (
    <div>
      <Helmet>
        <title>Washroom Layout Designer | Admin</title>
      </Helmet>
      <WashroomLayoutDesigner />
    </div>
  );
};

export default AdminWashroomDesigner;
