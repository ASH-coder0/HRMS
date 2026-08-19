import React from 'react';
import TrainingTable from '../../components/tables/TraningTable';
import CreateTraining from '../../components/form/CreateTraning';
import { useAuth } from '../../context/AuthContext';

const Training = () => {
  const { user } = useAuth();
  const userRole = user?.role?.toLowerCase() || '';
  const canManageTraining = ['admin', 'super_admin', 'hr', 'manager'].includes(userRole);

  return (
    <div>
      {canManageTraining && <CreateTraining />}
      <TrainingTable canManage={canManageTraining} />
    </div>
  );
};

export default Training;