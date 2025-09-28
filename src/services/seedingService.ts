import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";

const APP_ID = "mockifyneet";

// Define subjects based on your NCERT seed data
const subjects = [
  {
    id: "physics_11",
    name: "Physics Class 11",
    order: 1,
    chapters: [
      "phy11_ch_1",
      "phy11_ch_2",
      "phy11_ch_3",
      "phy11_ch_4",
      "phy11_ch_5",
      "phy11_ch_6",
      "phy11_ch_7",
      "phy11_ch_8",
      "phy11_ch_9",
      "phy11_ch_10",
      "phy11_ch_11",
      "phy11_ch_12",
      "phy11_ch_13",
      "phy11_ch_14",
      "phy11_ch_15",
    ],
  },
  {
    id: "physics_12",
    name: "Physics Class 12",
    order: 2,
    chapters: [
      "phy12_ch_1",
      "phy12_ch_2",
      "phy12_ch_3",
      "phy12_ch_4",
      "phy12_ch_5",
      "phy12_ch_6",
      "phy12_ch_7",
      "phy12_ch_8",
      "phy12_ch_9",
      "phy12_ch_10",
      "phy12_ch_11",
      "phy12_ch_12",
      "phy12_ch_13",
      "phy12_ch_14",
      "phy12_ch_15",
    ],
  },
  {
    id: "chemistry_11",
    name: "Chemistry Class 11",
    order: 3,
    chapters: [
      "che11_ch_1",
      "che11_ch_2",
      "che11_ch_3",
      "che11_ch_4",
      "che11_ch_5",
      "che11_ch_6",
      "che11_ch_7",
      "che11_ch_8",
      "che11_ch_9",
      "che11_ch_10",
      "che11_ch_11",
      "che11_ch_12",
      "che11_ch_13",
      "che11_ch_14",
    ],
  },
  {
    id: "chemistry_12",
    name: "Chemistry Class 12",
    order: 4,
    chapters: [
      "che12_ch_1",
      "che12_ch_2",
      "che12_ch_3",
      "che12_ch_4",
      "che12_ch_5",
      "che12_ch_6",
      "che12_ch_7",
      "che12_ch_8",
      "che12_ch_9",
      "che12_ch_10",
      "che12_ch_11",
      "che12_ch_12",
      "che12_ch_13",
      "che12_ch_14",
      "che12_ch_15",
      "che12_ch_16",
    ],
  },
  {
    id: "biology_11",
    name: "Biology Class 11",
    order: 5,
    chapters: [
      "bio11_ch_1",
      "bio11_ch_2",
      "bio11_ch_3",
      "bio11_ch_4",
      "bio11_ch_5",
      "bio11_ch_6",
      "bio11_ch_7",
      "bio11_ch_8",
      "bio11_ch_9",
      "bio11_ch_10",
      "bio11_ch_11",
      "bio11_ch_12",
      "bio11_ch_13",
      "bio11_ch_14",
      "bio11_ch_15",
      "bio11_ch_16",
      "bio11_ch_17",
      "bio11_ch_18",
      "bio11_ch_19",
      "bio11_ch_20",
      "bio11_ch_21",
      "bio11_ch_22",
    ],
  },
  {
    id: "biology_12",
    name: "Biology Class 12",
    order: 6,
    chapters: [
      "bio12_ch_1",
      "bio12_ch_2",
      "bio12_ch_3",
      "bio12_ch_4",
      "bio12_ch_5",
      "bio12_ch_6",
      "bio12_ch_7",
      "bio12_ch_8",
      "bio12_ch_9",
      "bio12_ch_10",
      "bio12_ch_11",
      "bio12_ch_12",
      "bio12_ch_13",
      "bio12_ch_14",
      "bio12_ch_15",
      "bio12_ch_16",
    ],
  },
];

export const seedSubjects = async (): Promise<void> => {
  try {
    console.log("Starting subjects seeding...");

    const batch = writeBatch(db);
    const subjectsRef = collection(
      db,
      "artifacts",
      APP_ID,
      "public",
      "data",
      "subjects"
    );

    subjects.forEach((subject) => {
      const docRef = doc(subjectsRef, subject.id);
      batch.set(docRef, subject);
    });

    await batch.commit();
    console.log(`Successfully seeded ${subjects.length} subjects`);
  } catch (error) {
    console.error("Error seeding subjects:", error);
    throw error;
  }
};

// Function to get subject name by ID for display purposes
export const getSubjectName = (subjectId: string): string => {
  const subject = subjects.find((s) => s.id === subjectId);
  return subject ? subject.name : subjectId;
};
