

export interface User {
    name: string;
    class: string;
    goal: string;
    profileImageUrl?: string | null;
    isInitialSetupComplete?: boolean;
}

const USER_STORAGE_KEY = 'orvanta-user';

// Predefined lists for offline-first selection.
const availableClasses = [
    "Class 6th", "Class 7th", "Class 8th", "Class 9th", "Class 10th",
    "Class 11th (Medical)", "Class 11th (Non-Medical)", "Class 11th (Commerce)", "Class 11th (Arts/Humanities)",
    "Class 12th (Medical)", "Class 12th (Non-Medical)", "Class 12th (Commerce)", "Class 12th (Arts/Humanities)"
];

const availableGoals = [
    "IIT-JEE Aspirant", 
    "NEET-UG Aspirant", 
    "UPSC Civil Services", 
    "CA Aspirant",
    "Lawyer (CLAT)",
    "NDA (Lieutenant)",
    "School / Board Exam"
];

let currentUser: User;
const listeners: ((user: User) => void)[] = []; // Array to hold listener callbacks

// Load initial user data from localStorage or use defaults
const loadUser = (): User => {
    try {
        const storedUser = localStorage.getItem(USER_STORAGE_KEY);
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            // Backwards compatibility for users from before this feature
            if (parsedUser.isInitialSetupComplete === undefined) {
                parsedUser.isInitialSetupComplete = !!(parsedUser.name && parsedUser.class && parsedUser.goal);
            }
            return parsedUser;
        }
    } catch (e) {
        console.error("Failed to load user from storage", e);
    }
    // Default user for first-time launch, prompting them to fill details.
    return {
        name: '',
        class: '',
        goal: '',
        profileImageUrl: null,
        isInitialSetupComplete: false,
    };
};

// Initialize the user data on script load
currentUser = loadUser();

/**
 * Notifies all subscribed components of a change in user data.
 */
const notifyListeners = () => {
    listeners.forEach(listener => listener({ ...currentUser }));
};

/**
 * Subscribes a component to user data changes.
 * @param listener - The callback function to execute when data changes.
 * @returns An unsubscribe function.
 */
export const subscribe = (listener: (user: User) => void): (() => void) => {
    listeners.push(listener);
    // Return an unsubscribe function
    return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
            listeners.splice(index, 1);
        }
    };
};


/**
 * Gets a copy of the current user's data.
 * @returns A User object.
 */
export const getUser = (): User => {
    // Return a copy to prevent direct mutation of the service's state
    return { ...currentUser };
};

/**
 * Updates the current user's data, saves it to localStorage, and notifies listeners.
 * @param updatedData - A partial User object containing the fields to update.
 * @returns The updated User object.
 */
export const updateUser = (updatedData: Partial<User>): User => {
    currentUser = { ...currentUser, ...updatedData };
    try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } catch (e) {
        console.error("Failed to save user to storage", e);
    }
    console.log('User data updated and syncing:', currentUser);
    notifyListeners(); // Notify all subscribed components
    return { ...currentUser };
};

/**
 * Gets the list of available classes.
 * @returns An array of strings representing class options.
 */
export const getAvailableClasses = (): string[] => {
    return availableClasses;
};

/**
 * Gets the list of available academic/career goals.
 * @returns An array of strings representing goal options.
 */
export const getAvailableGoals = (): string[] => {
    return availableGoals;
};