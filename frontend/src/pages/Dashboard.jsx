import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/dashboard/Sidebar';
import { ChevronRight, ChevronLeft } from 'lucide-react';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-black to-gray-900">
      {/* Hamburger Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed top-24 z-50 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-all duration-300 ${
          isSidebarOpen ? 'left-64' : 'left-4'
        }`}
      >
        {isSidebarOpen ? (
          <ChevronLeft className="w-6 h-6" />
        ) : (
          <ChevronRight className="w-6 h-6" />
        )}
      </button>

      <div className="flex">
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <div 
          className={`flex-1 w-full p-8 transition-all duration-300 ${
            isSidebarOpen ? 'md:pl-64' : 'md:pl-8'
          }`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;