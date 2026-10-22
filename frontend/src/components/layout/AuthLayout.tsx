import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="auth-layout">
      <aside className="auth-story">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="leaf" size={25} />
          </span>
          health<span className="brand-light">app</span>
          <span className="brand-dot">.</span>
        </Link>
        <div className="auth-story-content">
          <span className="auth-eyebrow">A LITTLE BETTER, EVERY DAY</span>
          <h2>
            Build habits.
            <br />
            Find your balance.
            <br />
            <span>Feel like you.</span>
          </h2>
          <p>
            A little more awareness goes a long way. Make room for your goals, one meal at a time.
          </p>
          <div className="auth-features">
            <div className="auth-feature">
              <span>
                <Icon name="diary" size={18} />
              </span>
              Keep your food diary simple
            </div>
            <div className="auth-feature">
              <span>
                <Icon name="target" size={18} />
              </span>
              Set goals that feel right for you
            </div>
            <div className="auth-feature">
              <span>
                <Icon name="chart" size={18} />
              </span>
              See the progress you’re making
            </div>
          </div>
        </div>
        <p className="auth-story-footer">Your everyday companion for a healthier life.</p>
      </aside>
      <main className="auth-form-panel">
        <div className="auth-form-content">{children}</div>
      </main>
    </div>
  )
}
