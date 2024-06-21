import Portal from '@/Components/Portal'

import { getAllData } from '@/utils'

import '@/static/styles/main.css'

export default async function Page({ params }) {
  const data = await getData()
  return (
    <Portal track={null} data={data}/>
  )
}

async function getData() {
  const res = await getAllData()
  // console.log(res)
  return res
}