import { ThemeProvider } from './context/ThemeContext'
import { Game } from './components/Game'
import './App.css'

function App() {
  return (
    <ThemeProvider>
      <Game />
    </ThemeProvider>
  )
}

export default App
