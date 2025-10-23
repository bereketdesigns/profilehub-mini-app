// This file will store all the custom data types for our application.

export interface Project {
  id: number;
  created_at: string;
  profile_id: number;
  title: string;
  description: string;
  image_url: string;
  display_order: number;
}

export interface Profile {
  id: number;
  created_at: string;
  telegram_id: number;
  username: string;
  bio: string;
  profile_picture_url: string;
  contact_link: string | null;
  profession: string | null;
  // !!! THIS IS THE FIX: Add the new property !!!
  portfolio_link: string | null;
  projects: Project[];
}