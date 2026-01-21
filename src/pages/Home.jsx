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

        const elements = document.querySelectorAll('.reveal, .zoom-in, .stagger-reveal');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [homeContent]);

    // Fallback if context not ready
    if (!homeContent) return null;

    const { hero, featuredProjects, services, testimonials, stats, cta } = homeContent;

    // Get actual project objects for featured section
    const featuredList = projects.filter(p => featuredProjects.ids.includes(p.id));

    const handleMouseMove = (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // Calculate tilt
        const rotateX = ((centerY - clientY) / centerY) * 5; // Max 5 deg
        const rotateY = ((clientX - centerX) / centerX) * 5;

        const wrapper = document.querySelector('.hero-content-wrapper');
        if (wrapper) {
            wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
        }
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
                            <div key={service.id} className="service-card reveal">
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

                    <div className="featured-grid stagger-reveal">
                        {featuredList.length > 0 ? (
                            featuredList.map(project => (
                                <Link to={`/project/${project.id}`} key={project.id} className="project-card reveal">
                                    <div className="project-image">
                                        <img src={`${project.image}?v=${WEBSITE_VERSION}`} alt={project.title} />
                                    </div>
                                    <div className="project-info">
                                        <span className="project-category">{project.category}</span>
                                        <h3>{project.title}</h3>
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
            <section className="testimonials-section zoom-in">
                <div className="container">
                    <div className="testimonials-grid stagger-reveal">
                        {testimonials.map(t => (
                            <div key={t.id} className="testimonial-card reveal">
                                <Quote size={40} className="quote-icon" />
                                <p className="testimonial-text">"{t.quote}"</p>
                                <div className="testimonial-author">
                                    <img src={t.image} alt={t.name} />
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
                        {stats.map(s => (
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
