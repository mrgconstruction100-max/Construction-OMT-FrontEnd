import React from 'react';
import './ViewToggleSwitch.scss';

function ViewToggleSwitch({ currentView, onToggle }) {
  return (
        <div className="view-toggle-switch">
            <button
                className={currentView === 'card' ? 'active' : ''}
                onClick={() => onToggle('card')}
            >
                <span className="material-icons">grid_view</span>
            </button>
            <button
                className={currentView === 'table' ? 'active' : ''}
                onClick={() => onToggle('table')}
            >
                <span className="material-icons">list</span>
            </button>
        </div>
    );
}

export default ViewToggleSwitch