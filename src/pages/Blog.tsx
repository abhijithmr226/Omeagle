import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BlogPage } from '../components/Pages/BlogPage';
import { usePageMeta } from '../hooks/usePageMeta';

interface BlogProps {
  article?: 'article1' | 'article2' | 'article3' | 'article4' | 'article5' | 'article6';
}

const ARTICLE_TITLES: Record<string, { title: string; desc: string }> = {
  article1: {
    title: 'Omeagle: The Best Free Random Video Chat Platform in 2026',
    desc: 'Discover how Omeagle connects you with strangers worldwide through free random video chat and text chat. No sign up. No fees.'
  },
  article2: {
    title: 'Top 10 Omegle Alternatives in 2026 — Free Video Chat Apps',
    desc: 'Omegle shut down in 2023. Here are the best alternatives for random video chat with strangers, ranked by features, safety, and ease of use.'
  },
  article3: {
    title: 'How to Video Chat with Strangers Safely — 10 Tips for 2026',
    desc: 'Stay safe while talking to strangers online. Learn the 10 essential rules for anonymous video chat — from privacy to handling bad actors.'
  },
  article4: {
    title: 'Best Omegle Alternative With No Sign Up (OmeTV vs Omeagle)',
    desc: 'OmeTV charges for filters. Chatroulette requires Google login. Here is why Omeagle is the only true no-sign-up alternative that actually works.'
  },
  article5: {
    title: 'No Sign Up Video Chat Sites That Actually Work in 2026',
    desc: 'Most "free" chat sites hide paywalls behind sign-up forms. Here are the only video chat platforms that work instantly in your browser.'
  },
  article6: {
    title: 'Text Chat with Strangers — Free Anonymous Text Chat in 2026',
    desc: 'Not ready for video? Anonymous text chat with strangers is faster, more private, and less awkward. Here is everything you need to know.'
  }
};

export const Blog: React.FC<BlogProps> = ({ article }) => {
  const navigate = useNavigate();
  const meta = article && ARTICLE_TITLES[article] ? ARTICLE_TITLES[article] : {
    title: 'Omeagle Blog — Video Chat Tips, Safety Guides & Omegle Alternatives (2026)',
    desc: 'The official Omeagle blog. Expert guides on video chat safety, the best Omegle alternatives, how WebRTC works, and no sign-up chat sites.'
  };

  usePageMeta(meta.title, meta.desc);
  return <BlogPage initialArticle={article} onBack={() => navigate('/blog')} />;
};
