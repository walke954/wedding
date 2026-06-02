import { PasswordGate } from './components/PasswordGate'
import { Gallery } from './components/Gallery'

function App() {
  return (
    <PasswordGate>
      <Gallery />
    </PasswordGate>
  )
}

export default App
