// This file will store all the custom data types for our application.

// Defines the structure of a single portfolio project.
export interface Project {
  id: number;
  created_at: string;
  profile_id: number;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}

// Defines the structure of a user profile, including an array of their projects.
export interface Profile {
  id: number;
  created_at: string;
  telegram_id: number;
  username: string;
  bio: string;
  profile_picture_url: string;
  contact_link: string | null;
  profession: string | null;
  projects: Project[]; // A profile can have an array of Project objects
}