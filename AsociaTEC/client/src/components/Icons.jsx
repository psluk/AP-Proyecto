import React from "react";

export function EventIcon(props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M7 2a1 1 0 00-1 1v1.001c-.961.014-1.34.129-1.721.333a2.272 2.272 0 00-.945.945C3.116 5.686 3 6.09 3 7.205v10.59c0 1.114.116 1.519.334 1.926.218.407.538.727.945.945.407.218.811.334 1.926.334h11.59c1.114 0 1.519-.116 1.926-.334.407-.218.727-.538.945-.945.218-.407.334-.811.334-1.926V7.205c0-1.115-.116-1.519-.334-1.926a2.272 2.272 0 00-.945-.945C19.34 4.13 18.961 4.015 18 4V3a1 1 0 10-2 0v1H8V3a1 1 0 00-1-1zM5 9v8.795c0 .427.019.694.049.849.012.06.017.074.049.134a.275.275 0 00.124.125c.06.031.073.036.134.048.155.03.422.049.849.049h11.59c.427 0 .694-.019.849-.049a.353.353 0 00.134-.049.275.275 0 00.125-.124.353.353 0 00.048-.134c.03-.155.049-.422.049-.849L19.004 9H5zm8.75 4a.75.75 0 00-.75.75v2.5c0 .414.336.75.75.75h2.5a.75.75 0 00.75-.75v-2.5a.75.75 0 00-.75-.75h-2.5z"
                fill="currentColor"
            />
        </svg>
    )
}

export function ConfirmEventIcon(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M16.53 11.06L15.47 10l-4.88 4.88-2.12-2.12-1.06 1.06L10.59 17l5.94-5.94zM19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"
                fill="currentColor" />
        </svg>
    )
}

export function CancelEventIcon(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            {...props}
        >
            <path d="M0 0h24v24H0z" fill="none" />
            <path
                fill="currentColor"
                d="M9.31 17l2.44-2.44L14.19 17l1.06-1.06-2.44-2.44 2.44-2.44L14.19 10l-2.44 2.44L9.31 10l-1.06 1.06 2.44 2.44-2.44 2.44L9.31 17zM19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19a2 2 0 002 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z" />
        </svg>
    )
}

export function QRIcon(props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M23 4a3 3 0 00-3-3h-4a1 1 0 100 2h4a1 1 0 011 1v4a1 1 0 102 0V4zM23 16a1 1 0 10-2 0v4a1 1 0 01-1 1h-4a1 1 0 100 2h4a3 3 0 003-3v-4zM4 21a1 1 0 01-1-1v-4a1 1 0 10-2 0v4a3 3 0 003 3h4a1 1 0 100-2H4zM1 8a1 1 0 002 0V4a1 1 0 011-1h4a1 1 0 000-2H4a3 3 0 00-3 3v4z"
                fill="currentColor"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M11 6a1 1 0 00-1-1H6a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V6zM9 7.5a.5.5 0 00-.5-.5h-1a.5.5 0 00-.5.5v1a.5.5 0 00.5.5h1a.5.5 0 00.5-.5v-1zM18 13a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4a1 1 0 011-1h4zm-3 2.5a.5.5 0 01.5-.5h1a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-1z"
                fill="#currentColor"
            />
            <path
                d="M14 5a1 1 0 100 2h2.5a.5.5 0 01.5.5V10a1 1 0 102 0V6a1 1 0 00-1-1h-4z"
                fill="currentColor"
            />
            <path
                d="M14 8a1 1 0 00-1 1v1a1 1 0 102 0V9a1 1 0 00-1-1zM6 13a1 1 0 00-1 1v2a1 1 0 102 0v-.5a.5.5 0 01.5-.5H10a1 1 0 100-2H6zM10 17a1 1 0 100 2 1 1 0 000-2z"
                fill="currentColor"
            />
        </svg>
    )
}

export function ClockIcon(props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                d="M12 7v5l2.5-1.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export function ClockWithXIcon(props) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
      >
        <path
          d="M3 5.5l2-2m16 2l-2-2m-10 6l6 6m0-6l-6 6m11-3a8 8 0 11-16 0 8 8 0 0116 0z"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }