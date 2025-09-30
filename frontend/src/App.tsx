import { HashRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./pages/home";
import SummaryPage from "./pages/summary";
import QAToolPage from "./pages/qatool";
import Layout from "./Layout";

function App() {
    return (
      <Router>
        <Routes>
          <Route element={<Layout/>}>
            <Route path="/" element={<HomePage/>}/>
            <Route path="/summarytool" element={<SummaryPage/>}/>
            <Route path="/qatool" element={<QAToolPage/>}/>
          </Route>
        </Routes>
      </Router>
    );
}

export default App;