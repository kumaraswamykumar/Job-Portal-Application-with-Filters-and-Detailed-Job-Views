import './index.css'
import Header from '../Header'

const NotFound = () => (
  <div className="notFoundContainer">
    <Header />
    <img
      src="https://assets.ccbp.in/frontend/react-js/not-found-img.png"
      alt="not found"
    />
    <h1>Page Not Found</h1>
    <p>We&apos;re sorry, the page you requested could not be found</p>
  </div>
)

export default NotFound
