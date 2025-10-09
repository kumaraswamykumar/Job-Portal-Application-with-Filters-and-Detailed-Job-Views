import {BrowserRouter, Switch, Route} from 'react-router-dom'
import Jobs from './components/Jobs'
import JobItemDetails from './components/JobItemDetails'
import Home from './components/Home'
import Login from './components/Login'
import NotFound from './components/NotFound'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'

const PageWithHeader = ({Component, ...rest}) => (
  <>
    <Header />
    <Component {...rest} />
  </>
)

const App = () => (
  <BrowserRouter>
    <Switch>
      <Route exact path="/login" component={Login} />
      <ProtectedRoute
        exact
        path="/"
        render={props => <PageWithHeader Component={Home} {...props} />}
      />
      <ProtectedRoute
        exact
        path="/jobs"
        render={props => <PageWithHeader Component={Jobs} {...props} />}
      />
      <ProtectedRoute
        exact
        path="/jobs/:id"
        render={props => (
          <PageWithHeader Component={JobItemDetails} {...props} />
        )}
      />
      <Route component={NotFound} />
    </Switch>
  </BrowserRouter>
)

export default App
