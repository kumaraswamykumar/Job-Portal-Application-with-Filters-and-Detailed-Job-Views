import {Component} from 'react'
import Cookies from 'js-cookie'
import Loader from 'react-loader-spinner'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class JobItemDetails extends Component {
  state = {
    jobDetails: null,
    similarJobs: [],
    apiStatus: apiStatusConstants.initial,
  }

  componentDidMount() {
    this.getJobDetails()
  }

  getJobDetails = async () => {
    this.setState({apiStatus: apiStatusConstants.inProgress})
    const {match} = this.props
    const {id} = match.params
    const jwtToken = Cookies.get('jwt_token')
    const url = `https://apis.ccbp.in/jobs/${id}`
    const options = {headers: {Authorization: `Bearer ${jwtToken}`}}
    const response = await fetch(url, options)
    if (response.ok) {
      const data = await response.json()
      const job = data.job_details
      const updatedJob = {
        id: job.id,
        title: job.title,
        rating: job.rating,
        companyLogoUrl: job.company_logo_url,
        employmentType: job.employment_type,
        location: job.location,
        packagePerAnnum: job.package_per_annum,
        jobDescription: job.job_description,
        companyWebsiteUrl: job.company_website_url,
        skills: job.skills,
        lifeAtCompany: job.life_at_company,
      }
      this.setState({
        jobDetails: updatedJob,
        similarJobs: data.similar_jobs,
        apiStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({apiStatus: apiStatusConstants.failure})
    }
  }

  renderSuccess = () => {
    const {jobDetails, similarJobs} = this.state
    const {
      title,
      rating,
      companyLogoUrl,
      employmentType,
      location,
      packagePerAnnum,
      jobDescription,
      companyWebsiteUrl,
      skills,
      lifeAtCompany,
    } = jobDetails

    return (
      <div className="job-details-container">
        <div className="job-header">
          <img src={companyLogoUrl} alt="job details company logo" />
          <div>
            <h1>{title}</h1>
            <p>⭐ {rating}</p>
            <p>{location}</p>
            <p>{employmentType}</p>
            <p>{packagePerAnnum}</p>
          </div>
        </div>

        <hr className="section-hr" />

        <h2>Description</h2>
        <p>{jobDescription}</p>
        <a href={companyWebsiteUrl} target="_blank" rel="noreferrer">
          Visit Company Website
        </a>

        <hr className="section-hr" />

        <h2>Skills</h2>
        <ul className="skills-list">
          {skills.map(skill => (
            <li key={skill.name} className="skill-item">
              <img src={skill.image_url} alt={skill.name} />
              <p>{skill.name}</p>
            </li>
          ))}
        </ul>

        <hr className="section-hr" />

        <h2>Life at Company</h2>
        <p>{lifeAtCompany.description}</p>
        <img
          src={lifeAtCompany.image_url}
          alt="life at company"
          className="life-image"
        />

        <hr className="section-hr" />

        <h2>Similar Jobs</h2>
        <ul className="similar-jobs">
          {similarJobs.map(job => (
            <li key={job.id} className="similar-job-item">
              <img src={job.company_logo_url} alt="similar job company logo" />
              <h3>{job.title}</h3>
              <p>⭐ {job.rating}</p>
              <p>{job.location}</p>
              <p>{job.employment_type}</p>
              <p>{job.job_description}</p>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  renderFailure = () => (
    <div className="failure-view">
      <img
        src="https://assets.ccbp.in/frontend/react-js/failure-img.png"
        alt="failure view"
      />
      <h1>Oops! Something Went Wrong</h1>
      <p>We cannot seem to find the job details you are looking for</p>
      <button type="button" onClick={this.getJobDetails}>
        Retry
      </button>
    </div>
  )

  render() {
    const {apiStatus} = this.state
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return (
          <Loader type="ThreeDots" color="#ffffff" height={50} width={50} />
        )
      case apiStatusConstants.success:
        return this.renderSuccess()
      case apiStatusConstants.failure:
        return this.renderFailure()
      default:
        return null
    }
  }
}

export default JobItemDetails
