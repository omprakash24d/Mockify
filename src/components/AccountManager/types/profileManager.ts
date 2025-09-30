import type { User as FirebaseUser } from "firebase/auth";

export interface ProfileManagerProps {
  user: FirebaseUser;
  isOpen: boolean;
  onClose: () => void;
}

export interface ProfileManagerState {
  isOpen: boolean;
  activeTab: "profile" | "password";
}

export interface ModalProfileManagerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}
