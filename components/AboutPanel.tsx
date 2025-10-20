import React from 'react';
import { GitHubIcon, FacebookIcon, YouTubeIcon, InstagramIcon } from './icons';

const SocialLink: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-3 text-text-secondary hover:text-primary transition-colors group"
    >
        <div className="w-8 h-8 group-hover:scale-110 transition-transform">{icon}</div>
        <span className="font-medium">{label}</span>
    </a>
);

const AboutPanel: React.FC = () => {
    return (
        <div>
            <h2 className="text-3xl font-bold text-text-primary mb-6">About AI To-Do Planner</h2>
            <div className="bg-base-100 p-8 rounded-xl shadow-md max-w-4xl mx-auto space-y-10 text-text-primary">

                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold border-b border-base-300 pb-2 text-primary">Our Vision</h3>
                    <p className="text-lg leading-relaxed text-text-secondary">
                        To create a world where everyone can achieve their personal and spiritual goals with clarity and peace. We envision a smart, intuitive planner that not only organizes your daily tasks but also aligns them with your deeper values, helping you live a more fulfilled and balanced life.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold border-b border-base-300 pb-2 text-primary">Our Mission</h3>
                    <p className="text-lg leading-relaxed text-text-secondary">
                        Our mission is to empower individuals by providing an intelligent, AI-driven tool that simplifies task management and integrates spiritual practices, like prayer times, seamlessly into their daily routine. We are committed to building a planner that is not just a to-do list, but a companion for personal growth, productivity, and well-being.
                    </p>
                </div>

                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold border-b border-base-300 pb-2 text-primary">Connect with Us</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                        <SocialLink href="https://github.com/EngineerQadeer" icon={<GitHubIcon />} label="GitHub" />
                        <SocialLink href="https://facebook.com/Engineer.Qadeer" icon={<FacebookIcon />} label="Facebook" />
                        <SocialLink href="https://youtube.com/@Engineer.Qadeer" icon={<YouTubeIcon />} label="YouTube" />
                        <SocialLink href="https://www.instagram.com/Engineer.Qadeer" icon={<InstagramIcon />} label="Instagram" />
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AboutPanel;
