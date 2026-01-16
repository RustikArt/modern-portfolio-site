import SEO from '../components/SEO';
import { Calendar, User, ArrowRight } from 'lucide-react';
import './Blog.css';

const Blog = () => {
    // Mock Data - To be replaced by CMS or MDX later
    const posts = [
        {
            id: 1,
            title: "L'importance de l'UX dans le e-commerce",
            excerpt: "Comment une expérience utilisateur fluide peut augmenter vos conversions de 200%.",
            date: "12 Jan 2026",
            author: "Rustik",
            category: "Design",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 2,
            title: "Les tendances web design 2026",
            excerpt: "Du néo-brutalisme à l'intelligence artificielle générative, décryptage des mouvements à suivre.",
            date: "05 Jan 2026",
            author: "Rustik",
            category: "Tendances",
            image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 3,
            title: "Pourquoi choisir React pour votre site ?",
            excerpt: "Performance, scalabilité et écosystème : les raisons qui font de React le choix n°1.",
            date: "20 Déc 2025",
            author: "DevTeam",
            category: "Tech",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800"
        }
    ];

    return (
        <div className="page page-blog">
            <SEO
                title="Blog"
                description="Actualités, tendances et conseils sur le design web, le développement et le marketing digital."
                url="/blog"
            />

            <div className="container">
                <header className="blog-header">
                    <h1 className="page-title">Journal Créatif</h1>
                    <p>Idées, réflexions et explorations techniques.</p>
                </header>

                <div className="blog-grid">
                    {posts.map(post => (
                        <article key={post.id} className="blog-card">
                            <div className="blog-image">
                                <img src={post.image} alt={post.title} loading="lazy" />
                                <span className="blog-category">{post.category}</span>
                            </div>
                            <div className="blog-content">
                                <div className="blog-meta">
                                    <span><Calendar size={14} /> {post.date}</span>
                                    <span><User size={14} /> {post.author}</span>
                                </div>
                                <h2 className="blog-title">{post.title}</h2>
                                <p className="blog-excerpt">{post.excerpt}</p>
                                <button className="read-more">
                                    Lire l'article <ArrowRight size={16} />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Blog;
