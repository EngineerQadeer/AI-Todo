# AI To-Do Planner

An intelligent, AI-powered To-Do application designed to help you organize your daily tasks, align them with your personal and spiritual goals, and boost your productivity.

![AI To-Do Planner Screenshot](https://storage.googleapis.com/aistudio-public/gallery/55694589d71c414dcf9c4244b4131278.png)

## ✨ Features

This planner is more than just a to-do list. It's a complete life management tool with a host of powerful features:

-   **🤖 AI-Powered Task Creation**: Simply describe your task in natural language (e.g., "Schedule a team meeting for tomorrow from 2 PM to 3 PM to discuss the project"), and our AI will automatically parse the details, categorize it, and set the time.
-   **🕌 Integrated Prayer Times**:
    -   Automatically fetches daily prayer times for any city in the world.
    -   Prayer times are seamlessly added to your daily schedule as tasks.
    -   Fully customizable settings for juristic methods (Hanafi, Standard) and high-latitude adjustments.
    -   Manual configuration options for full control over your schedule.
-   **💪 Health & Wellness Planning**:
    -   Schedule recurring health activities like gym sessions, sleep, lunch, and dinner.
    -   Enabled activities are automatically added to your daily task list.
-   **📖 Spiritual Wellness Tracker**:
    -   Enable a daily Quran recitation task, which is intelligently scheduled before Fajr prayer.
    -   Customize the duration of your recitation.
    -   Track your progress with the **Quran Completion Tracker**, which visualizes your journey to completing the Quran in 60 days.
-   **📊 Insightful Analytics**: A dedicated analytics panel visualizes your productivity with charts for task completion rates, weekly performance, and task distribution by category.
-   **🎨 Customizable Themes**: Personalize your experience with Light, Dark, and High-Contrast themes to suit your preference and reduce eye strain.
-   **🔔 Smart Notifications**:
    -   Receive reminders for upcoming tasks.
    -   Get notified 15 minutes before each prayer time.
    -   Works with native Windows notifications when installed as a desktop app.
-   **🔄 Effortless Task Management**:
    -   Clean and intuitive dashboard displaying today's tasks.
    -   Filter tasks by status (Pending, Done).
    -   Option to repeat any task for the next day with a single click.
-   **☁️ Data Portability & Offline Access**:
    -   Export all your tasks and settings to a JSON file for backup.
    -   Import your data from a backup file to restore your planner on any device.
    -   **Works Offline**: Thanks to its Progressive Web App (PWA) architecture, the app loads instantly and is fully functional even without an internet connection.

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

-   An active **Google Gemini API Key**. This is required for the AI features. You can get one from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Installation

1.  **Set up your environment variables:**
    The AI features are powered by the Google Gemini API. You'll need to provide your API key.
    -   Create a new file named `.env` in the root of your project directory.
    -   Add the following line to the `.env` file, replacing `your_gemini_api_key_here` with your actual key:
        ```
        API_KEY=your_gemini_api_key_here
        ```
    > **Note:** This application uses your browser's **local storage** for all data persistence (tasks, settings, etc.). It does **not** require a connection to a cloud database like Firebase Firestore, so no additional database keys are needed. The only API key you need is for Google Gemini.

2.  **Run the application:**
    Once the `.env` file is created, the application is ready to run.

## 💻 Desktop Installation (PWA)

You can run this application as a standalone desktop app, just like a native `.exe` file, for a seamless experience. This is possible because it's a Progressive Web App (PWA).

**To install the app on your desktop:**

1.  **Open the app in a supported browser** (like Google Chrome, Microsoft Edge, or Brave).
2.  Look for the **Install icon** in the address bar on the right side. It might look like a computer screen with a downward arrow.
3.  Click the icon and then click **"Install"** in the prompt that appears.
4.  That's it! The application will now be installed on your computer. You can find it in your **Start Menu** and create a shortcut on your **Desktop**. It will open in its own window without browser tabs or the address bar.

## 🔗 Connect with Me

I'd love to hear your feedback or connect with you! Find me on my social platforms:

-   **GitHub**: [@EngineerQadeer](https://github.com/EngineerQadeer)
-   **Facebook**: [@Engineer.Qadeer](https://facebook.com/Engineer.Qadeer)
-   **YouTube**: [@Engineer.Qadeer](https://youtube.com/@Engineer.Qadeer)
-   **Instagram**: [@Engineer.Qadeer](https://www.instagram.com/Engineer.Qadeer)