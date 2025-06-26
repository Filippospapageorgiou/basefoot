
interface ValidationError {
    error: string
}



/**
 * Users table interface
 */
interface IUser {
    id: number;
    email: string;
    //hash_password: string;
    name: string;
    location: string;
    occupation: string;
    avatar_path: string;
    created_at: Date;
    updated_at: Date | null;
}

/**
 * Sessions table interface
 */
interface Session {
    gui_id: string; // UUID
    user_id: number;
    expires: Date;
    completed: boolean;
}

/**
 * Password resets table interface
 */
interface PasswordReset {
    gui_id: string; // UUID
    user_id: number;
    expires: Date;
    completed: boolean;
}

/**
 * Posts table interface
 */
interface Post {
    id: number;
    user_id: number;
    text: string;
    created: Date;
    visibility: string; // 'public', 'private', 'friends'
}

/**
 * Post attachments table interface
 */
interface PostAttachment {
    id: number;
    post_id: number;
    path: string;
    mime_type: string;
}

/**
 * Post comments table interface
 */
interface PostComment {
    id: number;
    user_id: number;
    post_id: number;
    created_at: Date;
    text: string;
}

/**
 * Post tags table interface (junction table)
 */
interface PostTag {
    post_id: number;
    user_id: number;
}

/**
 * Friends table interface (junction table)
 */
interface Friend {
    friend_id: number;
    user_id: number;
}

/**
 * Notifications table interface
 */
  interface Notification {
    id: number;
    created: Date;
    user_id: number;
    friend_id: number;
    text: string;
    viewed: boolean;
    post_id: number | null;
}

export type {
    ValidationError,
    IUser,
    Session,
    PasswordReset,
    Post,
    PostAttachment,
    PostComment,
    PostTag,
    Friend,
    Notification,
}

