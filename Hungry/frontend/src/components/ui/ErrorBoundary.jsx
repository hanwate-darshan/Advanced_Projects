import React from 'react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: "" }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || String(error) }
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info)
  }

  handleReset = () => {
    this.setState({ hasError: false, message: "" })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='min-h-screen w-full bg-blinkit-bg flex items-center justify-center p-6'>
          <div className='bg-white border border-blinkit-border-light rounded-3xl shadow-card max-w-md w-full p-8 text-center'>
            <div className='w-14 h-14 rounded-2xl bg-blinkit-green-soft grid place-items-center mx-auto mb-4'>
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#C7350B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            </div>
            <h1 className='font-display text-xl font-bold text-blinkit-text mb-2'>Something went wrong</h1>
            <p className='text-sm text-blinkit-text-muted mb-6 break-words'>{this.state.message}</p>
            <button className='btn btn-primary w-full' onClick={this.handleReset}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
