import { NextResponse } from 'next/server'

export function middleware(req) {
  console.log(req)
  if (req.nextUrl.href.includes('/_next')) {
    return NextResponse.rewrite(
      req.nextUrl.href.replace('/_next', '/static/_next'),
    )
  }

  return NextResponse.next()
}