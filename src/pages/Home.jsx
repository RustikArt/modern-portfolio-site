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

    // Fallback if context not ready
    if (!homeContent) return null;

    const { hero, featuredProjects, services, testimonials, stats, cta } = homeContent;

    // Get actual project objects for featured section
    const featuredList = projects.filter(p => featuredProjects.ids.includes(p.id));

    return (
        <div className="page-home">
            {/* HERO SECTION */}
            <section className="hero">
                <div className="container">
                    <h1 className="hero-title">
                        <span className="block-reveal">{hero.titleLine1}</span>
                        <br />
                        <span className="block-reveal">{hero.titleLine2}</span>
                    </h1>
                    <p className="hero-subtitle">{hero.subtitle}</p>
                    <Link to={hero.buttonLink} className="btn btn-primary">{hero.buttonText}</Link>
                </div>
            </section>

            {/* SERVICES SECTION */}
            <section className="services-section">
                <div className="container">
                    <div className="services-grid">
                        {services.map((service) => (
                            <div key={service.id} className="service-card">
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
            <section className="featured-section">
                <div className="container">
                    <div className="section-header">
                        <h2>{featuredProjects.title}</h2>
                        <Link to="/projects" className="btn-link">Voir tout <ArrowRight size={16} /></Link>
                    </div>

                    <div className="featured-grid">
                        {featuredList.length > 0 ? (
                            featuredList.map(project => (
                                <Link to={`/project/${project.id}`} key={project.id} className="project-card">
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
                            <div className="no-projects">
                                <p>Aucun projet mis en avant pour le moment.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* TESTIMONIALS */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="testimonials-grid">
                        {testimonials.map(t => (
                            <div key={t.id} className="testimonial-card">
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
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
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
