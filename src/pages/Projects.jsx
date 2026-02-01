import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { WEBSITE_VERSION } from '../version';
import LazyImage from '../components/LazyImage';
import * as LucideIcons from 'lucide-react';
import { useState, useMemo } from 'react';
import './Projects.css';

const Projects = () => {
    const { projects } = useData();
    const [filterCategory, setFilterCategory] = useState('Tous');

    // Filter visible projects and sort by order_position
    const visibleProjects = useMemo(() => {
        let filtered = projects.filter(p => p.isVisible !== false && p.is_visible !== false);
        
        // Filter by category
        if (filterCategory !== 'Tous') {
            filtered = filtered.filter(p => p.category === filterCategory);
        }
        
        // Sort by order_position (lower = first), then by id descending (newest first)
        return filtered.sort((a, b) => {
            const orderA = a.orderPosition || a.order_position || 999;
            const orderB = b.orderPosition || b.order_position || 999;
            if (orderA !== orderB) return orderA - orderB;
            return b.id - a.id;
        });
    }, [projects, filterCategory]);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = [...new Set(projects.filter(p => p.isVisible !== false && p.is_visible !== false).map(p => p.category).filter(Boolean))];
        return ['Tous', ...cats];
    }, [projects]);

    // Render Lucide icon or image
    const renderProjectImage = (project) => {
        const isLucideIcon = project.image && project.image.startsWith('lucide:');
        
        if (isLucideIcon) {
            const iconName = project.image.replace('lucide:', '').split('?')[0];
            const IconComponent = LucideIcons[iconName];
            
            if (IconComponent) {
                return (
                    <div className="project-image lucide-icon-container" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, var(--color-bg) 100%)'
                    }}>
                        <IconComponent size={120} color="var(--color-accent)" strokeWidth={1.5} />
                    </div>
                );
            }
        }
        
        return <LazyImage src={`${project.image}?v=${WEBSITE_VERSION}`} alt={project.title} className="project-image" />;
    };

    return (
        <div className="page page-projects">
            <div className="container">
                <h1 className="page-title">Projets Sélectionnés</h1>
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {/* Category filter */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: filterCategory === cat ? 'var(--color-accent)' : 'rgba(255,255,255,0.05)',
                                    color: filterCategory === cat ? '#000' : '#888',
                                    border: 'none',
                                    borderRadius: '20px',
                                    cursor: 'pointer',
                                    fontSize: '0.85rem',
                                    fontWeight: filterCategory === cat ? '600' : '400',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Results count */}
                <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: '2rem' }}>
                    {visibleProjects.length} projet{visibleProjects.length > 1 ? 's' : ''} trouvé{visibleProjects.length > 1 ? 's' : ''}
                </p>

                <div className="grid-projects">
                    {visibleProjects.map((project) => (
                        <Link to={`/projects/${project.id}`} key={project.id} className="project-card">
                            <div className="project-image-container">
                                {renderProjectImage(project)}
                                <div className="project-overlay">
                                    <span className="view-project">Voir le projet</span>
                                </div>
                            </div>
                            <div className="project-info">
                                <h3>{project.title}</h3>
                                <span>{project.category}</span>
                                {project.description && (
                                    <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem', lineHeight: 1.5 }}>
                                        {project.description.length > 100 ? project.description.slice(0, 100) + '...' : project.description}
                                    </p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {visibleProjects.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: '#555' }}>
                        <p>Aucun projet ne correspond à vos critères.</p>
                        <button 
                            onClick={() => setFilterCategory('Tous')}
                            style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: 'var(--color-accent)', color: '#000', border: 'none', borderRadius: '20px', cursor: 'pointer' }}
                        >
                            Réinitialiser les filtres
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Projects;
