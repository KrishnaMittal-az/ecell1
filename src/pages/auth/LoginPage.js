import React, { useState } from 'react'
import { useTaskManagement } from '../../contexts/TaskManagementContext'

const LoginPage = () => {
  const { signIn, signUp } = useTaskManagement()
  const [isSignUp, setIsSignUp] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    year: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        if (!formData.name || !formData.year) {
          throw new Error('Name and year are required for sign up')
        }
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.name,
          formData.year
        )
        if (error) throw error
        setError('Account created successfully! Please check your email to verify your account.')
      } else {
        const { error } = await signIn(formData.email, formData.password)
        if (error) throw error
      }
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow-lg mt-5">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="card-title">
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </h2>
                <p className="text-muted">
                  E-Cell Task Management System
                </p>
              </div>

              {error && (
                <div className={`alert ${error.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {isSignUp && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required={isSignUp}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="year" className="form-label">
                        Year of Study
                      </label>
                      <select
                        className="form-select"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required={isSignUp}
                      >
                        <option value="">Select your year</option>
                        <option value="1st">1st Year</option>
                        <option value="2nd">2nd Year</option>
                        <option value="3rd">3rd Year</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    minLength={6}
                  />
                  {isSignUp && (
                    <small className="form-text text-muted">
                      Password must be at least 6 characters long
                    </small>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 mb-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    className="btn btn-link text-decoration-none"
                    onClick={() => {
                      setIsSignUp(!isSignUp)
                      setError('')
                      setFormData({
                        email: '',
                        password: '',
                        name: '',
                        year: ''
                      })
                    }}
                  >
                    {isSignUp 
                      ? 'Already have an account? Sign In' 
                      : "Don't have an account? Sign Up"
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="card mt-3">
            <div className="card-body">
              <h6 className="card-title">Demo Credentials</h6>
              <div className="row">
                <div className="col-4">
                  <small className="text-muted d-block">3rd Year</small>
                  <small>demo3@ecell.com</small>
                </div>
                <div className="col-4">
                  <small className="text-muted d-block">2nd Year</small>
                  <small>demo2@ecell.com</small>
                </div>
                <div className="col-4">
                  <small className="text-muted d-block">1st Year</small>
                  <small>demo1@ecell.com</small>
                </div>
              </div>
              <small className="text-muted d-block mt-2">Password for all: password123</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage