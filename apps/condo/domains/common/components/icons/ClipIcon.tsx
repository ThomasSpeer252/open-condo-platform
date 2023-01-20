import Icon from '@ant-design/icons'
import React from 'react'

const ClipIconSVG = () => (
    <svg width='21' height='22' viewBox='0 0 21 22' fill='none' xmlns='http://www.w3.org/2000/svg'>
        <rect width='21' height='21' transform='translate(0 0.5)' fill='none'/>
        <path d='M10.236 19.75C12.9838 19.75 15.25 17.4458 15.25 14.5875V8.75417C15.25 8.34583 14.9384 8.025 14.5418 8.025C14.1452 8.025 13.8336 8.34583 13.8336 8.75417V14.6167C13.8336 16.6292 12.2189 18.2917 10.236 18.2917C8.25302 18.2917 6.63833 16.6292 6.63833 14.5875V6.21667C6.63833 4.81667 7.74311 3.70833 9.07452 3.70833C10.4343 3.70833 11.5107 4.84583 11.5107 6.21667V14.3542C11.5107 15.0833 10.9442 15.6958 10.2076 15.6958C9.47111 15.6958 8.90456 15.1125 8.90456 14.3542V8.75417C8.90456 8.34583 8.59295 8.025 8.19636 8.025C7.79977 8.025 7.48816 8.34583 7.48816 8.75417V14.3542C7.48816 15.9 8.70626 17.1542 10.2076 17.1542C11.709 17.1542 12.9271 15.9 12.9271 14.3542V6.21667C12.9554 4.02917 11.2274 2.25 9.10285 2.25C6.97826 2.25 5.25026 4.02917 5.25026 6.21667V14.5875C5.22193 17.4458 7.48816 19.75 10.236 19.75Z' fill='#82879F'/>
    </svg>
)

export const ClipIcon: React.FC = (props) => {
    return (
        <Icon component={ClipIconSVG} {...props}/>
    )
}