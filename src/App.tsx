import { PasswordGate } from './components/PasswordGate'
import { Gallery } from './components/Gallery'
import { Admin } from './components/Admin'

function App() {
  return (
    <PasswordGate>
      {(role) => (role === 'admin' ? <Admin /> : <Gallery />)}
    </PasswordGate>
  )
}

export default App
