import React from 'react';

export default class PanelErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError:false, error:null };
  }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(error, info){ if (process.env.NODE_ENV !== 'production') console.error('Panel error', error, info); }
  render(){
    if (this.state.hasError){
      return (
        <div className="p-4 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700 rounded" role="alert" aria-live="assertive">
          <p className="text-sm font-semibold text-red-700 dark:text-red-300">Panel failed to load.</p>
          <button onClick={()=>this.setState({hasError:false,error:null})} className="mt-2 text-xs text-red-600 underline">Retry</button>
        </div>
      );
    }
    return this.props.children;
  }
}