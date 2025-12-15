import React from 'react';
import { colors, participantStatusColors } from '../../theme/colors';

/**
 * StatusDot Component
 * 
 * Displays a colored dot indicator for participant or workshop status
 * Mimics Discord's online/offline/idle/dnd status indicators
 * 
 * @param {string} status - The status to display (pending, admitted, left_early, absent)
 * @param {string} size - Size variant (sm, md, lg)
 * @param {boolean} showPulse - Whether to show pulse animation (for active status)
 */

const StatusDot = ({ status, size = 'md', showPulse = false, className = '' }) => {
  // Size mapping
  const sizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  // Get color based on status
  const getStatusColor = () => {
    return participantStatusColors[status] || colors.status.offline;
  };

  const dotSize = sizes[size] || sizes.md;
  const statusColor = getStatusColor();

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Pulse animation for active status */}
      {showPulse && status === 'admitted' && (
        <span
          className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping"
          style={{ backgroundColor: statusColor }}
        />
      )}
      
      {/* Status dot */}
      <span
        className={`relative inline-block ${dotSize} rounded-full`}
        style={{ backgroundColor: statusColor }}
        aria-label={`Status: ${status}`}
      />
    </div>
  );
};

export default StatusDot;
