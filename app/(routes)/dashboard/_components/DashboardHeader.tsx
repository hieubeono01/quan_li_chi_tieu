import React from 'react'
import UserButton from './userButton';

function DashboardHeader() {
  return (
    <div className="p-5 shadow-sm border-b flex justify-between">
      <div>Seach Bar</div>
      <div><UserButton/></div>
    </div>
  );
}

export default DashboardHeader