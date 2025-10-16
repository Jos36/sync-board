import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  // DropdownMenuLabel,
  // DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Save } from "lucide-react";

const BoardSidebar = () => {
  return (
    <div className="h-screen">
      <div className="bg-black border-r border-b-foreground/10 w-64 px-5 py-4 pr-2 h-full">
        <div className="flex justify-between">
          <p className="font-semibold mb-3">Board name</p>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <EllipsisVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* <DropdownMenuLabel></DropdownMenuLabel> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem>
                {" "}
                <div className="flex gap-x-1">
                  <Save className="size-5 pr-1" />
                  Save
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default BoardSidebar;
