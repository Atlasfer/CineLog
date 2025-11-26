import { Routes, Route } from "react-router-dom"
import Home from "./page/Home.jsx"
import Profile from "./page/profile.jsx"


function App() {  
  return (
    <div>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/profile" Component={Profile} />
      </Routes>
    </div>
  )
}

export default App
