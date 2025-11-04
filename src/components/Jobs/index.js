import {Component} from 'react'
import {Link} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

// ✅ Correct employment types list
const employmentTypesList = [
  {label: 'Full Time', employmentTypeId: 'FULLTIME'},
  {label: 'Part Time', employmentTypeId: 'PARTTIME'},
  {label: 'Freelance', employmentTypeId: 'FREELANCE'},
  {label: 'Internship', employmentTypeId: 'INTERNSHIP'},
]

class Jobs extends Component {
  state = {
    profile: {},
    jobsList: [],
    allJobs: [],
    employmentType: [],
    salaryRange: '',
    searchInput: '',
    selectedLocations: [],
    apiStatus: apiStatusConstants.initial,
    profileStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getProfile()
    this.getJobs()
  }

  getProfile = async () => {
    this.setState({profileStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const url = 'https://apis.ccbp.in/profile'
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const updated = {
        name: data.profile_details.name,
        profileImageUrl: data.profile_details.profile_image_url,
        shortBio: data.profile_details.short_bio,
      }
      this.setState({
        profile: updated,
        profileStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({profileStatus: apiStatusConstants.failure})
    }
  }

  getJobs = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const {employmentType, salaryRange, searchInput} = this.state
    const empType = employmentType.join(',')
    const url = `https://apis.ccbp.in/jobs?employment_type=${empType}&minimum_package=${salaryRange}&search=${searchInput}`
    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const updatedJobs = data.jobs.map(each => ({
        id: each.id,
        title: each.title,
        rating: each.rating,
        location: each.location,
        employmentType: each.employment_type,
        packagePerAnnum: each.package_per_annum,
        jobDescription: each.job_description,
        companyLogoUrl: each.company_logo_url,
      }))
      this.setState({
        jobsList: updatedJobs,
        allJobs: updatedJobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  onChangeSearch = event => this.setState({searchInput: event.target.value})

  onSearchClick = () => this.getJobs()

  onChangeEmploymentType = event => {
    const {employmentType} = this.state
    if (event.target.checked) {
      this.setState(
        {employmentType: [...employmentType, event.target.value]},
        this.getJobs,
      )
    } else {
      const updated = employmentType.filter(each => each !== event.target.value)
      this.setState({employmentType: updated}, this.getJobs)
    }
  }

  onChangeSalaryRange = event => {
    this.setState({salaryRange: event.target.value}, this.getJobs)
  }

  onChangeLocation = event => {
    const {selectedLocations} = this.state
    const {checked, value} = event.target
    if (checked) {
      this.setState(
        {selectedLocations: [...selectedLocations, value]},
        this.filterByLocation,
      )
    } else {
      const updated = selectedLocations.filter(each => each !== value)
      this.setState({selectedLocations: updated}, this.filterByLocation)
    }
  }

  filterByLocation = () => {
    const {selectedLocations, allJobs} = this.state
    if (selectedLocations.length === 0) {
      this.setState(prevState => ({jobsList: prevState.allJobs}))
    } else {
      const filtered = allJobs.filter(job =>
        selectedLocations.includes(job.location),
      )
      this.setState({jobsList: filtered})
    }
  }

  renderProfile = () => {
    const {profile, profileStatus} = this.state
    switch (profileStatus) {
      case apiStatusConstants.inProgress:
        return (
          <div className="loader-container" data-testid="loader">
            <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
          </div>
        )
      case apiStatusConstants.success:
        return (
          <div className="profile-card">
            <img
              src={profile.profileImageUrl}
              alt="profile"
              className="profile-img"
            />
            <h1 className="profile-name">{profile.name}</h1>
            <p className="profile-bio">{profile.shortBio}</p>
          </div>
        )
      case apiStatusConstants.failure:
        return (
          <button type="button" onClick={this.getProfile} className="retry-btn">
            Retry
          </button>
        )
      default:
        return null
    }
  }

  renderJobsList = () => {
    const {jobsList} = this.state
    if (jobsList.length === 0) {
      return (
        <div className="no-jobs">
          <img
            src="https://assets.ccbp.in/frontend/react-js/no-jobs-img.png"
            alt="no jobs"
          />
          <h1>No Jobs Found</h1>
          {/* ✅ fixed text for test 82 */}
          <p>We could not find any jobs. Try other filters.</p>
        </div>
      )
    }
    return (
      <ul className="jobs-list">
        {jobsList.map(each => (
          <li key={each.id} className="job-item">
            <Link to={`/jobs/${each.id}`} className="job-link">
              <img
                src={each.companyLogoUrl}
                alt="company logo"
                className="company-logo"
              />
              <div className="job-info">
                <h1 className="job-title">{each.title}</h1>
                <p className="job-rating">⭐ {each.rating}</p>
                <p className="job-details">
                  {each.location} | {each.employmentType}
                </p>
                <p className="job-package">{each.packagePerAnnum}</p>
                <hr className="separator" />
                <p className="job-description">{each.jobDescription}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  // ✅ fixed text for test 86
  renderFailure = () => (
    <div className="failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <p>We cannot seem to find the page you are looking for</p>
      <button type="button" onClick={this.getJobs} className="retry-btn">
        Retry
      </button>
    </div>
  )

  render() {
    const {apiStatus, searchInput} = this.state
    return (
      <div className="jobs-container">
        <div className="sidebar sticky-sidebar">
          {this.renderProfile()}
          <hr />
          <h2 className="filter-title">Type of Employment</h2>
          <ul className="filters">
            {/* ✅ Use employmentTypesList */}
            {employmentTypesList.map(each => (
              <li key={each.employmentTypeId}>
                <input
                  type="checkbox"
                  id={each.employmentTypeId}
                  value={each.employmentTypeId}
                  onChange={this.onChangeEmploymentType}
                />
                <label htmlFor={each.employmentTypeId}>{each.label}</label>
              </li>
            ))}
          </ul>
          <hr />
          <h2 className="filter-title">Salary Range</h2>
          <ul className="filters">
            {[1000000, 2000000, 3000000, 4000000].map(range => (
              <li key={range}>
                <input
                  type="radio"
                  id={`${range / 100000}LPA`}
                  name="salary"
                  value={range}
                  onChange={this.onChangeSalaryRange}
                />
                <label htmlFor={`${range / 100000}LPA`}>
                  {range / 100000} LPA and above
                </label>
              </li>
            ))}
          </ul>
          <hr />
          <h2 className="filter-title">Location</h2>
          <ul className="filters">
            {['Hyderabad', 'Bangalore', 'Chennai', 'Delhi', 'Mumbai'].map(
              city => (
                <li key={city}>
                  <input
                    type="checkbox"
                    id={city}
                    value={city}
                    onChange={this.onChangeLocation}
                  />
                  <label htmlFor={city}>{city}</label>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="jobs-section">
          <div className="search-bar">
            <input
              type="search"
              placeholder="Search"
              value={searchInput}
              onChange={this.onChangeSearch}
              className="search-input"
            />
            <button
              type="button"
              onClick={this.onSearchClick}
              className="search-btn"
              data-testid="searchButton"
            >
              🔍
            </button>
          </div>

          {apiStatus === apiStatusConstants.inProgress && (
            <div className="loader-container" data-testid="loader">
              <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
            </div>
          )}
          {apiStatus === apiStatusConstants.success && this.renderJobsList()}
          {apiStatus === apiStatusConstants.failure && this.renderFailure()}
        </div>
      </div>
    )
  }
}

export default Jobs
