import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <header className="sticky top-0 z-10 bg-slate-800/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 p-2 border border-blue-500/30">
            <RobotIcon />
          </div>
          <h2 className="text-xl font-semibold text-blue-400">Pickasso HMI</h2>
        </div>
        <SignOutButton />
      </header>
      <main className="flex-1 p-4">
        <div className="w-full max-w-7xl mx-auto">
          <Content />
        </div>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <Authenticated>
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-24 h-24 rounded-2xl bg-blue-500/20 p-4 border-2 border-blue-500/30 animate-pulse">
              <RobotIcon />
            </div>
            <h1 className="text-4xl font-bold text-blue-400">Pickasso HMI Dashboard</h1>
          </div>
          <Dashboard />
        </Authenticated>
        <Unauthenticated>
          <div className="max-w-md mx-auto mt-12 p-8 futuristic-panel">
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto">
                <HappyRobotIcon />
              </div>
              <h1 className="text-4xl font-bold text-blue-400 mt-6">
                Welcome to Pickasso
              </h1>
              <p className="text-xl text-slate-300 mt-4">
                Your AI-Powered Robotic Assistant
              </p>
            </div>
            <SignInForm />
          </div>
        </Unauthenticated>
      </div>
    </div>
  );
}

function RobotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-400">
      <path
        d="M12 2C8.13 2 5 5.13 5 9v7.5c0 1.38 1.12 2.5 2.5 2.5h9c1.38 0 2.5-1.12 2.5-2.5V9c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        fill="currentColor"
      />
      <path
        d="M15 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        fill="currentColor"
      />
      <path
        d="M9 15c0 1.657 1.343 3 3 3s3-1.343 3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HappyRobotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-400">
      <path
        d="M12 2C8.13 2 5 5.13 5 9v7.5c0 1.38 1.12 2.5 2.5 2.5h9c1.38 0 2.5-1.12 2.5-2.5V9c0-3.87-3.13-7-7-7z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        fill="currentColor"
      />
      <path
        d="M15 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
        fill="currentColor"
      />
      <path
        d="M9 15c0 1.657 1.343 3 3 3s3-1.343 3-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M3 10h2M19 10h2M12 2V0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
