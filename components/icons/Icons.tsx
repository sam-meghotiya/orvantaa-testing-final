








import React from 'react';

const IconWrapper: React.FC<{ children: React.ReactNode, width?: number, height?: number, className?: string, style?: React.CSSProperties }> = ({ children, width=20, height=20, className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        {children}
    </svg>
);

const FilledIconWrapper: React.FC<{ children: React.ReactNode, width?: number, height?: number, className?: string, style?: React.CSSProperties }> = ({ children, width=24, height=24, className, style }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
        {children}
    </svg>
);

interface CategoryIconProps {
  width?: number;
  height?: number;
}
interface IconProps {
  className?: string;
  style?: React.CSSProperties;
}


export const MicIcon = () => <IconWrapper><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line></IconWrapper>;
export const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="m4 12 1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>
    </svg>
);
export const ShuffleIcon = () => <IconWrapper><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="16 21 21 21 21 16"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></IconWrapper>;
export const SunIcon = () => <IconWrapper><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></IconWrapper>;
export const MoonIcon = () => <IconWrapper><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></IconWrapper>;
export const OracleIcon = () => <IconWrapper width={24} height={24}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></IconWrapper>;
export const ExploreIcon = () => <IconWrapper><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></IconWrapper>;
export const HistoryIcon: React.FC<CategoryIconProps> = ({ width, height }) => (
    <IconWrapper width={width} height={height}>
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
    </IconWrapper>
);
export const QuoteIcon = () => <IconWrapper><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8Z"></path><path d="M14 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v6c0 7 4 8 7 8Z"></path></IconWrapper>;
export const CloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
export const TrendingUpIcon: React.FC<CategoryIconProps> = ({ width = 20, height = 20 }) => <IconWrapper width={width} height={height}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></IconWrapper>;
export const TrendingDownIcon: React.FC<CategoryIconProps> = ({ width = 20, height = 20 }) => <IconWrapper width={width} height={height}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></IconWrapper>;
export const RefreshIcon: React.FC<IconProps> = ({ className, style }) => <IconWrapper className={className} style={style}><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 4"></path></IconWrapper>;
export const TrashIcon = () => <IconWrapper><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></IconWrapper>;
export const LoadIcon = () => <IconWrapper><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></IconWrapper>;
export const SearchIcon = () => <IconWrapper><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></IconWrapper>;
export const AiSparkleIcon: React.FC<CategoryIconProps> = ({ width, height }) => <IconWrapper width={width} height={height}><path d="M12 3L9.5 8.5 4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z"></path><path d="M5 3v4"></path><path d="M19 3v4"></path><path d="M3 5h4"></path><path d="M17 5h4"></path></IconWrapper>;
export const PlusIcon = () => <IconWrapper><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></IconWrapper>;
export const SettingsIcon = () => <IconWrapper><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></IconWrapper>;
export const BookOpenIcon: React.FC<CategoryIconProps> = ({ width = 24, height = 24 }) => <IconWrapper width={width} height={height}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></IconWrapper>;
export const CompassIcon: React.FC<CategoryIconProps> = ({ width = 24, height = 24 }) => <IconWrapper width={width} height={height}><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></IconWrapper>;
export const UserIcon = () => <IconWrapper width={24} height={24}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></IconWrapper>;
export const WomanIcon: React.FC<IconProps> = ({ className, style }) => <IconWrapper width={24} height={24} className={className} style={style}><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 00-16 0"/></IconWrapper>;
export const LockIcon = () => <IconWrapper><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></IconWrapper>;
export const HomeIcon = () => <IconWrapper width={24} height={24}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path><path d="M9 22V12h6v10"></path></IconWrapper>;
export const QuizzesIcon = () => <IconWrapper width={24} height={24}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="m9 14 2 2 4-4"></path></IconWrapper>;
export const SubjectsIcon = () => <IconWrapper width={24} height={24}><rect width="7" height="7" x="3" y="3" rx="1"></rect><rect width="7" height="7" x="14" y="3" rx="1"></rect><rect width="7" height="7" x="3" y="14" rx="1"></rect><rect width="7" height="7" x="14" y="14" rx="1"></rect></IconWrapper>;
export const ProfileIcon = UserIcon;
export const CheckCircleIcon = () => <IconWrapper><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></IconWrapper>;
export const XCircleIcon = () => <IconWrapper><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></IconWrapper>;
export const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);
export const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
);
export const PencilIcon: React.FC<CategoryIconProps> = ({ width = 20, height = 20 }) => <IconWrapper width={width} height={height}><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></IconWrapper>;
export const ClockIcon: React.FC<CategoryIconProps> = ({ width = 20, height = 20 }) => <IconWrapper width={width} height={height}><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></IconWrapper>;
export const PlayCircleIcon: React.FC<{isLocked?: boolean}> = ({ isLocked }) => <IconWrapper><circle cx="12" cy="12" r="10"></circle>{isLocked ? <><path d="M10 12H7a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-3"></path><path d="M17 9V7a5 5 0 0 0-10 0v2"></path></> : <polygon points="10 8 16 12 10 16 10 8"></polygon>}</IconWrapper>;
export const FilterIcon = () => <IconWrapper width={24} height={24}><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="2" y1="14" x2="6" y2="14"></line><line x1="10" y1="8" x2="14" y2="8"></line><line x1="18" y1="16" x2="22" y2="16"></line></IconWrapper>;
export const StopCircleIcon: React.FC<IconProps> = ({ className, style }) => <IconWrapper width={24} height={24} className={className} style={style}><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></IconWrapper>;
export const CameraIcon = () => <IconWrapper><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></IconWrapper>;
export const ImageIcon = () => <IconWrapper><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></IconWrapper>;
export const GlobeIcon = () => <IconWrapper><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></IconWrapper>;
export const FlameIcon: React.FC<CategoryIconProps> = ({ width = 20, height = 20 }) => <IconWrapper width={width} height={height}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></IconWrapper>;
export const BrainCircuitIcon: React.FC<CategoryIconProps> = ({ width = 20, height = 20 }) => <IconWrapper width={width} height={height}><path d="M12 2a4.5 4.5 0 0 0-4.5 4.5v.462a4.5 4.5 0 0 0-1.5 3.038v5.5a4.5 4.5 0 0 0 1.5 3.038v.462A4.5 4.5 0 0 0 12 22a4.5 4.5 0 0 0 4.5-4.5v-.462a4.5 4.5 0 0 0 1.5-3.038v-5.5a4.5 4.5 0 0 0-1.5-3.038V6.5A4.5 4.5 0 0 0 12 2z"/><path d="M12 2v20"/><path d="M12 12h-4"/><path d="M12 16h-4"/><path d="M12 8h-4"/><path d="M12 12h4"/><path d="M12 16h4"/><path d="M12 8h4"/></IconWrapper>;
export const BookmarkIcon: React.FC<CategoryIconProps> = ({ width = 20, height = 20 }) => <IconWrapper width={width} height={height}><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></IconWrapper>;
export const CheckIcon = () => <IconWrapper><polyline points="20 6 9 17 4 12"></polyline></IconWrapper>;
export const MenuIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M4 16H20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
);

export const SoundWaveIcon = () => (
    <IconWrapper width={24} height={24} strokeWidth="2.5">
        <path d="M8 10v4" />
        <path d="M12 8v8" />
        <path d="M16 6v12" />
    </IconWrapper>
);

export const CollectionIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="rotate(10 16 7)">
            <rect x="9" y="1" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        </g>
        <g transform="rotate(-10 8 17)">
            <rect x="1" y="11" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.5"/>
        </g>
    </svg>
);

export const ListBulletIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"></line>
        <line x1="8" y1="12" x2="21" y2="12"></line>
        <line x1="8" y1="18" x2="21" y2="18"></line>
        <line x1="3" y1="6" x2="3.01" y2="6"></line>
        <line x1="3" y1="12" x2="3.01" y2="12"></line>
        <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
);


// Fallback Category Icons
export const KnowledgeIcon: React.FC<CategoryIconProps> = ({ width = 48, height = 48 }) => <IconWrapper width={width} height={height}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></IconWrapper>;
export const ScienceIcon: React.FC<CategoryIconProps> = ({ width = 48, height = 48 }) => <IconWrapper width={width} height={height}><path d="M12 2a10 10 0 0 0-2.24 19.51 10 10 0 0 0 4.48 0A10 10 0 0 0 12 2z"></path><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"></path></IconWrapper>;
export const TechIcon: React.FC<CategoryIconProps> = ({ width = 48, height = 48 }) => <IconWrapper width={width} height={height}><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></IconWrapper>;
export const ArtIcon: React.FC<CategoryIconProps> = ({ width = 48, height = 48 }) => <IconWrapper width={width} height={height}><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></IconWrapper>;
export const CultureIcon: React.FC<CategoryIconProps> = ({ width = 48, height = 48 }) => <IconWrapper width={width} height={height}><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20z"></path><path d="M2 12h20"></path></IconWrapper>;
export const NatureIcon: React.FC<CategoryIconProps> = ({ width = 48, height = 48 }) => <IconWrapper width={width} height={height}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></IconWrapper>;
export const BusinessIcon: React.FC<CategoryIconProps> = ({ width = 48, height = 48 }) => <IconWrapper width={width} height={height}><line x1="12" x2="12" y1="20" y2="10"></line><line x1="18" x2="18" y1="20" y2="4"></line><line x1="6" x2="6" y1="20" y2="16"></line></IconWrapper>;
export const PhilosophyIcon: React.FC<CategoryIconProps> = ({ width = 48, height = 48 }) => <IconWrapper width={width} height={height}><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></IconWrapper>;

// --- Filled Icons for Nav Bar ---
export const HomeIconFilled = () => <FilledIconWrapper width={24} height={24}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/><path d="M9 22V12h6v10"/></FilledIconWrapper>;
export const QuizzesIconFilled = () => <FilledIconWrapper width={24} height={24}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="m9 14 2 2 4-4"/></FilledIconWrapper>;
export const SubjectsIconFilled = () => <FilledIconWrapper width={24} height={24}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></FilledIconWrapper>;
export const UserIconFilled = () => <FilledIconWrapper width={24} height={24}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></FilledIconWrapper>;
export const OracleIconFilled = () => <FilledIconWrapper width={24} height={24}><path d="M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm0,15a5,5,0,1,1,5-5A5,5,0,0,1,12,17Z"/></FilledIconWrapper>;
export const ProfileIconFilled = UserIconFilled;