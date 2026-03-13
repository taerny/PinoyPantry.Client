import React, { useState } from 'react'

export function ImageWithFallback(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, style, className, ...rest } = props

  // Empty or missing src → show placeholder immediately, no network request
  const [didError, setDidError] = useState(!src)

  if (didError) {
    // absolute inset-0 fills the parent container reliably regardless of
    // how the parent's height was defined (aspect-ratio, fixed px, etc.)
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-10 h-10 mb-1 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1}
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path strokeLinecap="round" d="m21 15-5-5L5 21" />
        </svg>
        <span className="text-[11px] text-gray-400 font-medium">No Image</span>
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      {...rest}
      onError={() => setDidError(true)}
    />
  )
}
