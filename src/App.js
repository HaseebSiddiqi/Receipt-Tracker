import {  Routes, Route } from "react-router-dom";
import Home from './pages/Home'
import Contact from './pages/Contact'
import About from './pages/About'
import NoPage from './pages/NoPage'
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";



function App() {
  return (
    <>
    <Navbar/>
    <div>
    
        <Routes>
          <Route index element ={<Home/>} />
          <Route path ="/home" element={<Home/> } />
          <Route path ="/about" element={<About/> } />
          <Route path ="/contact" element={<Contact/> } />
          <Route path ="*" element={<NoPage/>} />
        </Routes>
      
    </div>
    <Footer/>
    </>
  );
}

export default App;
