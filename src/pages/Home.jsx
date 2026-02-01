import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowRight, Code, ShoppingBag, Star, Layout, Smartphone, Zap } from 'lucide-react';
import './Home.css';
import { WEBSITE_VERSION } from '../version';

const Home = () => {
    const { homeContent, projects } = useData();
    const observerRef = useRef(null);

    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const callback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        };

        const observer = new IntersectionObserver(callback, observerOptions);
        observerRef.current = observer;

        const elements = document.querySelectorAll('.animate-on-scroll');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, []);

    if (!homeContent) return null;

    const { hero, featuredProjects } = homeContent;
    
    // Select top 3 projects for the showcase
    const displayProjects = projects
        .filter(p => featuredProjects.ids.includes(p.id))
        .slice(0, 3);

    return (
        <div className="home-container">
            {/* HERO SECTION - Simple, Centralized, Impactful */}
            <section className="hero-section">
                <div className="hero-content animate-on-scroll fade-up">
                    <div className="hero-badge">
                        <span>L'excellence digitale</span>
                    </div>
                    <h1 className="hero-title">
                        {hero.titleLine1} <span className="text-accent">{hero.titleLine2}</span>
                    </h1>
                    <p className="hero-subtitle">
                        {hero.subtitle}
                    </p>
                    <div className="hero-actions">
                        <Link to="/contact" className="btn btn-primary btn-lg">
                            Démarrer un projet
                        </Link>
                        <Link to="/shop" className="btn btn-secondary btn-lg">
                            Visiter la boutique
                        </Link>
                    </div>
                </div>
                
                {/* Abstract Background Element */}
                <div className="hero-background-elements">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                </div>
            </section>

            {/* GUIDANCE SECTION - Where do you want to go? */}
            <section className="guidance-section section-padding">
                <div className="container">
                    <div className="section-header text-center animate-on-scroll fade-up">
                        <h2>Comment pouvons-nous vous aider ?</h2>
                        <p className="section-subtitle">Une approche sur mesure pour chaque besoin.</p>
                    </div>

                    <div className="guidance-grid">
                        {/* SERVICE PATH */}
                        <Link to="/services" className="guidance-card animate-on-scroll fade-up delay-1">
                            <div className="guidance-icon">
                                <Code size={40} />
                            </div>
                            <h3>Développement Sur Mesure</h3>
                            <p>Sites web, applications et solutions digitales conçus spécifiquement pour votre entreprise.</p>
                            <span className="link-text">En savoir plus <ArrowRight size={16} /></span>
                        </Link>

                        {/* SHOP PATH */}
                        <Link to="/shop" className="guidance-card animate-on-scroll fade-up delay-2">
                            <div className="guidance-icon">
                                <ShoppingBag size={40} />
                            </div>
                            <h3>Boutique & Ressources</h3>
                            <p>Templates, plugins et assets digitaux premium prêts à l'emploi pour vos projets.</p>
                            <span className="link-text">Explorer le catalogue <ArrowRight size={16} /></span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FEATURES / PROCESS - Clean Icons */}
            <section className="features-section section-padding bg-subtle">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-item animate-on-scroll fade-up">
                            <Layout size={32} className="feature-icon" />
                            <h4>Design Moderne</h4>
                            <p>Une esthétique épurée qui met en valeur votre contenu.</p>
                        </div>
                        <div className="feature-item animate-on-scroll fade-up delay-1">
                            <Smartphone size={32} className="feature-icon" />
                            <h4>100% Responsive</h4>
                            <p>Une expérience fluide sur mobile, tablette et desktop.</p>
                        </div>
                        <div className="feature-item animate-on-scroll fade-up delay-2">
                            <Zap size={32} className="feature-icon" />
                            <h4>Performance</h4>
                            <p>Optimisation maximale pour un chargement instantané.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SELECTED WORK - Spacious Showcase */}
            <section className="work-section section-padding">
                <div className="container">
                    <div className="section-header-row animate-on-scroll fade-up">
                        <div>
                            <h2>Réalisations</h2>
                            <p className="section-subtitle">Nos derniers projets marquants.</p>
                        </div>
                        <Link to="/projects" className="btn-link">
                            Tout voir <ArrowRight size={18} />
                        </Link>
                    </div>

                    <div className="projects-showcase">
                        {displayProjects.map((project, idx) => (
                            <Link 
                                to={`/projects/${project.id}`} 
                                key={project.id} 
                                className={`project-showcase-card animate-on-scroll fade-up delay-${idx}`}
                            >
                                <div className="project-img-wrapper">
                                    <img 
                                        src={`${project.image}?v=${WEBSITE_VERSION}`} 
                                        alt={project.title} 
                                        loading="lazy"
                                    />
                                    <div className="project-overlay">
                                        <span className="btn-circle"><ArrowRight size={24} /></span>
                                    </div>
                                </div>
                                <div className="project-info">
                                    <span className="project-cat">{project.category}</span>
                                    <h3>{project.title}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* SOCIAL PROOF - Minimal */}
            <section className="reviews-section section-padding text-center">
                <div className="container">
                    <div className="review-highlight animate-on-scroll zoom-in">
                        <div className="stars">
                            {[1,2,3,4,5].map(i => <Star key={i} size={20} fill="currentColor" />)}
                        </div>
                        <blockquote>
                            "Une expertise technique rare alliée à une sensibilité artistique. 
                            Le résultat a dépassé toutes nos attentes."
                        </blockquote>
                        <cite>— Julien M., CEO TechStart</cite>
                    </div>
                </div>
            </section>

            {/* FINAL CTA */}
            <section className="final-cta-section section-padding">
                <div className="container animate-on-scroll fade-up">
                    <div className="cta-box">
                        <h2>Prêt à concrétiser votre vision ?</h2>
                        <p>Discutons de votre projet et créons quelque chose d'unique.</p>
                        <Link to="/contact" className="btn btn-primary btn-lg">
                            Nous contacter
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
