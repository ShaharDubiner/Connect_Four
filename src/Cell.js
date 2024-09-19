import React from 'react';

const Cell = ({ value }) => {
  const getColor = () => {
    if (value === 1) return 'yellow';
    if (value === 2) return 'red';
    return 'white';
  };

  return (
    <div
      style={{
        width: '60px',
        height: '60px',
        backgroundColor: getColor(),
        border: '2px solid #0066cc',
        borderRadius: '50%',
        margin: '5px',
      }}
    />
  );
};

export default Cell;