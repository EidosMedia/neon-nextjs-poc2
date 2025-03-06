'use client';
import { NeonConnection, SiteNode } from '@eidosmedia/neon-frontoffice-ts-sdk';
import React, { useEffect, useState } from 'react';
import Switch from '../base/Switch';
import ViewStatus from './ViewStatus';

interface User {
  name: string;
  avatarUrl: string;
}

interface LoggedUserBarProps {
  data: any;
}

const LoggedUserBar: React.FC<LoggedUserBarProps> = ({ data }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [switch1Enabled, setSwitch1Enabled] = useState(false);
  const [switch2Enabled, setSwitch2Enabled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  console.log('data', data);

  const checkLoggedUser = async () => {
    const userFromBackend = await (await fetch('/api/users')).json();
    console.log('userFromBackend', userFromBackend);
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

  console.log('data.siteData.viewStatus', data.siteData.viewStatus);

  return (
    <div className="relative flex items-center bg-(--color-toolbar-background) h-16 justify-between ">
      <div className="flex items-center">
        <ViewStatus data={data} />
        <Switch
          label="Inspect items"
          checked={switch1Enabled}
          onChange={toggleSwitch1}
        />
        <Switch
          label="Analytics"
          checked={switch2Enabled}
          onChange={toggleSwitch2}
        />
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
