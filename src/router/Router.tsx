import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
};

export default Router;
