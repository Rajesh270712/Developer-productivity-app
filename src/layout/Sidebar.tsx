import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ClipboardList, 
  LayoutDashboard, 
  Users, 
  BarChart, 
  Settings,
  FileText
} from 'lucide-react';

import { useAuth } from '../auth/AuthContext';

interface SidebarProps {
  closeSidebar?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ closeSidebar }) => {
  const { user } = useAuth();
  const isDeveloper = user?.role === 'developer';
  const isManager = user?.role === 'manager';

  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center px-4 py-3 text-sm font-medium ${
      isActive
        ? 'text-blue-700 bg-blue-50'
        : 'text-gray-700 hover:text-blue-700 hover:bg-gray-50'
    } transition-colors`;

  const handleNavClick = () => {
    if (closeSidebar) {
      closeSidebar();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg text-white mr-3">
            <ClipboardList size={20} />
          </div>
          <span className="text-xl font-bold text-gray-900">DevLog</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
        <nav className="flex-1 space-y-1 px-2">
          {/* Common Links */}
          <NavLink to="/dashboard" className={linkClass} onClick={handleNavClick}>
            <LayoutDashboard className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>
          
          {/* Developer Links */}
          {isDeveloper && (
            <>
              <NavLink to="/logs" className={linkClass} onClick={handleNavClick}>
                <FileText className="mr-3 h-5 w-5" />
                My Logs
              </NavLink>
              
              <NavLink to="/stats" className={linkClass} onClick={handleNavClick}>
                <BarChart className="mr-3 h-5 w-5" />
                Productivity
              </NavLink>
            </>
          )}
          
          {/* Manager Links */}
          {isManager && (
            <>
              <NavLink to="/team" className={linkClass} onClick={handleNavClick}>
                <Users className="mr-3 h-5 w-5" />
                Team Overview
              </NavLink>
              
              <NavLink to="/reports" className={linkClass} onClick={handleNavClick}>
                <BarChart className="mr-3 h-5 w-5" />
                Reports
              </NavLink>
            </>
          )}
          
          {/* Common Links */}
          <NavLink to="/settings" className={linkClass} onClick={handleNavClick}>
            <Settings className="mr-3 h-5 w-5" />
            Settings
          </NavLink>
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>DevLog • v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;