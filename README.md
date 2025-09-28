# Mockify - Test Generation Platform

Mockify is a comprehensive test-generation and practice platform designed for instructors, coaching admins, and students. It enables users to create tailored tests, generate well-formatted PDFs, manage question banks, and track analytics for adaptive learning.

## 🚀 Features

- **4-Step Test Creation Wizard**: Intuitive interface to create custom tests
- **PDF Generation**: Download well-formatted test papers and answer keys
- **Firebase Integration**: Secure authentication and real-time database
- **Question Bank Management**: Centralized, searchable, and versioned questions
- **Analytics Dashboard**: Track performance and generate insights
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Subject & Chapter Organization**: Structured content management
- **Multiple Difficulty Levels**: Easy, Medium, and Hard question filtering

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Firebase (Auth + Firestore + Storage)
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **Routing**: React Router DOM

## 📦 Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd mockify
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Firebase**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Enable Storage
   - Copy your Firebase configuration to `src/lib/firebase.ts`

4. **Set up environment variables**:
   Create a `.env` file in the root directory:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your_app_id
   ```

## 🏃‍♂️ Development

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Build for production**:

   ```bash
   npm run build
   ```

3. **Preview production build**:

   ```bash
   npm run preview
   ```

## 📁 Project Structure

```src/
├── components/          # React components
│   ├── AuthScreen.tsx
│   ├── CreateTestWizard.tsx
│   ├── Dashboard.tsx
│   ├── LoadingSpinner.tsx
│   └── Navbar.tsx
├── lib/
│   ├── firebase.ts      # Firebase configuration
│   └── utils.ts         # Utility functions
├── services/
│   ├── firestore.ts     # Firestore operations
│   └── pdfGenerator.ts  # PDF generation service
├── types/
│   └── index.ts         # TypeScript type definitions
├── App.tsx              # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 🔧 Firebase Collections Schema

### Questions Collection

```typescript
artifacts/{appId}/public/data/questions/{questionId}
{
  id: string,
  exam: string,
  subject_id: string,
  chapter_id: string,
  difficulty: 'easy' | 'medium' | 'hard',
  question_text: string,
  options: Array<{label: string, text: string}>,
  correct_answer_index: number,
  // ... other fields
}
```

### Subjects Collection

```typescript
artifacts/{appId}/public/data/subjects/{subjectId}
{
  id: string,
  name: string,
  order: number,
  chapters: string[]
}
```

### Chapters Collection

```typescript
artifacts/{appId}/public/data/chapters/{chapterId}
{
  id: string,
  name: string,
  subject_id: string,
  topics: string[]
}
```

## 🎯 Usage

1. **Authentication**: Sign up or log in using email/password or Google OAuth
2. **Create Test**: Use the 4-step wizard to create custom tests
3. **Generate PDF**: Download test papers and answer keys
4. **Dashboard**: View analytics and manage your tests
5. **Question Bank**: Browse and search questions by subject/chapter

## 🔮 Upcoming Features

- [ ] Advanced analytics with performance insights
- [ ] Question bookmarking and notes
- [ ] Batch PDF generation
- [ ] Custom branding options
- [ ] Mobile app (React Native)
- [ ] Collaborative test creation
- [ ] AI-powered question suggestions

## 📊 Pre-seeded Data

The application comes with pre-seeded data ready for testing:

- **6 Subjects**: Physics Class 11/12, Chemistry Class 11/12, Biology Class 11/12
- **98 NCERT Chapters**: Complete chapter structure for all subjects
- **257 Sample Questions**: Primarily Biology questions with proper categorization

## Test the Data

Visit `/data-test` to explore the seeded data interactively:

1. Browse subjects and their chapters
2. View sample questions with solutions
3. Test the database connectivity

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

For support, email <support@mockify.com> or join our Discord community.

---

## **Built with ❤️ for educators and students worldwide**
