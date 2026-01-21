import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowRight, Palette, Code, Briefcase, TrendingUp, Star, Quote } from 'lucide-react';
import './Home.css';
import { WEBSITE_VERSION } from '../version';

const iconMap = {
    Palette: Palette,
    Code: Code,
    Briefcase: Briefcase,
    TrendingUp: TrendingUp,
    Star: Star,
    Quote: Quote
};

const DynamicIcon = ({ name, size = 24, className }) => {
    const Icon = iconMap[name] || Star;
    return <Icon size={size} className={className} />;
};

const Home = () => {
    const { homeContent, projects } = useData();

    useEffect(() => {
        const observerOptions = {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px' // Slight delay for more natural feel
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    // Always remove 'active' when not intersecting to allow replay
                    entry.target.classList.remove('active');
                }
            });
        }, observerOptions);

        const elements = document.querySelectorAll('.reveal, .zoom-in, .stagger-reveal, .blur-reveal');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [homeContent]);

    // Fallback if context not ready
    if (!homeContent) return null;

    const { hero, featuredProjects, services, testimonials, stats, cta } = homeContent;

    // Get actual project objects for featured section
    const featuredList = projects.filter(p => featuredProjects.ids.includes(p.id));

    // Get selected testimonials from reviews
    const { reviews, products: allProducts } = useData();
    let displayTestimonials = testimonials; // Fallback to default mock ones

    if (homeContent.selectedTestimonials && homeContent.selectedTestimonials.length > 0) {
        const selected = [];
        homeContent.selectedTestimonials.forEach(idStr => {
            const [prodId, revIdx] = idStr.split('-');
            const prodReviews = reviews[prodId];
            if (prodReviews && prodReviews[revIdx]) {
                const rev = prodReviews[revIdx];
                const prod = allProducts.find(p => p.id === parseInt(prodId));
                selected.push({
                    id: idStr,
                    name: rev.user,
                    role: prod ? prod.name : 'Client',
                    quote: rev.comment,
                    image: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' // Default avatar
                });
            }
        });
        if (selected.length > 0) displayTestimonials = selected;
    }

    // Default to at least 4 reviews (using testimonials from homeContent if none selected)
    // If we have fewer than 4 selected, we might want to fill with defaults or just display those.
    // The user said "4 avis par défault sont mis seulement si aucun avis n'ai choisi".
    if (!homeContent.selectedTestimonials || homeContent.selectedTestimonials.length === 0) {
        // We ensure we at least have the mock ones, and maybe duplicate to reach 4 if needed
        const mockDefaults = [
            { id: 'd1', name: "Sophie Martin", role: "CEO, TechFlow", quote: "Une équipe incroyable qui a su transformer notre vision en réalité.", image: "https://placehold.co/100x100/333/FFF?text=SM" },
            { id: 'd2', name: "Thomas Dubois", role: "Directeur Artistique", quote: "Créativité et professionnalisme au rendez-vous. Je recommande !", image: "https://placehold.co/100x100/333/FFF?text=TD" },
            { id: 'd3', name: "Julie Leroux", role: "Product Manager", quote: "Un résultat qui dépasse nos attentes. Un plaisir de collaborer.", image: "https://placehold.co/100x100/333/FFF?text=JL" },
            { id: 'd4', name: "Marc Antoine", role: "Entrepreneur", quote: "Réactivité et talent. Le duo parfait pour mon projet.", image: "https://placehold.co/100x100/333/FFF?text=MA" }
        ];
        displayTestimonials = mockDefaults;
    }

    // For marquee, duplicate the array to ensure smooth looping
    const marqueeList = [...displayTestimonials, ...displayTestimonials, ...displayTestimonials];

    const displayStats = homeContent.stats && homeContent.stats.length > 0 ? homeContent.stats : stats;

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const rotateX = ((centerY - clientY) / centerY) * 5;
        const rotateY = ((clientX - centerX) / centerX) * 5;

        const wrapper = document.querySelector('.hero-content-wrapper');
        if (wrapper) wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    };

    const handleCardMouseMove = (e) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -10;
        const rotateY = ((x - centerX) / centerX) * 10;

        card.style.setProperty('--mouse-x', `${(x / rect.width) * 100}%`);
        card.style.setProperty('--mouse-y', `${(y / rect.height) * 100}%`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
    };

    const handleCardMouseLeave = (e) => {
        e.currentTarget.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
    };

    return (
        <div className="page-home">
            {/* HERO SECTION */}
            <section className="hero" onMouseMove={handleMouseMove} onMouseLeave={() => {
                const wrapper = document.querySelector('.hero-content-wrapper');
                if (wrapper) wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
            }}>
                <div className="floating-bg one"></div>
                <div className="floating-bg two"></div>
                <div className="floating-bg three"></div>

                <div className="container hero-content-wrapper">
                    <h1 className="hero-title reveal">
                        <span className="block-reveal">{hero.titleLine1}</span>
                        <br />
                        <span className="block-reveal">{hero.titleLine2}</span>
                    </h1>
                    <p className="hero-subtitle reveal reveal-delay-1">{hero.subtitle}</p>
                    <div className="reveal reveal-delay-2">
                        <Link to={hero.buttonLink} className="btn btn-primary">{hero.buttonText}</Link>
                    </div>
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section className="services-section">
                <div className="container">
                    <div className="services-grid stagger-reveal">
                        {services.map((service) => (
                            <div
                                key={service.id}
                                className="service-card reveal"
                                onMouseMove={handleCardMouseMove}
                                onMouseLeave={handleCardMouseLeave}
                            >
                                <div className="service-icon">
                                    <DynamicIcon name={service.icon} size={32} />
                                </div>
                                <h3>{service.title}</h3>
                                <p>{service.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED PROJECTS */}
            <section className="featured-section reveal">
                <div className="container">
                    <div className="section-header">
                        <h2>{featuredProjects.title}</h2>
                        <Link to="/projects" className="btn-link">Voir tout <ArrowRight size={16} /></Link>
                    </div>

                    <div className="featured-grid blur-reveal">
                        {featuredList.length > 0 ? (
                            featuredList.map((project, index) => (
                                <Link
                                    to={`/projects/${project.id}`}
                                    key={project.id}
                                    className={`project-card reveal project-card-${index + 1}`}
                                    onMouseMove={handleCardMouseMove}
                                    onMouseLeave={handleCardMouseLeave}
                                >
                                    <div className="project-image-container">
                                        <div className="project-number">0{index + 1}</div>
                                        <div className="project-image">
                                            <img
                                                src={`${project.image}?v=${WEBSITE_VERSION}`}
                                                alt={project.title}
                                                loading="eager"
                                            />
                                        </div>
                                    </div>
                                    <div className="project-content">
                                        <span className="project-category">{project.category}</span>
                                        <h3 className="project-title">{project.title}</h3>
                                        <div className="project-view-more">
                                            <span>Découvrir le projet</span>
                                            <ArrowRight size={16} />
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="no-projects reveal">
                                <p>Aucun projet mis en avant pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="testimonials-section">
                <div className="testimonials-wrapper">
                    <div className="testimonials-track">
                        {marqueeList.map((t, idx) => (
                            <div key={`${t.id}-${idx}`} className="testimonial-card">
                                <Quote size={40} className="quote-icon" />
                                <p className="testimonial-text">"{t.quote}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">
                                        <img src={t.image} alt={t.name} />
                                    </div>
                                    <div>
                                        <h4>{t.name}</h4>
                                        <span>{t.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* STATS */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {displayStats.map(s => (
                            <div key={s.id} className="stat-item">
                                <span className="stat-value">{s.value}</span>
                                <span className="stat-label">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA SECTION */}
            <section className="cta-section reveal">
                <div className="container">
                    <div className="cta-content zoom-in reveal-delay-1">
                        <h2>{cta.title}</h2>
                        <p>{cta.text}</p>
                        <Link to={cta.buttonLink} className="btn btn-primary">{cta.buttonText}</Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
