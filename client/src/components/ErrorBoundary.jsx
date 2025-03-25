import { Component } from "react"
import { Snackbar } from "@mui/material"
import { Alert } from "@mui/material"

import PropTypes from "prop-types"

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      errorMessage: ""
    }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.toString() }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by error boundary:", error, errorInfo)
  }

  handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return
    }
    this.setState({ hasError: false, errorMessage: "" })
  }

  render() {
    if (this.state.hasError) {
      return (
        <Snackbar
          open={this.state.hasError}
          autoHideDuration={6000}
          onClose={this.handleClose}
        >
          <Alert onClose={this.handleClose} severity="error">
            {this.state.errorMessage}
          </Alert>
        </Snackbar>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
}

export default ErrorBoundary
