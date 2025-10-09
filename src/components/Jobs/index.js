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

class Jobs extends Component {
  state = {
    profile: {},
    jobsList: [],
    employmentType: [],
    salaryRange: '',
    searchInput: '',
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

  renderProfile = () => {
    const {profile, profileStatus} = this.state
    switch (profileStatus) {
      case apiStatusConstants.inProgress:
        return (
          <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
        )
      case apiStatusConstants.success:
        return (
          <div className="profile-card">
            <img
              src={profile.profileImageUrl}
              alt="profile"
              className="profile-img"
            />
            <h1 className="profile-name">Kumara swamy</h1>
            <p className="profile-bio">Computer Science And Engineering</p>
          </div>
        )
      case apiStatusConstants.failure:
        return (
          <button type="button" onClick={this.getProfile}>
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
          <p>We could not find any jobs. Try again with other filters.</p>
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
                <h1>{each.title}</h1>
                <p>⭐ {each.rating}</p>
                <p>
                  {each.location} | {each.employmentType}
                </p>
                <p>{each.packagePerAnnum}</p>
                <hr />
                <p>{each.jobDescription}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  renderFailure = () => (
    <div className="failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <button type="button" onClick={this.getJobs}>
        Retry
      </button>
    </div>
  )

  render() {
    const {apiStatus, searchInput} = this.state
    return (
      <div className="jobs-container">
        <div className="sidebar">
          {this.renderProfile()}
          <hr />
          <h2>Type of Employment</h2>
          <ul className="filters">
            <li>
              <input
                type="checkbox"
                id="FULLTIME"
                value="FULLTIME"
                onChange={this.onChangeEmploymentType}
              />
              <label htmlFor="FULLTIME">Full Time</label>
            </li>
            <li>
              <input
                type="checkbox"
                id="PARTTIME"
                value="PARTTIME"
                onChange={this.onChangeEmploymentType}
              />
              <label htmlFor="PARTTIME">Part Time</label>
            </li>
            <li>
              <input
                type="checkbox"
                id="FREELANCE"
                value="FREELANCE"
                onChange={this.onChangeEmploymentType}
              />
              <label htmlFor="FREELANCE">Freelance</label>
            </li>
            <li>
              <input
                type="checkbox"
                id="INTERNSHIP"
                value="INTERNSHIP"
                onChange={this.onChangeEmploymentType}
              />
              <label htmlFor="INTERNSHIP">Internship</label>
            </li>
          </ul>
          <hr />
          <h2>Salary Range</h2>
          <ul className="filters">
            <li>
              <input
                type="radio"
                id="10LPA"
                name="salary"
                value="1000000"
                onChange={this.onChangeSalaryRange}
              />
              <label htmlFor="10LPA">10 LPA and above</label>
            </li>
            <li>
              <input
                type="radio"
                id="20LPA"
                name="salary"
                value="2000000"
                onChange={this.onChangeSalaryRange}
              />
              <label htmlFor="20LPA">20 LPA and above</label>
            </li>
            <li>
              <input
                type="radio"
                id="30LPA"
                name="salary"
                value="3000000"
                onChange={this.onChangeSalaryRange}
              />
              <label htmlFor="30LPA">30 LPA and above</label>
            </li>
            <li>
              <input
                type="radio"
                id="40LPA"
                name="salary"
                value="4000000"
                onChange={this.onChangeSalaryRange}
              />
              <label htmlFor="40LPA">40 LPA and above</label>
            </li>
          </ul>
        </div>

        <div className="jobs-section">
          <div className="search-bar">
            <input
              type="search"
              placeholder="Search jobs"
              value={searchInput}
              onChange={this.onChangeSearch}
            />
            <button type="button" onClick={this.onSearchClick}>
              🔍
            </button>
          </div>

          {apiStatus === apiStatusConstants.inProgress && (
            <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
          )}
          {apiStatus === apiStatusConstants.success && this.renderJobsList()}
          {apiStatus === apiStatusConstants.failure && this.renderFailure()}
        </div>
      </div>
    )
  }
}

export default Jobs
