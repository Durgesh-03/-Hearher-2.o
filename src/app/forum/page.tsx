'use client';

import { useState } from 'react';
import { MessageSquare, ThumbsUp, Send, Shield, Eye, Clock, Filter, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────────

interface ForumPost {
    id: string;
    author: string;
    avatar: string;
    category: string;
    categoryColor: string;
    title: string;
    content: string;
    likes: number;
    replies: number;
    timeAgo: string;
    isAnonymous: boolean;
    tags: string[];
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
    { label: 'All', color: '#8b82a8' },
    { label: '💡 Know Your Rights', color: '#a855f7' },
    { label: '🏢 Workplace Culture', color: '#3b82f6' },
    { label: '🤝 Support', color: '#10b981' },
    { label: '❓ Questions', color: '#f5a623' },
    { label: '📢 Awareness', color: '#e855a0' },
];

const POSTS: ForumPost[] = [
    {
        id: '1', author: 'Anonymous', avatar: '🦋', category: '💡 Know Your Rights', categoryColor: '#a855f7',
        title: 'Can an employer fire you for filing a POSH complaint?',
        content: 'I want to file a complaint but I\'m scared of losing my job. Does the POSH Act protect against retaliation? What if they find indirect ways to push me out?',
        likes: 24, replies: 8, timeAgo: '3 hours ago', isAnonymous: true,
        tags: ['retaliation', 'legal-protection', 'posh-act'],
    },
    {
        id: '2', author: 'Meera K.', avatar: '🌸', category: '🤝 Support', categoryColor: '#10b981',
        title: 'I filed my complaint last week — here\'s what happened',
        content: 'I was terrified but the process was smoother than I expected. The ICC was respectful and thorough. To anyone thinking about filing — it gets better. You\'re not alone.',
        likes: 47, replies: 12, timeAgo: '1 day ago', isAnonymous: false,
        tags: ['experience', 'encouragement', 'icc'],
    },
    {
        id: '3', author: 'Anonymous', avatar: '🔐', category: '❓ Questions', categoryColor: '#f5a623',
        title: 'Is verbal harassment covered under POSH?',
        content: 'My colleague keeps making "jokes" about my appearance. Nothing physical. But it makes me uncomfortable every day. Does this count as harassment under the law?',
        likes: 31, replies: 15, timeAgo: '2 days ago', isAnonymous: true,
        tags: ['verbal-harassment', 'definition', 'posh-act'],
    },
    {
        id: '4', author: 'Priya D.', avatar: '✊', category: '📢 Awareness', categoryColor: '#e855a0',
        title: 'Resources that helped me understand the POSH Act',
        content: 'Sharing a collection of links, videos, and documents that explain the POSH Act in simple language. Especially helpful for those who are new to understanding their rights.',
        likes: 56, replies: 6, timeAgo: '3 days ago', isAnonymous: false,
        tags: ['resources', 'education', 'posh-act'],
    },
    {
        id: '5', author: 'Anonymous', avatar: '🌙', category: '🏢 Workplace Culture', categoryColor: '#3b82f6',
        title: 'How to deal with a hostile work environment without escalating?',
        content: 'The culture in my team is toxic. Inappropriate comments are normalized. I don\'t want to file a formal complaint yet but I want it to stop. Any advice?',
        likes: 19, replies: 22, timeAgo: '4 days ago', isAnonymous: true,
        tags: ['workplace-culture', 'advice', 'toxic-environment'],
    },
    {
        id: '6', author: 'Riya S.', avatar: '💜', category: '🤝 Support', categoryColor: '#10b981',
        title: 'You are not overreacting.',
        content: 'To whoever needs to hear this: if something makes you uncomfortable at work, your feelings are valid. You are not "too sensitive." Trust your instincts.',
        likes: 82, replies: 18, timeAgo: '5 days ago', isAnonymous: false,
        tags: ['support', 'validation', 'community'],
    },
];

// ─── Forum Page ─────────────────────────────────────────────────────────────

export default function ForumPage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [newPostOpen, setNewPostOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [isAnon, setIsAnon] = useState(true);
    const [posts, setPosts] = useState(POSTS);

    const filtered = activeCategory === 'All' ? posts : posts.filter((p) => p.category === activeCategory);

    const handlePost = () => {
        if (!newTitle.trim() || !newContent.trim()) return;
        const post: ForumPost = {
            id: `new-${Date.now()}`,
            author: isAnon ? 'Anonymous' : 'You',
            avatar: isAnon ? '🦋' : '💜',
            category: '❓ Questions',
            categoryColor: '#f5a623',
            title: newTitle,
            content: newContent,
            likes: 0,
            replies: 0,
            timeAgo: 'Just now',
            isAnonymous: isAnon,
            tags: [],
        };
        setPosts([post, ...posts]);
        setNewTitle('');
        setNewContent('');
        setNewPostOpen(false);
    };

    return (
        <main className="min-h-screen px-6 py-10 max-w-4xl mx-auto page-enter">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <Link href="/" className="text-sm text-slate-500 hover:text-[#e855a0] flex items-center gap-1 mb-3 transition-colors">
                        <ArrowLeft size={14} /> Back
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare size={24} className="text-[#e855a0]" />
                        Community Forum
                    </h1>
                    <p className="text-sm text-slate-400">Anonymous discussions about workplace safety</p>
                </div>
                <button
                    onClick={() => setNewPostOpen(!newPostOpen)}
                    className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #e855a0, #a855f7)', color: '#fff' }}
                >
                    + New Post
                </button>
            </div>

            {/* New Post Form */}
            {newPostOpen && (
                <div className="glass-card mb-6" style={{ borderColor: '#e855a030' }}>
                    <div className="flex items-center gap-2 mb-3">
                        <Shield size={14} className="text-[#e855a0]" />
                        <label className="flex items-center gap-2 text-xs cursor-pointer">
                            <input type="checkbox" checked={isAnon} onChange={(e) => setIsAnon(e.target.checked)} className="accent-[#e855a0]" />
                            <span className="text-slate-300">Post anonymously</span>
                        </label>
                    </div>
                    <input
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="Title..."
                        className="w-full bg-[#0d0a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#e855a040] mb-3"
                    />
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="Share your thoughts, ask a question, or offer support..."
                        className="w-full bg-[#0d0a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-[#e855a040] min-h-[80px] resize-none mb-3"
                    />
                    <button onClick={handlePost} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg transition-all hover:scale-105" style={{ background: '#e855a020', color: '#e855a0' }}>
                        <Send size={14} /> Post
                    </button>
                </div>
            )}

            {/* Safety Banner */}
            <div className="rounded-xl p-3 mb-6 flex items-center gap-3" style={{ background: '#10b98108', border: '1px solid #10b98115' }}>
                <Eye size={16} className="text-emerald-400" />
                <p className="text-xs text-slate-400">
                    <strong className="text-emerald-400">Safe Space.</strong> All posts are moderated. No personal details are shared. Anonymous posts cannot be traced back to you.
                </p>
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 flex-wrap mb-6">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.label}
                        onClick={() => setActiveCategory(cat.label)}
                        className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                        style={{
                            background: activeCategory === cat.label ? `${cat.color}18` : 'rgba(255,255,255,0.04)',
                            color: activeCategory === cat.label ? cat.color : '#8b82a8',
                            border: `1px solid ${activeCategory === cat.label ? `${cat.color}30` : 'rgba(255,255,255,0.06)'}`,
                        }}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Posts */}
            <div className="space-y-4">
                {filtered.map((post) => (
                    <div key={post.id} className="glass-card hover:scale-[1.005] transition-all duration-300">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                {post.avatar}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                    <span className="text-xs font-medium text-slate-300">{post.author}</span>
                                    {post.isAnonymous && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: '#a855f712', color: '#a855f7' }}>Anonymous</span>
                                    )}
                                    <span className="text-[10px] text-slate-600 flex items-center gap-1">
                                        <Clock size={10} /> {post.timeAgo}
                                    </span>
                                </div>

                                <span className="text-[10px] px-2 py-0.5 rounded-full inline-block mb-2" style={{ background: `${post.categoryColor}12`, color: post.categoryColor }}>
                                    {post.category}
                                </span>

                                <h3 className="text-sm font-semibold text-white mb-1">{post.title}</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">{post.content}</p>

                                {post.tags.length > 0 && (
                                    <div className="flex gap-1 flex-wrap mt-2">
                                        {post.tags.map((tag) => (
                                            <span key={tag} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.04)', color: '#6b6285' }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center gap-4 mt-3">
                                    <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#e855a0] transition-colors">
                                        <ThumbsUp size={13} /> {post.likes}
                                    </button>
                                    <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#a855f7] transition-colors">
                                        <MessageSquare size={13} /> {post.replies} replies
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
