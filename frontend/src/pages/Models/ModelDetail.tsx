import React from 'react';
import { useParams } from 'react-router-dom';
import { ModelDetail } from '../../components/models';

const ModelDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div>
      <ModelDetail />
    </div>
  );
};

export default ModelDetailPage; 