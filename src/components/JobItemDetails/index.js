import {Component} from 'react'
import {Redirect} from 'react-router-dom'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  inProgress: 'IN_PROGRESS',
  success: 'SUCCESS',
  failure: 'FAILURE',
}

class JobItemDetails extends Component {
  state = {
    jobDetails: {},
    skills: [],
    lifeAtCompany: {},
    similarJobs: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const jwtToken = Cookies.get('jwt_token')
    const {match} = this.props
    const {id} = match.params
    const url = `https://apis.ccbp.in/jobs/${id}`

    const options = {
      headers: {Authorization: `Bearer ${jwtToken}`},
      method: 'GET',
    }

    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const job = data.job_details
      const updatedJob = {
        id: job.id,
        title: job.title,
        rating: job.rating,
        companyLogoUrl: job.company_logo_url,
        location: job.location,
        employmentType: job.employment_type,
        packagePerAnnum: job.package_per_annum,
        jobDescription: job.job_description,
        companyWebsiteUrl: job.company_website_url,
      }
      const updatedSkills = job.skills.map(each => ({
        name: each.name,
        imageUrl: each.image_url,
      }))
      const updatedLifeAtCompany = {
        description: job.life_at_company.description,
        imageUrl: job.life_at_company.image_url,
      }
      const updatedSimilarJobs = data.similar_jobs.map(each => ({
        id: each.id,
        title: each.title,
        rating: each.rating,
        companyLogoUrl: each.company_logo_url,
        location: each.location,
        employmentType: each.employment_type,
        jobDescription: each.job_description,
      }))

      this.setState({
        jobDetails: updatedJob,
        skills: updatedSkills,
        lifeAtCompany: updatedLifeAtCompany,
        similarJobs: updatedSimilarJobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderJobDetailsView = () => {
    const {jobDetails, skills, lifeAtCompany, similarJobs} = this.state
    return (
      <div className="job-details-container">
        <div className="jobs">
          <div className="job-header">
            <img
              src={jobDetails.companyLogoUrl}
              alt="job details company logo"
              className="company-logo-details"
            />
            <h1 className="job-title">{jobDetails.title}</h1>
            <p className="rating">⭐ {jobDetails.rating}</p>
          </div>

          <div className="job-meta">
            <p>{jobDetails.location}</p>
            <p>{jobDetails.employmentType}</p>
            <p>{jobDetails.packagePerAnnum}</p>
          </div>

          <hr className="separator" />

          <div className="job-description-section">
            <h1>Description</h1>
            <p className="job-description">{jobDetails.jobDescription}</p>
            <a
              href={jobDetails.companyWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="visit-link"
            >
              Visit
            </a>
          </div>

          <div className="skills-section">
            <h1>Skills</h1>
            <ul className="skills-list">
              {skills.map(each => (
                <li key={each.name} className="skill-item">
                  <img
                    src={each.imageUrl}
                    alt={each.name}
                    className="skill-icon"
                  />
                  <p>{each.name}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="life-at-company">
            <h1>Life at Company</h1>
            <div className="life-content">
              <p>{lifeAtCompany.description}</p>
              <img
                src={lifeAtCompany.imageUrl}
                alt="life at company"
                className="life-img"
              />
            </div>
          </div>
        </div>
        <h1>Similar Jobs</h1>
        <ul className="similar-jobs-list">
          {similarJobs.map(job => (
            <li key={job.id} className="similar-job-item">
              <img
                src={job.companyLogoUrl}
                alt="similar job company logo"
                className="company-logo-details"
              />
              <h1>{job.title}</h1>
              <p>⭐ {job.rating}</p>
              <p>{job.location}</p>
              <p>{job.employmentType}</p>
              <h1>Description</h1>
              <p>{job.jobDescription}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderLoadingView = () => (
    <div className="loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
    </div>
  )

  renderFailureView = () => (
    <div className="failure-container">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <p>We cannot seem to find the page you are looking for</p>
      <button type="button" onClick={this.getJobDetails}>
        Retry
      </button>
    </div>
  )

  render() {
    const {apiStatus} = this.state
    const jwtToken = Cookies.get('jwt_token')
    if (jwtToken === undefined) {
      return <Redirect to="/login" />
    }

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      case apiStatusConstants.success:
        return this.renderJobDetailsView()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      default:
        return null
    }
  }
}

export default JobItemDetails
