import React from 'react';
import styles from './Spinner.module.css';

interface SpinnerProps {
  size?: number; 
}

const Spinner: React.FC<SpinnerProps> = ({ size = 20 }) => {
  return (
    <div 
      className={styles.spinner}
      style={{ '--spinner-size': `${size}px` } as React.CSSProperties}
    />
  );
};

export default Spinner;
