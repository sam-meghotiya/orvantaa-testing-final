

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, getUser, updateUser, getAvailableClasses, getAvailableGoals, subscribe } from '../services/userService.ts';
import { UserIcon, PencilIcon, ChevronRightIcon, SearchIcon, CheckIcon, CloseIcon, CameraIcon } from './icons/Icons.tsx';

// --- Reusable Components ---

const SettingsListItem: React.FC<{
    label: string;
    value?: string;
    isEditable?: boolean;
    isEditing?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
    name?: string;
    placeholder?: string;
}> = ({ label, value, isEditable = false, isEditing = false, onChange, onClick, name, placeholder }) => {
    const canClick = onClick;
    
    return (
        <div 
            className={`flex items-center justify-between w-full h-12 px-4 ${canClick ? 'cursor-pointer' : ''}`}
            onClick={canClick ? onClick : undefined}
        >
            <label htmlFor={name} className="text-[var(--text-secondary)] text-base">{label}</label>
            {label === 'Name' && isEditing ? (
                <input
                    type="text" name={name} id={name} value={value} onChange={onChange}
                    placeholder={placeholder}
                    className="text-right bg-transparent text-white w-2/3 outline-none focus:ring-1 focus:ring-blue-500 rounded-md px-2 py-1 -mr-2 placeholder:text-gray-500"
                    autoComplete="off"
                />
            ) : (
                <div className="flex items-center gap-2">
                    <span className={`text-base truncate ${!value ? 'text-gray-500' : 'text-white'}`}>
                        {value || placeholder}
                    </span>
                    {onClick && <ChevronRightIcon />}
                </div>
            )}
        </div>
    );
};

// --- Selection Modal Component ---

interface SelectionModalProps {
    title: string;
    options: string[];
    selectedValue: string;
    onClose: () => void;
    onSelect: (value: string) => void;
    isSearchable?: boolean;
}

const SelectionModal: React.FC<SelectionModalProps> = ({ title, options, selectedValue, onClose, onSelect, isSearchable = false }) => {
    const [internalSelection, setInternalSelection] = useState(selectedValue);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = useMemo(() => {
        if (!isSearchable || !searchTerm) return options;
        return options.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [options, searchTerm, isSearchable]);

    const handleDone = () => {
        onSelect(internalSelection);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in-fast" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative z-10 w-full max-w-md m-4 bg-[var(--bg-tertiary)] rounded-2xl shadow-lg flex flex-col max-h-[80vh]">
                <header className="flex items-center justify-between p-4 border-b border-[var(--border-secondary)]">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button onClick={handleDone} className="font-semibold text-[var(--accent-blue)]">Done</button>
                </header>
                
                {isSearchable && (
                    <div className="p-2 border-b border-[var(--border-secondary)]">
                         <div className="relative">
                            <input
                              type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                              placeholder="Search..."
                              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all text-white"
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"><SearchIcon /></div>
                        </div>
                    </div>
                )}
                
                <div className="flex-grow overflow-y-auto no-scrollbar p-2">
                    <div className="flex flex-col gap-1">
                        {filteredOptions.map(option => (
                            <button
                                key={option}
                                onClick={() => setInternalSelection(option)}
                                className={`flex items-center justify-between w-full text-left p-3 rounded-lg transition-colors ${internalSelection === option ? 'bg-white/10 text-white' : 'text-[var(--text-secondary)] hover:bg-white/5'}`}
                            >
                                <span>{option}</span>
                                {internalSelection === option && <CheckIcon />}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main Profile View Component ---

type ModalType = 'class' | 'goal' | null;

export const ProfileView: React.FC = () => {
    const [user, setUser] = useState<User>(() => getUser());
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<User>(user);
    const [activeModal, setActiveModal] = useState<ModalType>(null);
    
    const [classOptions, setClassOptions] = useState<string[]>([]);
    const [goalOptions, setGoalOptions] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Subscribe to user changes
        const unsubscribe = subscribe(setUser);
        
        // Check if it's the user's first time and auto-open edit mode
        if (!getUser().isInitialSetupComplete) {
            setIsEditing(true);
        }

        // Load static options for modals
        setClassOptions(getAvailableClasses());
        setGoalOptions(getAvailableGoals());
        
        // Cleanup subscription on component unmount
        return () => unsubscribe();
    }, []);

    // This effect syncs the form data with the global user state when not editing.
    useEffect(() => {
        if (!isEditing) {
            setFormData(user);
        }
    }, [user, isEditing]);
    
    const isHighSchool = useMemo(() => formData.class.includes('11th') || formData.class.includes('12th'), [formData.class]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, profileImageUrl: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSelectionChange = (field: 'class' | 'goal', value: string) => {
        if (field === 'class') {
            const isNewSelectionHighSchool = value.includes('11th') || value.includes('12th');
            if (!isNewSelectionHighSchool) {
                // If changing to a lower class, auto-set goal
                setFormData(prev => ({ ...prev, class: value, goal: "School / Board Exam" }));
            } else {
                // If changing to high school, let them keep their goal or select a new one
                setFormData(prev => ({ ...prev, class: value }));
            }
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleEditToggle = () => {
        if (isEditing) {
            if (!formData.name.trim() || !formData.class || !formData.goal) {
                alert("Please fill in all details to save your profile.");
                return;
            }
            
            // Prepare data with the updated setup flag and save it.
            // The subscription will handle updating the local 'user' state.
            updateUser({ ...formData, isInitialSetupComplete: true });
            setIsEditing(false);
            if (navigator.vibrate) navigator.vibrate(10);
        } else {
            setFormData(user); // Reset form data to current user state
            setIsEditing(true);
            if (navigator.vibrate) navigator.vibrate(5);
        }
    };
    
    return (
        <div className="w-full max-w-7xl mx-auto animate-fade-in p-4 text-white">
            <style>{`.animate-fade-in-fast { animation: fade-in 0.2s ease-out forwards; }`}</style>

            {/* --- Header --- */}
            <header className="flex justify-between items-center py-4">
                <h1 className="text-3xl font-bold text-[var(--text-main)]">Settings</h1>
                <button 
                    onClick={handleEditToggle} 
                    className="px-4 py-1.5 rounded-full text-base font-semibold transition-colors bg-[var(--bg-secondary)] text-[var(--accent-blue)] hover:bg-[var(--bg-tertiary)]"
                >
                    {isEditing ? 'Save' : 'Edit'}
                </button>
            </header>

            {/* --- Profile Avatar Section --- */}
            <div className="flex flex-col items-center my-8">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full bg-[var(--bg-secondary)] p-2">
                         {formData.profileImageUrl ? (
                            <img src={formData.profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover"/>
                        ) : (
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-fuchsia-500 via-red-500 to-orange-400 flex items-center justify-center">
                                <UserIcon width={64} height={64} />
                            </div>
                        )}
                    </div>
                    {isEditing && (
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 w-28 h-28 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Change profile picture"
                        >
                            <CameraIcon />
                        </button>
                    )}
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                />

                {!isEditing && (
                    <>
                        <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
                        <p className="text-[var(--text-secondary)]">{user.goal}</p>
                    </>
                )}
            </div>
            
            {/* --- Account Details List --- */}
            <div className="space-y-4">
                <div className="bg-[var(--bg-secondary)] rounded-xl divide-y divide-[var(--border-secondary)]">
                    <SettingsListItem 
                        label="Name" name="name" value={formData.name}
                        placeholder="e.g., Sam Wilson"
                        isEditable isEditing={isEditing} onChange={handleInputChange}
                    />
                     <SettingsListItem 
                        label="Class" name="class" value={formData.class}
                        placeholder="e.g., Class 12th"
                        isEditable isEditing={isEditing} onClick={isEditing ? () => setActiveModal('class') : undefined}
                    />
                    <div className={isEditing && !isHighSchool ? 'opacity-50' : ''}>
                        <SettingsListItem 
                            label="Goal" name="goal" value={formData.goal}
                            placeholder="e.g., IIT-JEE Aspirant"
                            isEditable isEditing={isEditing} 
                            onClick={isEditing && isHighSchool ? () => setActiveModal('goal') : undefined}
                        />
                    </div>
                </div>

                {/* --- General Settings List --- */}
                 <div className="bg-[var(--bg-secondary)] rounded-xl divide-y divide-[var(--border-secondary)]">
                     <SettingsListItem label="Notifications" value="On" onClick={() => alert('Notification settings clicked!')} />
                     <SettingsListItem label="Privacy Policy" onClick={() => alert('Privacy Policy clicked!')} />
                 </div>
                 
                 {/* --- Logout Button --- */}
                  <div className="bg-[var(--bg-secondary)] rounded-xl">
                      <button className="w-full h-12 text-center text-red-500 font-semibold">
                        Log Out
                     </button>
                  </div>
            </div>

            {/* --- Modals for Selection --- */}
            {activeModal === 'class' && (
                <SelectionModal
                    title="Select Class"
                    options={classOptions}
                    selectedValue={formData.class}
                    onClose={() => setActiveModal(null)}
                    onSelect={(value) => handleSelectionChange('class', value)}
                />
            )}
            {activeModal === 'goal' && (
                <SelectionModal
                    title="Select Goal"
                    options={goalOptions}
                    selectedValue={formData.goal}
                    onClose={() => setActiveModal(null)}
                    onSelect={(value) => handleSelectionChange('goal', value)}
                    isSearchable
                />
            )}
        </div>
    );
};