import React from 'react';
import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Role-Based Dashboards',
    description: 'Personalized experiences for admins, school reps, teachers, and students.',
  },
  {
    title: 'Smart Course Management',
    description: 'Create courses, enroll students, manage assignments, and grade submissions with ease.',
  },
  {
    title: 'Insights & Analytics',
    description: 'Realtime stats, performance summaries, and actionable insights for every role.',
  },
  {
    title: 'Secure Access',
    description: 'Enterprise-grade security powered by JWT and encrypted data storage.',
  },
];

const LandingPage = () => {
  return (
    <div className="landing container">
      <section className="hero fade-up">
        <div>
          <p className="badge">Modern Learning Platform</p>
          <h1>Smart Learning for Ambitious Schools</h1>
          <p>
            KnowVa brings together admins, school reps, teachers, and students in a single vibrant workspace.
            Launch new schools, empower educators, and keep students on track—all in realtime.
          </p>
          <div className="cta-group">
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn outline-button">
              I already have an account
            </Link>
          </div>
          <div className="stats-highlight">
            <div className="stats-card">
              <h3>Instant Onboarding</h3>
              <div className="value">60s</div>
              <p className="text-muted">to launch a new school</p>
            </div>
            <div className="stats-card delay-1">
              <h3>Real-time Insights</h3>
              <div className="value">360°</div>
              <p className="text-muted">visibility across every role</p>
            </div>
            <div className="stats-card delay-2">
              <h3>Secure by Design</h3>
              <div className="value">100%</div>
              <p className="text-muted">role-based access control</p>
            </div>
          </div>
        </div>
        <div className="hero-graphics">
          <div className="floating-card glass-card fade-up">
            <h4>Today’s Momentum</h4>
            <ul style={{ marginTop: '12px', listStyle: 'none' }}>
              <li>+3 New schools onboarded</li>
              <li>+58 Assignments graded</li>
              <li>98% Student satisfaction</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="fade-up" style={{ marginTop: '60px' }}>
        <h2 style={{ marginBottom: '20px' }}>Why schools choose KnowVa</h2>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.title}>
              <h3>{feature.title}</h3>
              <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-card fade-up" style={{ marginTop: '60px' }}>
        <h2>Built for forward-thinking schools</h2>
        <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>
          From streamlined onboarding to immersive learning analytics, KnowVa adapts to the way your institution works.
          Launch your next cohort in minutes, not weeks.
        </p>
        <div className="cta-group" style={{ marginTop: '20px' }}>
          <Link to="/signup" className="btn btn-primary">
            Launch Your School
          </Link>
          <Link to="/login" className="btn outline-button">
            Explore the dashboards
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

