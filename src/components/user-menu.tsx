"use client";

import { UserButton } from "@clerk/nextjs";
import { Settings } from "lucide-react";

export function UserMenu() {
  return (
    <UserButton>
      <UserButton.MenuItems>
        <UserButton.Link
          label="Settings"
          labelIcon={<Settings className="h-4 w-4" />}
          href="/settings"
        />
      </UserButton.MenuItems>
    </UserButton>
  );
}
