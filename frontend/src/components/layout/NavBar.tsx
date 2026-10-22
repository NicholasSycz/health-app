import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Icon from '../ui/Icon'

const links = [
  { to: '/dashboard', label: 'Overview', icon: 'dashboard' },
  { to: '/food-log', label: 'Food diary', icon: 'diary' },
  { to: '/goals', label: 'My goals', icon: 'target' },
] as const

export default function NavBar() {
  const { logout, email } = useAuth()
  const location = useLocation()

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/dashboard" className="brand">
            <span className="brand-mark">
              <Icon name="leaf" size={25} />
            </span>
            health<span className="brand-light">app</span>
            <span className="brand-dot">.</span>
          </Link>
          <span className="topbar-tagline">Small steps. A healthier you.</span>
          <div className="account-menu">
            <span className="avatar" aria-hidden="true">
              {email?.charAt(0).toUpperCase() || 'H'}
            </span>
            <span className="account-email">{email}</span>
            <button onClick={logout} className="logout-button" aria-label="Sign out">
              <Icon name="logout" size={18} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>
      <nav className="main-nav" aria-label="Main navigation">
        <div className="nav-inner">
          <div className="nav-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
                aria-current={location.pathname === link.to ? 'page' : undefined}
              >
                <Icon name={link.icon} size={18} />
                {link.label}
              </Link>
            ))}
          </div>
          <Link to="/food-log" className="nav-add">
            <Icon name="plus" size={17} />
            Log food
          </Link>
        </div>
      </nav>
    </>
  )
}
