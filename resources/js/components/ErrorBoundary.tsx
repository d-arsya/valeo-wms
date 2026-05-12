import React from 'react'

type Props = { children: React.ReactNode }

type State = { hasError: boolean }

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="font-semibold text-red-700">Scanner failed to load.</p>
          <p className="text-sm text-red-600">Try reloading the page or use the manual simulator below.</p>
        </div>
      )
    }

    return this.props.children
  }
}
