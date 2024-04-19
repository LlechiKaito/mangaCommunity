import { BrowserRouter, Route, Routes, Link } from "react-router-dom";
import Login from "./components/users/Login";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
