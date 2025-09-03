// Template service provider to switch between real and mock services
import React, { createContext, useContext, useState } from 'react';
import templateService from '../services/templateService';
import mockTemplateService from '../services/mockTemplateService';

const TemplateServiceContext = createContext();

export const useTemplateService = () => {
  const context = useContext(TemplateServiceContext);
  if (!context) {
    throw new Error('useTemplateService must be used within a TemplateServiceProvider');
  }
  return context;
};

export const TemplateServiceProvider = ({ children }) => {
  const [useMock, setUseMock] = useState(false);
  
  const service = useMock ? mockTemplateService : templateService;
  
  return (
    <TemplateServiceContext.Provider value={{ service, useMock, setUseMock }}>
      {children}
    </TemplateServiceContext.Provider>
  );
};

export default TemplateServiceProvider;