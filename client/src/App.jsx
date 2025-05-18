import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('login');

  return (
    <div>
      {currentPage === 'login' ? <Login /> : <Register />}
      <button onClick={() => setCurrentPage('login')}>Login</button>
      <button onClick={() => setCurrentPage('register')}>Register</button>
    </div>
  ) 

}

export default App
