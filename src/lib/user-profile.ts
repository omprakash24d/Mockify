import type { User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import type { CoachingDetailsFormData } from "./validations";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  coachingName?: string;
  phoneNumber?: string;
  coachingLogo?: string;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserProfileService {
  private static getDefaultLogo(): string {
    // Return a default school/education icon URL or base64
    return "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzYjgyZjYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJtNCAxMSAxNi01IDE2IDUiLz48cGF0aCBkPSJtMiAxNSA2IDQgNiA0IDYtNCA2LTQiLz48cGF0aCBkPSJNNiA4djEwYzAgMyAzIDQgNiA0czYtMSA2LTRWOCIvPjwvc3ZnPg==";
  }

  static async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(db, "userProfiles", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }

  static async createUserProfile(
    user: User,
    additionalData?: Partial<CoachingDetailsFormData>
  ): Promise<UserProfile> {
    const now = new Date();
    const profileData: UserProfile = {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || "",
      coachingName: additionalData?.coachingName,
      phoneNumber: additionalData?.phoneNumber,
      coachingLogo: additionalData?.coachingLogo || this.getDefaultLogo(),
      profileCompleted: !!(
        additionalData?.coachingName && additionalData?.phoneNumber
      ),
      createdAt: now,
      updatedAt: now,
    };

    try {
      const docRef = doc(db, "userProfiles", user.uid);
      await setDoc(docRef, {
        ...profileData,
        createdAt: now,
        updatedAt: now,
      });

      return profileData;
    } catch (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }
  }

  static async updateUserProfile(
    uid: string,
    updateData: Partial<CoachingDetailsFormData> & { displayName?: string }
  ): Promise<void> {
    try {
      const docRef = doc(db, "userProfiles", uid);
      const updatePayload: Partial<CoachingDetailsFormData> & {
        displayName?: string;
        updatedAt: Date;
        profileCompleted?: boolean;
      } = {
        ...updateData,
        updatedAt: new Date(),
      };

      // Mark profile as completed if all required fields are present
      if (updateData.coachingName && updateData.phoneNumber) {
        updatePayload.profileCompleted = true;
      }

      // Set default logo if not provided
      if (!updateData.coachingLogo) {
        updatePayload.coachingLogo = this.getDefaultLogo();
      }

      await updateDoc(docRef, updatePayload);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  }

  static async isProfileComplete(uid: string): Promise<boolean> {
    const profile = await this.getUserProfile(uid);
    return profile?.profileCompleted || false;
  }

  static async needsCoachingDetails(user: User): Promise<boolean> {
    const profile = await this.getUserProfile(user.uid);

    if (!profile) {
      return true; // New user needs all details
    }

    // Check if essential coaching details are missing
    const hasCoachingName =
      profile.coachingName && profile.coachingName.trim().length > 0;
    const hasPhoneNumber =
      profile.phoneNumber && profile.phoneNumber.trim().length >= 10;

    return !hasCoachingName || !hasPhoneNumber || !profile.profileCompleted;
  }
}

export default UserProfileService;
