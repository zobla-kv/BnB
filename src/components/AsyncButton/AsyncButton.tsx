import React, { useMemo } from 'react';

import Spinner from '../Spinner/Spinner';

interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading: boolean;
}

const AsyncButton: React.FC<AsyncButtonProps> = ({ children, className, isLoading, ...props }) => {
  const buttonContent = useMemo(() => {
    return isLoading ? <Spinner /> : children;
  }, [isLoading, children]);

  return (
    <button className={`${className} flex-center ${isLoading ? 'disabled' : ''}`} {...props}>
      {buttonContent}
    </button>
  );
};

export default AsyncButton;