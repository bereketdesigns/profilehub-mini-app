// This file defines the "shape" of our data objects for use with TypeScript.

// Defines a single portfolio project item.
export interface Project {
  id: number;
  profile_id: number;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
  created_at: string;
}

// Defines a user profile.
// It now includes an array of its associated projects.
export interface Profile {
  id: number;
  telegram_id: number;
  username: string;
  bio: string;
  profile_picture_url: string;
  contact_link?: string; // Optional field
  profession?: string;   // Optional field
  created_at: string;
  projects: Project[]; // A profile contains an array of its projects
}