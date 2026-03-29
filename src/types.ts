export interface User {
  id: number;
  email: string;
  name: string;
  role: 'student' | 'expert';
  expertise?: string;
  bio?: string;
  resume_url?: string;
  photo_url?: string;
  college?: string;
  city?: string;
  state?: string;
  github_url?: string;
  linkedin_url?: string;
  skills?: string;
  grad_year?: string;
  company?: string;
  years_of_experience?: string;
}

export interface AptitudeScore {
  id: number;
  student_id: number;
  section: string;
  score: number;
  total: number;
  is_mock: boolean;
  timestamp: string;
}

export interface Availability {
  id: number;
  expert_id: number;
  start_time: string;
  end_time: string;
  status: 'available' | 'booked';
}

export interface Booking {
  id: number;
  student_id: number;
  expert_id: number;
  role: string;
  start_time: string;
  end_time: string;
  meet_link: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  rating?: number;
  feedback?: string;
  expert_joined: boolean;
  expert_name?: string;
  student_name?: string;
  student_email?: string;
  student_bio?: string;
  student_photo?: string;
  student_resume?: string;
  student_github?: string;
  student_linkedin?: string;
  student_college?: string;
  student_city?: string;
  student_state?: string;
  student_skills?: string;
  student_grad_year?: string;
}

export interface Question {
  id: number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
}
