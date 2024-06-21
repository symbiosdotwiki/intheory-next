import React from 'react'

const filesContext = require.context('@/Tracks', false, /\.js$/)

const modules = filesContext.keys().reduce((modules, modulePath) => {
  const moduleName = modulePath.replace(/^.+\/([^/]+)\.js/, '$1')
  const moduleDef = filesContext(modulePath).default
  modules[moduleName] = moduleDef
  return modules;
}, {})

export default function Track(props) {
	const Component = modules[props.componentName]
  return <Component {...props}/>
}