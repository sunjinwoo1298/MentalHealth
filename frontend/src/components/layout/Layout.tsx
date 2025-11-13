import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { Background3D } from "../background3d";
import BackgroundRipple from "../BackgroundRipple";
import SketchCursor from "../SketchCursor";
import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen w-[100vw] relative z-10">
      <Background3D />
      {/* <BackgroundRipple /> */}
      <SketchCursor />
      <Sidebar />
      <div className="flex flex-col md:ml-64">
        <Topbar />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
