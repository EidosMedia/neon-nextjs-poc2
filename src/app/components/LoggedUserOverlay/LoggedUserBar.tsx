"use client";
import { NeonConnection, SiteNode } from "@eidosmedia/neon-frontoffice-ts-sdk";
import React, { useEffect, useState } from "react";

interface User {
  name: string;
  avatarUrl: string;
}

interface LoggedUserBarProps {
  data: SiteNode;
  onLogout: () => void;
}

const LoggedUserBar: React.FC<LoggedUserBarProps> = ({ data }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [switch1Enabled, setSwitch1Enabled] = useState(false);
  const [switch2Enabled, setSwitch2Enabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const checkLoggedUser = async () => {
    const userFromBackend = await (await fetch("/api/users")).json();
    console.log("userFromBackend", userFromBackend);
    setCurrentUser(userFromBackend);
  };

  useEffect(() => {
    checkLoggedUser();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleSwitch1 = () => {
    setSwitch1Enabled(!switch1Enabled);
  };
  const toggleSwitch2 = () => {
    setSwitch2Enabled(!switch2Enabled);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="relative flex items-center bg-black h-16 justify-between ">
      <div className="flex items-center">
        <div className="flex items-center justify-center bg-gray-500 text-white p-5">
          PREVIEW
        </div>

        <div className="flex items-center mx-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={switch1Enabled}
              onChange={toggleSwitch1}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="m-3 text-white">Inspect items</span>
        </div>

        <div className="flex items-center mx-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={switch2Enabled}
              onChange={toggleSwitch2}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
          <span className="m-3 text-white">Analytics</span>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center justify-center text-white">
          sitename
        </div>
        <a>
          <i></i>
        </a>

        <div className="flex rounded-full text-white p-2 cursor-pointer">
          username
        </div>
      </div>
    </div>
  );
};

export default LoggedUserBar;
