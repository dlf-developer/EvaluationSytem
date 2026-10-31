import React, { useEffect, useState } from "react";
import { useRoutes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defaultProtect, protect } from "./Utils/Routes";
import { withoutAuthRoute } from "./Utils/helper";
import { initCuteMalkinTheme, isCuteMalkinThemeActive } from "./Utils/cuteMalkinTheme";
import CuteBubbleRain from "./Components/CuteBubbleRain";

function App() {
  const routing = useRoutes(protect);
  const [isCuteActive, setIsCuteActive] = useState(() => isCuteMalkinThemeActive());

  useEffect(() => {
    initCuteMalkinTheme();

    const handleThemeChange = (e) => {
      setIsCuteActive(Boolean(e.detail?.active));
    };

    window.addEventListener("cute-theme-changed", handleThemeChange);
    return () => {
      window.removeEventListener("cute-theme-changed", handleThemeChange);
    };
  }, []);

  let pathName = window.location.pathname
    .toLowerCase()
    .replace(/^\/|\/$/g, "")
    .split("/");

  let checkIsWithoutAuthRoute = withoutAuthRoute.includes(
    pathName && pathName.length > 0 ? pathName[0] : "--"
  );

  const defaultRouting = useRoutes(defaultProtect);

  return (
    <>
      <ToastContainer />
      {isCuteActive && <CuteBubbleRain />}
      {checkIsWithoutAuthRoute ? defaultRouting : routing}
    </>
  );
}

export default App;
