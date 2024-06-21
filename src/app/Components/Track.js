import React from 'react'

const filesContext = require.context('@/Tracks', false, /\.js$/)

const modules = filesContext.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^.+\/([^/]+)\.js/, '$1')
  const mod = filesContext(modulePath).default
  modules[moduleName] = mod
  return modules;
}, {})

export default function Track(props) {
	const Component = modules[props.componentName]
  return <Component {...props}/>
}