import { Outlet } from 'react-router-dom'
import NavBar from './NavBar'

export default function AppLayout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main id="main-content" className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <span>HealthApp</span>
        <p>A little progress, every day.</p>
      </footer>
    </div>
  )
}
