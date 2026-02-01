import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import BlockRenderer from '../components/BlockRenderer';
import Breadcrumbs from '../components/Breadcrumbs';
import DOMPurify from 'dompurify';
import * as LucideIcons from 'lucide-react';
import { ExternalLink, Github, Calendar, Clock, User, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const ProjectDetail = () => {
    const { id } = useParams();
    const { projects, currentUser } = useData();
    const project = projects.find(p => p.id === parseInt(id));
    const navigate = useNavigate();
    const [lightboxIndex, setLightboxIndex] = useState(null);

    // Check visibility (admins can always see)
    const isAdmin = currentUser?.role === 'admin';
    const isVisible = project?.isVisible !== false && project?.is_visible !== false;

    if (!project) return <div className="container" style={{ paddingTop: 'calc(140px + var(--banner-height, 0px))' }}>Projet introuvable</div>;
    
    if (!isVisible && !isAdmin) {
        return <div className="container" style={{ paddingTop: 'calc(140px + var(--banner-height, 0px))' }}>Ce projet n'est pas disponible.</div>;
    }

    // Check if project image is a Lucide icon
    const isLucideIcon = project.image && project.image.startsWith('lucide:');
    const iconName = isLucideIcon ? project.image.replace('lucide:', '').split('?')[0] : null;
    const IconComponent = iconName ? LucideIcons[iconName] : null;

    // Get gallery images
    const gallery = project.gallery || [];

    // Format date
    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    };

    const completedDate = formatDate(project.dateCompleted || project.date_completed);
    const technologies = project.technologies || [];
    const externalLink = project.externalLink || project.external_link;
    const githubLink = project.githubLink || project.github_link;
    const testimonial = project.testimonial;
    const testimonialAuthor = project.testimonialAuthor || project.testimonial_author;

    return (
        <div className="page" style={{ paddingTop: 'calc(140px + var(--banner-height, 0px))', minHeight: '100vh' }}>
            <div className="container">
                <Breadcrumbs lastItemName={project.title} />
                
                {/* Admin notice */}
                {!isVisible && isAdmin && (
                    <div style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', color: '#ffc107' }}>
                        ⚠️ Ce projet est masqué. Seuls les admins peuvent le voir.
                    </div>
                )}

                <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', marginBottom: '1rem', fontWeight: 900 }}>{project.title}</h1>
                
                {/* Meta info row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', alignItems: 'center', marginBottom: '2rem' }}>
                    <span style={{ color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{project.category}</span>
                    
                    {project.client && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.9rem' }}>
                            <User size={16} /> {project.client}
                        </span>
                    )}
                    
                    {project.duration && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.9rem' }}>
                            <Clock size={16} /> {project.duration}
                        </span>
                    )}
                    
                    {completedDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#888', fontSize: '0.9rem' }}>
                            <Calendar size={16} /> {completedDate}
                        </span>
                    )}
                </div>

                {/* Technologies */}
                {technologies.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
                        {technologies.map((tech, idx) => (
                            <span key={idx} style={{
                                background: 'rgba(167, 139, 250, 0.1)',
                                color: 'var(--color-accent)',
                                padding: '6px 14px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 500,
                                border: '1px solid rgba(167, 139, 250, 0.2)'
                            }}>
                                {tech}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action buttons */}
                {(externalLink || githubLink) && (
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                        {externalLink && (
                            <a href={externalLink} target="_blank" rel="noopener noreferrer" 
                               style={{
                                   display: 'flex', alignItems: 'center', gap: '0.5rem',
                                   padding: '0.8rem 1.5rem', background: 'var(--color-accent)', color: '#000',
                                   textDecoration: 'none', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem'
                               }}>
                                <ExternalLink size={18} /> Voir le projet
                            </a>
                        )}
                        {githubLink && (
                            <a href={githubLink} target="_blank" rel="noopener noreferrer"
                               style={{
                                   display: 'flex', alignItems: 'center', gap: '0.5rem',
                                   padding: '0.8rem 1.5rem', background: 'transparent', color: '#fff',
                                   textDecoration: 'none', borderRadius: '30px', fontWeight: 600, fontSize: '0.9rem',
                                   border: '1px solid #333'
                               }}>
                                <Github size={18} /> Code source
                            </a>
                        )}
                    </div>
                )}

                {/* Main image */}
                {isLucideIcon && IconComponent ? (
                    <div style={{
                        width: '100%',
                        height: '400px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, var(--color-bg-dark) 0%, var(--color-bg) 100%)',
                        borderRadius: '12px',
                        margin: '2rem 0'
                    }}>
                        <IconComponent size={200} color="var(--color-accent)" strokeWidth={1.5} />
                    </div>
                ) : (
                    <img src={project.image} alt={project.title} style={{ width: '100%', height: 'auto', maxHeight: '600px', objectFit: 'cover', borderRadius: '12px', margin: '2rem 0' }} />
                )}

                {/* Description */}
                {project.description && (
                    <p style={{ fontSize: '1.3rem', color: '#bbb', lineHeight: 1.7, marginBottom: '3rem', maxWidth: '800px' }}>
                        {project.description}
                    </p>
                )}

                {/* Main content */}
                <div className="project-content" style={{ maxWidth: '100%', margin: '0 auto', fontSize: '1.2rem', lineHeight: '1.8' }}>
                    {project.blocks && project.blocks.length > 0 ? (
                        <BlockRenderer blocks={project.blocks} />
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(project.content || '') }} style={{ maxWidth: '800px', margin: '0 auto' }} />
                    )}
                </div>

                {/* Gallery */}
                {gallery.length > 0 && (
                    <div style={{ marginTop: '4rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 700 }}>Galerie</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                            {gallery.map((img, idx) => (
                                <div key={idx} 
                                     onClick={() => setLightboxIndex(idx)}
                                     style={{ 
                                         cursor: 'pointer', 
                                         borderRadius: '12px', 
                                         overflow: 'hidden',
                                         aspectRatio: '16/10',
                                         transition: 'transform 0.3s ease'
                                     }}
                                     onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'}
                                     onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    <img src={img} alt={`${project.title} - ${idx + 1}`} 
                                         style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Testimonial */}
                {testimonial && (
                    <div style={{ 
                        marginTop: '4rem', 
                        padding: '3rem', 
                        background: 'rgba(167, 139, 250, 0.05)', 
                        borderRadius: '16px',
                        borderLeft: '4px solid var(--color-accent)',
                        position: 'relative'
                    }}>
                        <Quote size={40} style={{ position: 'absolute', top: '1.5rem', left: '1.5rem', color: 'var(--color-accent)', opacity: 0.3 }} />
                        <blockquote style={{ fontSize: '1.3rem', fontStyle: 'italic', color: '#ccc', lineHeight: 1.7, margin: 0, paddingLeft: '2rem' }}>
                            "{testimonial}"
                        </blockquote>
                        {testimonialAuthor && (
                            <p style={{ marginTop: '1.5rem', paddingLeft: '2rem', color: 'var(--color-accent)', fontWeight: 600 }}>
                                — {testimonialAuthor}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && gallery.length > 0 && (
                <div 
                    onClick={() => setLightboxIndex(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.95)', zIndex: 10000,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '2rem'
                    }}
                >
                    <button 
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev > 0 ? prev - 1 : gallery.length - 1); }}
                        style={{ position: 'absolute', left: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '1rem', cursor: 'pointer', color: 'white' }}
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <img 
                        src={gallery[lightboxIndex]} 
                        alt=""
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '90%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} 
                    />
                    <button 
                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(prev => prev < gallery.length - 1 ? prev + 1 : 0); }}
                        style={{ position: 'absolute', right: '2rem', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '1rem', cursor: 'pointer', color: 'white' }}
                    >
                        <ChevronRight size={24} />
                    </button>
                    <span style={{ position: 'absolute', bottom: '2rem', color: '#888', fontSize: '0.9rem' }}>
                        {lightboxIndex + 1} / {gallery.length} • Cliquez pour fermer
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProjectDetail;
