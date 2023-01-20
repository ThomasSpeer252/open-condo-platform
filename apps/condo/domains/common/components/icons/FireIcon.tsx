import Icon from '@ant-design/icons'
import React from 'react'

const FireIconSVG = ({ width = 20, height = 20 }) => {
    return (
        <svg width={width} height={height} viewBox='0 0 24 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
            <path d='M16.55 9.998a8.144 8.144 0 00-1.944-2.7l-.682-.626a.189.189 0 00-.304.077l-.305.874c-.19.549-.54 1.109-1.034 1.66a.146.146 0 01-.096.047.13.13 0 01-.1-.036.138.138 0 01-.048-.112c.087-1.41-.335-3.002-1.258-4.734-.764-1.44-1.826-2.562-3.152-3.345l-.968-.57a.188.188 0 00-.282.172L6.43 1.83c.035.768-.054 1.448-.265 2.013a6.684 6.684 0 01-1.101 1.91c-.33.4-.703.763-1.114 1.08A8.264 8.264 0 001.6 9.682a8.15 8.15 0 00-.2 6.804 8.234 8.234 0 004.392 4.35A8.246 8.246 0 009 21.477a8.288 8.288 0 003.209-.64 8.17 8.17 0 002.622-1.75A8.115 8.115 0 0017.25 13.3a8.067 8.067 0 00-.7-3.302z' fill='currentColor'/>
        </svg>
    )
}

export const FireIcon: React.FC = (props) => {
    return (
        <Icon component={FireIconSVG} {...props}/>
    )
}