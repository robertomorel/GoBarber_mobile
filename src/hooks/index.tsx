import React from 'react';
import { AuthProvider } from './auth';

const AppProvider: React.FC = ({ children }) => {
  /**
   * children será todo o conteúdo que será colocado dentro da tag <AppProvider>
   */
  return <AuthProvider>{children}</AuthProvider>;
};

export default AppProvider;
