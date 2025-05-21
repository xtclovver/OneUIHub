import React from 'react';
import { ModelRequest } from '../../components/models';
import { useLocation } from 'react-router-dom';

const RequestsPage: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const modelId = queryParams.get('model_id') || undefined;

  return (
    <div>
      <ModelRequest selectedModelId={modelId} />
    </div>
  );
};

export default RequestsPage; 