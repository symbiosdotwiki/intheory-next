import Portal from '@/Components/Portal'

import { getAllData } from '@/utils'

import { TRACKLIST } from 'portal.config.js'

export async function generateStaticParams() {
  return TRACKLIST.map((track) => ({
    id: track.id.toString(),
  }))
}

export default async function Page({ params }) {
  const data = await getData()
  const { id } = params
  return (
    <Portal track={params.id-1} data={data}/>
  )
}

async function getData() {
  const res = await getAllData()
  // console.log(res)
  return res
}